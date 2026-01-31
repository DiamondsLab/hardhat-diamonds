import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { Diamond } from "@diamondslab/diamonds";
import chalk from "chalk";
import { keccak256, toUtf8Bytes } from "ethers";
import { FlattenError, ErrorCodes } from "./FlattenError";
import type {
  DiamondFlattenOptions,
  DiscoveredFacet,
  DiamondContractInfo,
  SelectorInfo,
} from "../tasks/shared/TaskOptions";

/**
 * DiamondFlattener class - Core engine for Diamond contract discovery and analysis
 *
 * This class integrates with the @diamondslab/diamonds module to automatically discover,
 * analyze, and map all facets within an ERC-2535 Diamond Proxy contract. It provides
 * robust error handling with both critical errors (throw) and non-critical warnings (collect).
 *
 * @example
 * ```typescript
 * const flattener = new DiamondFlattener(hre, {
 *   diamondName: 'ExampleDiamond',
 *   outputPath: './flattened/ExampleDiamond.sol',
 *   networkName: 'localhost',
 *   verbose: true
 * });
 *
 * const facets = await flattener.discoverFacets();
 * const selectorMap = await flattener.buildSelectorMap(facets);
 * const diamondContract = await flattener.discoverDiamondContract();
 * ```
 */
export class DiamondFlattener {
  private hre: HardhatRuntimeEnvironment;
  private options: Required<DiamondFlattenOptions>;
  private diamond: Diamond | null = null;
  private warnings: string[] = [];

  /**
   * Creates a new DiamondFlattener instance
   *
   * @param hre - Hardhat runtime environment
   * @param options - Configuration options for flattening (partial, defaults will be applied)
   * @throws {FlattenError} If Diamond configuration is not found or initialization fails
   */
  constructor(
    hre: HardhatRuntimeEnvironment,
    options: Partial<DiamondFlattenOptions> & {
      diamondName: string;
      outputPath: string;
    }
  ) {
    this.hre = hre;

    // Apply default values for optional options
    this.options = {
      diamondName: options.diamondName,
      outputPath: options.outputPath,
      networkName: options.networkName ?? hre.network.name,
      chainId:
        options.chainId ??
        (hre.network.config.chainId as number | undefined) ??
        31337,
      diamondsPath:
        options.diamondsPath ??
        hre.config.diamonds?.paths?.[options.diamondName]?.deploymentsPath ??
        "diamonds",
      contractsPath:
        options.contractsPath ??
        hre.config.diamonds?.paths?.[options.diamondName]?.contractsPath ??
        "contracts",
      verbose: options.verbose ?? false,
      hre: hre,
    };

    this.log(
      chalk.blue(
        `Initializing DiamondFlattener for ${this.options.diamondName}`
      )
    );

    // Initialize Diamond instance
    this.initializeDiamond();
  }

  /**
   * Initializes the Diamond instance from @diamondslab/diamonds module
   *
   * @private
   * @throws {FlattenError} If Diamond configuration not found or instance initialization fails
   */
  private initializeDiamond(): void {
    const { diamondName } = this.options;

    // Check if Diamond configuration exists in Hardhat config
    if (!this.hre.config.diamonds?.paths?.[diamondName]) {
      throw new FlattenError(
        `Diamond configuration for '${diamondName}' not found in Hardhat config. ` +
          `Make sure you have configured the Diamond in hardhat.config.ts under diamonds.paths.${diamondName}`,
        ErrorCodes.DIAMOND_NOT_FOUND,
        {
          diamondName,
          availableDiamonds: Object.keys(this.hre.config.diamonds?.paths ?? {}),
        }
      );
    }

    try {
      // TODO: Initialize Diamond instance from @diamondslab/diamonds module
      // This will be implemented when we integrate with the actual Diamond class
      // For now, we'll set it to null and rely on fallback mechanisms
      this.diamond = null;

      this.log(
        chalk.green(`✓ Diamond configuration loaded for ${diamondName}`)
      );

      if (!this.diamond) {
        this.log(
          chalk.yellow(
            `⚠ Diamond instance not initialized - will use fallback mechanisms`
          )
        );
      }
    } catch (error) {
      throw new FlattenError(
        `Failed to initialize Diamond instance for '${diamondName}': ${error instanceof Error ? error.message : String(error)}`,
        ErrorCodes.DIAMOND_INITIALIZATION_FAILED,
        { diamondName, originalError: error }
      );
    }
  }

  /**
   * Logs a message to console if verbose mode is enabled
   *
   * @private
   * @param message - Message to log (can include chalk colors)
   */
  private log(message: string): void {
    if (this.options.verbose) {
      console.log(message);
    }
  }

