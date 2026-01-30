import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { Diamond } from "@diamondslab/diamonds";
import chalk from "chalk";
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
  constructor(hre: HardhatRuntimeEnvironment, options: Partial<DiamondFlattenOptions> & { diamondName: string; outputPath: string }) {
    this.hre = hre;
    
    // Apply default values for optional options
    this.options = {
      diamondName: options.diamondName,
      outputPath: options.outputPath,
      networkName: options.networkName ?? hre.network.name,
      chainId: options.chainId ?? (hre.network.config.chainId as number | undefined) ?? 31337,
      diamondsPath: options.diamondsPath ?? hre.config.diamonds?.paths?.[options.diamondName]?.deploymentsPath ?? "diamonds",
      contractsPath: options.contractsPath ?? hre.config.diamonds?.paths?.[options.diamondName]?.contractsPath ?? "contracts",
      verbose: options.verbose ?? false,
      hre: hre,
    };

    this.log(chalk.blue(`Initializing DiamondFlattener for ${this.options.diamondName}`));
    
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
        { diamondName, availableDiamonds: Object.keys(this.hre.config.diamonds?.paths ?? {}) }
      );
    }

    try {
      // TODO: Initialize Diamond instance from @diamondslab/diamonds module
      // This will be implemented when we integrate with the actual Diamond class
      // For now, we'll set it to null and rely on fallback mechanisms
      this.diamond = null;
      
      this.log(chalk.green(`✓ Diamond configuration loaded for ${diamondName}`));
      
      if (!this.diamond) {
        this.log(chalk.yellow(`⚠ Diamond instance not initialized - will use fallback mechanisms`));
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
    this.log(chalk.blue(`Discovering facets for ${this.options.diamondName}...`));
    
    // TODO: Implement facet discovery in Task 2.0
    const facets: DiscoveredFacet[] = [];
    
    this.log(chalk.green(`✓ Discovered ${facets.length} facets`));
    return facets;
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
  public async buildSelectorMap(facets: DiscoveredFacet[]): Promise<Map<string, SelectorInfo>> {
    this.log(chalk.blue(`Building selector map for ${facets.length} facets...`));
    
    // TODO: Implement selector mapping in Task 3.0
    const selectorMap = new Map<string, SelectorInfo>();
    
    this.log(chalk.green(`✓ Built selector map with ${selectorMap.size} selectors`));
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
    this.log(chalk.blue(`Discovering Diamond contract for ${this.options.diamondName}...`));
    
    // TODO: Implement Diamond contract discovery in Task 4.0
    const contractInfo: DiamondContractInfo = {
      name: this.options.diamondName,
      sourcePath: "",
      found: false,
    };
    
    if (!contractInfo.found) {
      this.addWarning(`Diamond contract source file not found for ${this.options.diamondName}`);
    } else {
      this.log(chalk.green(`✓ Found Diamond contract at ${contractInfo.sourcePath}`));
    }
    
    return contractInfo;
  }
}
