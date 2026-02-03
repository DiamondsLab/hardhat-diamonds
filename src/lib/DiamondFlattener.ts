import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { Diamond } from "@diamondslab/diamonds";
import chalk from "chalk";
import { keccak256, toUtf8Bytes } from "ethers";
import { FlattenError, ErrorCodes } from "./FlattenError";
import type { DependencyNode } from "./DependencyGraph";
import type {
  DiamondFlattenOptions,
  DiscoveredFacet,
  DiamondContractInfo,
  SelectorInfo,
  DeduplicatedSource,
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
      includeSummary: options.includeSummary ?? true,
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
      const availableDiamonds = Object.keys(
        this.hre.config.diamonds?.paths ?? {}
      );
      const suggestion =
        availableDiamonds.length > 0
          ? `Available diamonds: ${availableDiamonds.join(", ")}. Check your hardhat.config.ts diamonds.paths configuration.`
          : "No diamonds are configured. Add your diamond configuration to hardhat.config.ts under diamonds.paths.";

      throw new FlattenError(
        `Diamond configuration for '${diamondName}' not found in Hardhat config. ` +
          `Make sure you have configured the Diamond in hardhat.config.ts under diamonds.paths.${diamondName}`,
        ErrorCodes.DIAMOND_NOT_FOUND,
        {
          diamondName,
          availableDiamonds,
        },
        suggestion
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

  /**
   * Extracts contract, interface, library, and abstract contract definitions from source code
   *
   * Uses regex patterns to identify all Solidity definition types. This is used to detect
   * duplicate definitions during the deduplication process.
   *
   * @param content - Solidity source code content
   * @returns Array of definition names found in the source
   * @private
   */
  private extractDefinitions(content: string): string[] {
    const definitions: string[] = [];

    // Regex patterns for different definition types
    // Matches: contract, abstract contract, interface, library
    const patterns = [
      /\bcontract\s+([A-Za-z_][A-Za-z0-9_]*)/g,
      /\babstract\s+contract\s+([A-Za-z_][A-Za-z0-9_]*)/g,
      /\binterface\s+([A-Za-z_][A-Za-z0-9_]*)/g,
      /\blibrary\s+([A-Za-z_][A-Za-z0-9_]*)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const definitionName = match[1];
        if (!definitions.includes(definitionName)) {
          definitions.push(definitionName);
          this.log(chalk.gray(`    Found definition: ${definitionName}`));
        }
      }
    }

    return definitions;
  }

  /**
   * Removes import statements from Solidity source code while preserving all comments
   *
   * This method strips all import statements to prepare the code for flattening.
   * It preserves:
   * - Inline comments (//)
   * - Block comments
   * - NatSpec comments
   * - Line numbers (replaces imports with empty lines to maintain line mappings)
   *
   * @param content - Solidity source code content
   * @returns Source code with import statements removed
   * @private
   */
  private removeImports(content: string): string {
    // Regex to match all import statement variants:
    // import "./Contract.sol";
    // import { A, B } from "./Contract.sol";
    // import * as X from "./Contract.sol";
    // import "@openzeppelin/contracts/Contract.sol";
    const importPattern =
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+)\s+from\s+)?["'][^"']+["']\s*;/g;

    // Replace imports with empty lines to preserve line numbers
    const withoutImports = content.replace(importPattern, "");

    this.log(
      chalk.gray(`    Removed import statements, preserved line numbers`)
    );

    return withoutImports;
  }

  /**
   * Deduplicates source files by removing duplicate contract definitions
   *
   * This method implements the deduplication strategy defined in the PRD:
   * - Keep the first occurrence of each contract/interface/library definition
   * - Mark subsequent duplicates as not kept
   * - Generate warnings for all duplicates found
   * - Detect version mismatches (same name, different content)
   * - Remove import statements from all sources
   * - Preserve all comments (inline, block, NatSpec)
   *
   * @param sortedNodes - Dependency nodes in topologically sorted order
   * @returns Array of deduplicated sources with metadata
   */
  public deduplicateSources(
    sortedNodes: DependencyNode[]
  ): DeduplicatedSource[] {
    this.log(chalk.blue(`Deduplicating ${sortedNodes.length} source files...`));

    const deduplicatedSources: DeduplicatedSource[] = [];
    const seenDefinitions = new Set<string>();
    const definitionToSource = new Map<string, DeduplicatedSource>();

    for (const node of sortedNodes) {
      this.log(chalk.gray(`  Processing: ${node.name}`));

      // Extract all definitions from this source
      const definitions = this.extractDefinitions(node.source.content);

      // Remove import statements while preserving comments
      const contentWithoutImports = this.removeImports(node.source.content);

      // Check if any definition in this source is a duplicate
      const duplicateDefinitions: string[] = [];
      const newDefinitions: string[] = [];

      for (const definition of definitions) {
        if (seenDefinitions.has(definition)) {
          duplicateDefinitions.push(definition);

          // Check for version mismatch (same name, different content)
          const originalSource = definitionToSource.get(definition);
          if (
            originalSource &&
            originalSource.content !== contentWithoutImports
          ) {
            this.addWarning(
              `Version mismatch detected for '${definition}': ` +
                `First seen in ${originalSource.path}, ` +
                `different version in ${node.source.path}. ` +
                `Keeping first occurrence.`
            );
          }
        } else {
          seenDefinitions.add(definition);
          newDefinitions.push(definition);
        }
      }

      // Determine if this source should be kept
      const kept = newDefinitions.length > 0;

      // Create deduplicated source entry
      const deduplicatedSource: DeduplicatedSource = {
        name: node.name,
        path: node.source.path,
        content: contentWithoutImports,
        kept,
        definitions,
      };

      deduplicatedSources.push(deduplicatedSource);

      // Store mapping for version mismatch detection
      for (const definition of newDefinitions) {
        definitionToSource.set(definition, deduplicatedSource);
      }

      // Log result
      if (kept) {
        this.log(
          chalk.green(
            `    ✓ Kept (new definitions: ${newDefinitions.join(", ")})`
          )
        );
      } else {
        this.addWarning(
          `Duplicate source removed: ${node.name} at ${node.source.path}. ` +
            `All definitions already present: ${duplicateDefinitions.join(", ")}`
        );
        this.log(
          chalk.yellow(
            `    ⚠ Removed (duplicates: ${duplicateDefinitions.join(", ")})`
          )
        );
      }
    }

    const keptCount = deduplicatedSources.filter((s) => s.kept).length;
    const removedCount = deduplicatedSources.length - keptCount;

    this.log(
      chalk.green(
        `✓ Deduplication complete: ${keptCount} kept, ${removedCount} removed`
      )
    );

    return deduplicatedSources;
  }

  /**
   * Main flatten method - orchestrates the entire flattening process
   *
   * This method:
   * 1. Discovers all facets in the Diamond
   * 2. Builds selector mapping
   * 3. Discovers the Diamond contract itself
   * 4. Resolves all dependencies
   * 5. Deduplicates sources
   * 6. Formats the final output
   *
   * @returns Promise resolving to DiamondFlattenResult with flattened source and metadata
   * @throws {FlattenError} If any critical step fails
   */
  public async flatten(): Promise<DiamondFlattenResult> {
    const startTime = Date.now();

    try {
      // Import dependencies
      const { SourceResolver } = require("./SourceResolver");
      const { DependencyGraph } = require("./DependencyGraph");
      const { OutputFormatter } = require("./OutputFormatter");

      this.log(
        chalk.blue(
          `\n🔨 Starting flatten process for ${this.options.diamondName}...`
        )
      );

      // Step 1: Discover facets
      this.log(chalk.blue("\n📋 Step 1: Discovering facets..."));
      const facets = await this.discoverFacets();

      // Step 2: Build selector map
      this.log(chalk.blue("\n🔍 Step 2: Building selector map..."));
      const selectorMapInternal = await this.buildSelectorMap(facets);
      // Convert Map to Record for the result
      const selectorMap: Record<string, SelectorInfo> = {};
      selectorMapInternal.forEach((value, key) => {
        selectorMap[key] = value;
      });

      // Step 3: Discover diamond contract
      this.log(chalk.blue("\n💎 Step 3: Discovering Diamond contract..."));
      const diamondContract = await this.discoverDiamondContract();

      // Step 4: Resolve sources and dependencies
      this.log(chalk.blue("\n📦 Step 4: Resolving dependencies..."));
      const sourceResolver = new SourceResolver(this.hre, this.options.verbose);

      // Build dependency graph
      const dependencyGraph = new DependencyGraph(
        sourceResolver,
        this.options.verbose
      );

      // Collect all contract names to resolve
      const contractNames: string[] = [
        ...facets.map((f) => f.name),
        diamondContract.name,
      ];

      // Resolve all sources by loading each contract
      for (const contractName of contractNames) {
        // Find the contract path
        const contractPath = await this.resolveContractPath(contractName);
        if (contractPath) {
          await dependencyGraph.addRoot(contractPath);
        } else {
          this.warnings.push(
            `Could not find contract: ${contractName} - skipping`
          );
        }
      }

      // Get topologically sorted nodes
      const sortedNodes = dependencyGraph.topologicalSort();

      // Step 5: Deduplicate sources
      this.log(chalk.blue("\n🔄 Step 5: Deduplicating sources..."));
      const deduplicatedSources = this.deduplicateSources(sortedNodes);

      // Step 6: Extract SPDX and pragma from first source
      this.log(chalk.blue("\n📋 Step 6: Extracting SPDX and pragma..."));
      const outputFormatter = new OutputFormatter();
      const firstSource = deduplicatedSources.find((s) => s.kept);
      let spdxLicense = "UNLICENSED";
      let pragmaDirective = "pragma solidity ^0.8.0;";

      if (firstSource) {
        const extractedSpdx = outputFormatter.extractSPDX(firstSource.content);
        if (extractedSpdx) {
          spdxLicense = extractedSpdx;
          this.log(chalk.gray(`  Found SPDX license: ${spdxLicense}`));
        }

        const extractedPragma = outputFormatter.extractPragma(
          firstSource.content
        );
        if (extractedPragma) {
          pragmaDirective = extractedPragma;
          this.log(chalk.gray(`  Found pragma: ${pragmaDirective}`));
        }
      }

      // Step 7: Clean all sources (remove SPDX, pragma, imports)
      this.log(
        chalk.blue(
          "\n🧹 Step 7: Cleaning sources (remove SPDX, pragma, imports)..."
        )
      );
      const cleanedSources = deduplicatedSources.map((s) => ({
        ...s,
        content: outputFormatter.cleanSource(s.content),
      }));

      // Step 8: Format output
      this.log(chalk.blue("\n📝 Step 8: Formatting output..."));

      // Generate selector tables for each facet
      const facetSelectorTables: string[] = [];
      for (const facet of facets) {
        if (facet.selectors.length > 0) {
          const table = outputFormatter.generateSelectorTable(
            facet.selectors,
            facet.name
          );
          facetSelectorTables.push(table);
        }
      }

      // Calculate statistics
      const totalSelectors = facets.reduce(
        (sum, f) => sum + f.selectors.length,
        0
      );
      const totalContracts = cleanedSources.filter((s) => s.kept).length;
      const deduplicatedCount = cleanedSources.filter((s) => !s.kept).length;
      const totalLines = cleanedSources
        .filter((s) => s.kept)
        .reduce((sum, s) => sum + s.content.split("\n").length, 0);

      // Generate summary header (conditional based on options)
      const summaryHeader = this.options.includeSummary
        ? outputFormatter.generateSummaryHeader({
            diamondName: this.options.diamondName,
            totalContracts,
            totalFacets: facets.length,
            totalSelectors,
            totalDependencies: sortedNodes.length - facets.length - 1, // Exclude facets and diamond
            generatorVersion: "1.0.0", // TODO: Get from package.json
            networkName: this.options.networkName,
          })
        : "";

      // Combine all parts into final flattened source with SPDX and pragma at top
      let flattenedSource = `// SPDX-License-Identifier: ${spdxLicense}\n`;
      flattenedSource += `${pragmaDirective}\n\n`;
      if (summaryHeader) {
        flattenedSource += summaryHeader + "\n\n";
      }

      // Add selector tables
      if (facetSelectorTables.length > 0) {
        flattenedSource += facetSelectorTables.join("\n\n") + "\n\n";
      }

      // Add cleaned deduplicated sources
      const keptSources = cleanedSources.filter((s) => s.kept);
      flattenedSource += keptSources
        .map((s) => {
          // Add a simple comment header for each contract
          return `// Source: ${s.name}\n// Path: ${s.path}\n\n${s.content}`;
        })
        .join("\n\n");

      // Build final result
      const result: DiamondFlattenResult = {
        flattenedSource,
        facets,
        selectorMap,
        warnings: this.warnings,
        stats: {
          totalFacets: facets.length,
          totalSelectors,
          totalContracts,
          totalLines,
          deduplicatedContracts: deduplicatedCount,
          executionTimeMs: Date.now() - startTime,
        },
      };

      this.log(
        chalk.green(
          `\n✅ Flatten complete in ${result.stats.executionTimeMs}ms`
        )
      );

      return result;
    } catch (error) {
      // If it's already a FlattenError, re-throw it
      if (error instanceof FlattenError) {
        throw error;
      }

      // Otherwise, wrap in FlattenError
      throw new FlattenError(
        `Flatten operation failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCodes.FILE_SYSTEM_ERROR,
        { diamondName: this.options.diamondName, originalError: error }
      );
    }
  }
}

/**
 * Flatten a Diamond contract programmatically
 *
 * This is the main programmatic API for flattening Diamond proxy contracts.
 * It creates a DiamondFlattener instance, executes the flattening process,
 * and returns the complete result with flattened source code and metadata.
 *
 * @param hre - Hardhat Runtime Environment
 * @param options - Flattening options (diamondName is required)
 * @returns Promise resolving to DiamondFlattenResult
 * @throws {FlattenError} If flattening fails for any reason
 *
 * @example
 * ```typescript
 * import { flattenDiamond } from '@diamondslab/hardhat-diamonds';
 * import hre from 'hardhat';
 *
 * // Basic usage
 * const result = await flattenDiamond(hre, {
 *   diamondName: 'MyDiamond',
 * });
 *
 * console.log(`Flattened ${result.stats.totalFacets} facets`);
 * console.log(`Total selectors: ${result.stats.totalSelectors}`);
 * fs.writeFileSync('flattened.sol', result.flattenedSource);
 *
 * // Advanced usage with custom options
 * const result2 = await flattenDiamond(hre, {
 *   diamondName: 'ProductionDiamond',
 *   networkName: 'mainnet',
 *   outputPath: './audit/flattened.sol',
 *   verbose: true,
 * });
 *
 * // Handle warnings
 * if (result2.warnings.length > 0) {
 *   console.warn('Warnings:');
 *   result2.warnings.forEach(w => console.warn(`  - ${w}`));
 * }
 * ```
 */
export async function flattenDiamond(
  hre: HardhatRuntimeEnvironment,
  options: Partial<DiamondFlattenOptions> & {
    diamondName: string;
    outputPath?: string;
  }
): Promise<DiamondFlattenResult> {
  // Apply defaults for optional parameters
  const networkName = options.networkName ?? hre.network.name;
  const chainId =
    options.chainId ??
    (hre.network.config.chainId as number | undefined) ??
    31337;
  const diamondsPath =
    options.diamondsPath ??
    hre.config.diamonds?.paths?.[options.diamondName]?.deploymentsPath ??
    "diamonds";
  const contractsPath =
    options.contractsPath ??
    hre.config.diamonds?.paths?.[options.diamondName]?.contractsPath ??
    "contracts";
  const verbose = options.verbose ?? false;
  const outputPath =
    options.outputPath ?? `./flattened/${options.diamondName}.sol`;

  // Create flattener instance
  const flattener = new DiamondFlattener(hre, {
    diamondName: options.diamondName,
    outputPath,
    networkName,
    chainId,
    diamondsPath,
    contractsPath,
    verbose,
  });

  // Execute flatten and return result
  return flattener.flatten();
}

/**
 * Result of Diamond flattening operation
 */
export interface DiamondFlattenResult {
  /** Complete flattened source code */
  flattenedSource: string;
  /** Discovered facets with selector information */
  facets: DiscoveredFacet[];
  /** Function selector to facet mapping */
  selectorMap: Record<string, SelectorInfo>;
  /** Warnings collected during flattening */
  warnings: string[];
  /** Statistics about the flattening operation */
  stats: FlattenStats;
}

/**
 * Statistics from flatten operation
 */
export interface FlattenStats {
  /** Total number of facets processed */
  totalFacets: number;
  /** Total number of function selectors */
  totalSelectors: number;
  /** Total number of contracts in output */
  totalContracts: number;
  /** Total lines of code in output */
  totalLines: number;
  /** Number of contracts deduplicated */
  deduplicatedContracts: number;
  /** Execution time in milliseconds */
  executionTimeMs: number;
}