  /**
   * Adds a warning to the warnings collection
   *
   * Warnings are non-critical issues that don't stop execution but should be
   * reported to the user. Examples: missing source files, duplicate selectors.
   *
   * @private
   * @param warning - Warning message to add
   */
  private addWarning(warning: string): void {
    this.warnings.push(warning);
    this.log(chalk.yellow(`⚠ ${warning}`));
  }

  /**
   * Retrieves all accumulated warnings
   *
   * @returns Array of warning messages
   */
  public getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Clears all accumulated warnings
   */
  public clearWarnings(): void {
    this.warnings = [];
  }

  /**
   * Resolves the contract source path for a given contract name
   *
   * Searches for the contract in multiple locations with the following priority:
   * 1. Hardhat artifacts directory (compiled contracts)
   * 2. Source contracts directory
   * 3. Configuration-specified paths
   *
   * @private
   * @param contractName - Name of the contract to locate
   * @returns Promise resolving to the contract path, or null if not found
   */
  private async resolveContractPath(
    contractName: string
  ): Promise<string | null> {
    const { contractsPath } = this.options;
    const artifactsPath = this.hre.config.paths.artifacts;
    const sourcesPath = this.hre.config.paths.sources;

    const searchPaths = [
      // Search in artifacts (compiled contracts)
      `${artifactsPath}/contracts/${contractsPath}/${contractName}.sol/${contractName}.json`,
      `${artifactsPath}/contracts/${contractName}.sol/${contractName}.json`,
      // Search in source contracts
      `${sourcesPath}/${contractsPath}/${contractName}.sol`,
      `${sourcesPath}/${contractName}.sol`,
      // Search in diamonds contracts path
      `${sourcesPath}/examplediamond/${contractName}.sol`,
      `${sourcesPath}/facets/${contractName}.sol`,
    ];

    this.log(
      chalk.gray(
        `  Searching for ${contractName} in ${searchPaths.length} locations...`
      )
    );

    for (const path of searchPaths) {
      this.log(chalk.gray(`    Checking: ${path}`));
      try {
        const fs = await import("fs/promises");
        await fs.access(path);
        this.log(chalk.green(`    ✓ Found at: ${path}`));
        return path;
      } catch {
        // File not found, continue to next path
      }
    }

    this.log(chalk.yellow(`    ⚠ Not found in any location`));
    return null;
  }

  /**
   * Checks if a facet is an initialization contract
   *
   * Initialization contracts are special facets used for Diamond initialization
   * or upgrades. They are identified by:
   * 1. Being listed as protocolInitFacet in the deployment config
   * 2. Having deployInit or upgradeInit functions defined
   * 3. Naming conventions (ends with "Init", "InitFacet", etc.)
   *
   * @private
   * @param facetName - Name of the facet to check
   * @param deployConfig - Deployment configuration containing init facet info
   * @returns True if this is an initialization contract
   */
  private isInitContract(facetName: string, deployConfig: any): boolean {
    // Check if it's the protocol init facet
    if (deployConfig.protocolInitFacet === facetName) {
      return true;
    }

    // Check if any version has deployInit or upgradeInit
    const facetConfig = deployConfig.facets?.[facetName];
    if (facetConfig?.versions) {
      for (const versionConfig of Object.values(facetConfig.versions)) {
        const version = versionConfig as any;
        if (version.deployInit || version.upgradeInit) {
          return true;
        }
      }
    }

    // Check naming conventions
    const initPatterns = [/Init$/, /InitFacet$/, /Initializ/, /Diamond.*Init/i];
    return initPatterns.some((pattern) => pattern.test(facetName));
  }

  /**
   * Discovers all facets from Diamond configuration
   *
   * This method reads the Diamond deployment configuration, resolves contract paths,
   * identifies initialization contracts, and sorts facets by priority. Non-critical
   * issues (like missing source files) are collected as warnings rather than errors.
   *
   * @returns Promise resolving to array of discovered facets
   * @throws {FlattenError} Only for critical configuration errors
   */
  public async discoverFacets(): Promise<DiscoveredFacet[]> {
    this.log(
      chalk.blue(`Discovering facets for ${this.options.diamondName}...`)
    );

    try {
      // Get deployment configuration
      const deployConfig = this.diamond
        ? this.diamond.getDeployConfig()
        : await this.loadDeployConfigFallback();

      if (
        !deployConfig ||
        !deployConfig.facets ||
        Object.keys(deployConfig.facets).length === 0
      ) {
        this.addWarning(`No facets configured for ${this.options.diamondName}`);
        return [];
      }

      const facets: DiscoveredFacet[] = [];
      const facetEntries = Object.entries(deployConfig.facets);

      this.log(
        chalk.gray(`  Found ${facetEntries.length} facets in configuration`)
      );

      // Process each facet
      for (const [facetName, facetConfig] of facetEntries) {
        try {
          this.log(chalk.gray(`  Processing facet: ${facetName}`));

          // Resolve contract source path
          const contractPath = await this.resolveContractPath(facetName);
          if (!contractPath) {
            this.addWarning(`Source file not found for facet: ${facetName}`);
          }

          // Check if this is an initialization contract
          const isInit = this.isInitContract(facetName, deployConfig);

          // Extract version information (use latest/highest version)
          let version = "0.0";
          const versions = (facetConfig as any).versions || {};
          const versionKeys = Object.keys(versions);
          if (versionKeys.length > 0) {
            version = versionKeys[versionKeys.length - 1];
          }

          // Get priority for sorting
          const priority = (facetConfig as any).priority || 999;

          // Create discovered facet object
          const discoveredFacet: DiscoveredFacet = {
            name: facetName,
            contractPath: contractPath || "",
            selectors: [], // Will be filled in by buildSelectorMap
            isInit,
            priority, // Add priority for sorting
            version, // Add version info
          };

          facets.push(discoveredFacet);
          this.log(
            chalk.green(
              `    ✓ Discovered ${facetName} (priority: ${priority}, init: ${isInit})`
            )
          );
        } catch (error) {
          // Non-critical error for individual facet - add warning and continue
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.addWarning(
            `Failed to process facet ${facetName}: ${errorMessage}`
          );
        }
      }

      // Sort facets by priority (ascending)
      facets.sort((a, b) => (a as any).priority - (b as any).priority);

      this.log(chalk.green(`✓ Discovered ${facets.length} facets`));
      return facets;
    } catch (error) {
      // Critical error - throw FlattenError
      throw new FlattenError(
        `Failed to discover facets for ${this.options.diamondName}: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCodes.INVALID_CONFIGURATION,
        { diamondName: this.options.diamondName, originalError: error }
      );
    }
  }

  /**
   * Loads deployment configuration as fallback when Diamond instance not available
   *
   * @private
   * @returns Promise resolving to deployment configuration
   */
  private async loadDeployConfigFallback(): Promise<any> {
    const { diamondsPath, diamondName } = this.options;
    const configPath = `${diamondsPath}/${diamondName}/${diamondName.toLowerCase()}.config.json`;

    this.log(
      chalk.yellow(`  Using fallback: loading config from ${configPath}`)
    );

    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      // Make path absolute relative to HRE root
      const absoluteConfigPath = path.resolve(
        this.hre.config.paths.root,
        configPath
      );
      const configContent = await fs.readFile(absoluteConfigPath, "utf-8");
      return JSON.parse(configContent);
    } catch (error) {
      throw new FlattenError(
        `Failed to load deployment configuration from ${configPath}`,
        ErrorCodes.FILE_SYSTEM_ERROR,
        { configPath, originalError: error }
      );
    }
  }

  /**
   * Builds function signature from ABI item (simple format)
   *
   * Creates signature in format: functionName(type1,type2)
   * Used for computing keccak256 hash for selector generation.
   *
   * @param abiItem - ABI function item
   * @returns Function signature string
   * @private
   */
  private buildFunctionSignature(abiItem: any): string {
    const name = abiItem.name || "";
    const inputs = abiItem.inputs || [];
    const types = inputs.map((input: any) => input.type).join(",");
    return `${name}(${types})`;
  }

  /**
   * Builds full function signature with parameter names
   *
   * Creates signature in format: functionName(type1 name1, type2 name2)
   * Used for documentation and debugging.
   *
   * @param abiItem - ABI function item
   * @returns Full function signature string
   * @private
   */
  private buildFullSignature(abiItem: any): string {
    const name = abiItem.name || "";
    const inputs = abiItem.inputs || [];
    const params = inputs
      .map((input: any) => {
        const paramName = input.name || "";
        return paramName ? `${input.type} ${paramName}` : input.type;
      })
      .join(", ");
    return `${name}(${params})`;
  }

  /**
   * Extracts function selectors from ABI
   *
   * Computes 4-byte selectors for all functions in the ABI using keccak256.
   * Only processes function entries (type === "function").
   *
   * Note: This is a utility method primarily used for testing. The buildSelectorMap
   * method inlines this logic to also capture function metadata.
   *
   * @param abi - Contract ABI array
   * @returns Array of 4-byte selectors (0x prefixed)
   * @private
   */
  // @ts-ignore - Method used in tests
  private extractSelectorsFromAbi(abi: any[]): string[] {
    if (!abi || abi.length === 0) {
      return [];
    }

    const selectors: string[] = [];
    const functions = abi.filter((item) => item.type === "function");

    for (const func of functions) {
      const signature = this.buildFunctionSignature(func);
      const hash = keccak256(toUtf8Bytes(signature));
      const selector = hash.substring(0, 10); // 0x + 8 hex chars = 4 bytes
      selectors.push(selector);

      this.log(chalk.gray(`    - ${signature} -> ${selector}`));
    }

    return selectors;
  }

  /**
   * Builds a complete mapping of function selectors to facets
   *
   * This method extracts all function selectors from each facet's ABI and creates
   * a comprehensive mapping that includes the selector, facet name, function name,
   * and full function signature. Duplicate selectors trigger warnings.
   *
   * @param facets - Array of discovered facets
   * @returns Promise resolving to Map of selectors to SelectorInfo
   */
  public async buildSelectorMap(
    facets: DiscoveredFacet[]
  ): Promise<Map<string, SelectorInfo>> {
    this.log(
      chalk.blue(`Building selector map for ${facets.length} facets...`)
    );

    const selectorMap = new Map<string, SelectorInfo>();

    for (const facet of facets) {
      // Skip init contracts - they don't have selectors in the Diamond
      if (facet.isInit) {
        this.log(chalk.gray(`  Skipping init contract: ${facet.name}`));
        continue;
      }

      try {
        // Load facet ABI for function metadata
        const artifactPath = `${this.options.contractsPath}/examplediamond/${facet.name}.sol/${facet.name}.json`;
        const artifact = await import(artifactPath);
        const abi = artifact.abi || artifact.default?.abi || [];

        // Build SelectorInfo for each selector
        const functions = abi.filter((item: any) => item.type === "function");

        for (const func of functions) {
          const signature = this.buildFunctionSignature(func);
          const hash = keccak256(toUtf8Bytes(signature));
          const selector = hash.substring(0, 10);

          // Check for duplicate selectors (collision)
          if (selectorMap.has(selector)) {
            const existing = selectorMap.get(selector)!;
            this.addWarning(
              `Selector collision detected: ${selector} for ${signature} (${facet.name}) conflicts with ${existing.signature} (${existing.facetName})`
            );
          }

          const selectorInfo: SelectorInfo = {
            selector,
            facetName: facet.name,
            functionName: func.name,
            signature: this.buildFullSignature(func),
          };

          selectorMap.set(selector, selectorInfo);

          this.log(
            chalk.gray(`    Mapped ${selector} -> ${facet.name}.${func.name}()`)
          );
        }
      } catch (error) {
        this.addWarning(
          `Failed to process facet ${facet.name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.log(
      chalk.green(`✓ Built selector map with ${selectorMap.size} selectors`)
    );
    return selectorMap;
  }

  /**
   * Discovers the main Diamond contract source file
   *
   * Searches for the Diamond contract in multiple locations:
   * - Configuration-specified path
   * - Standard Diamond.sol location
   * - Custom Diamond implementation files
   *
   * If not found, adds a warning but returns info with found=false rather than throwing.
   *
   * @returns Promise resolving to Diamond contract information
   */
  public async discoverDiamondContract(): Promise<DiamondContractInfo> {
    this.log(
      chalk.blue(
        `Discovering Diamond contract for ${this.options.diamondName}...`
      )
    );

    const { diamondName, contractsPath } = this.options;
    const fs = await import("fs/promises");

    // Search paths in priority order
    const searchPaths = [
      // 1. Standard Diamond.sol location
      `${contractsPath}/examplediamond/${diamondName}.sol`,
      `${contractsPath}/${diamondName}.sol`,
      // 2. Common Diamond contract names
      `${contractsPath}/examplediamond/Diamond.sol`,
      `${contractsPath}/Diamond.sol`,
      // 3. Lowercased variants
      `${contractsPath}/examplediamond/${diamondName.toLowerCase()}.sol`,
      `${contractsPath}/${diamondName.toLowerCase()}.sol`,
    ];

    let foundPath: string | null = null;

    // Try each search path
    for (const searchPath of searchPaths) {
      this.log(chalk.gray(`  Checking: ${searchPath}`));

      try {
        await fs.access(searchPath);
        foundPath = searchPath;
        this.log(chalk.green(`  ✓ Found Diamond contract at ${searchPath}`));
        break;
      } catch (error) {
        // File doesn't exist, continue to next path
        this.log(chalk.gray(`    Not found`));
      }
    }

    const contractInfo: DiamondContractInfo = {
      name: diamondName,
      sourcePath: foundPath || "",
      found: foundPath !== null,
    };

    if (!contractInfo.found) {
      this.addWarning(
        `Diamond contract source file not found for ${diamondName}. Searched paths: ${searchPaths.join(", ")}`
      );
      this.log(chalk.yellow(`⚠ Diamond contract not found for ${diamondName}`));
    } else {
      this.log(
        chalk.green(`✓ Found Diamond contract at ${contractInfo.sourcePath}`)
      );
    }

    return contractInfo;
  }
}
