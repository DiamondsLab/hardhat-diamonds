/**
 * Task option interfaces for hardhat-diamonds plugin tasks
 */

/**
 * Base task arguments for diamond ABI generation
 */
export interface DiamondAbiTaskArgs {
  /** Name of the diamond to generate ABI for */
  diamondName: string;
  /** Output directory for generated ABI files (default: ./diamond-abi) */
  outputDir?: string;
  /** Enable verbose logging */
  enableVerbose?: boolean;
  /** Validate function selector uniqueness */
  validateSelectors?: boolean;
  /** Include compilation metadata in ABI */
  includeSourceInfo?: boolean;
  /** Target network (default: hardhat) */
  targetNetwork?: string;
  // Internal properties for compatibility
  verbose?: boolean;
  network?: string;
}

/**
 * Extended task arguments for diamond ABI generation with TypeChain integration
 */
export interface DiamondAbiTypechainTaskArgs extends DiamondAbiTaskArgs {
  /** TypeChain target (default: ethers-v6) */
  typechainTarget?: string;
  /** TypeChain output directory (default: diamond-typechain-types) */
  typechainOutDir?: string;
}

/**
 * Options for diamond ABI generation (internal)
 */
export interface DiamondAbiGenerationOptions {
  /** Diamond name to generate ABI for */
  diamondName: string;
  /** Network to use */
  networkName?: string;
  /** Chain ID */
  chainId?: number;
  /** Output directory for generated ABI files */
  outputDir?: string;
  /** Whether to include source information in ABI */
  includeSourceInfo?: boolean;
  /** Whether to validate function selector uniqueness */
  validateSelectors?: boolean;
  /** Whether to log verbose output */
  verbose?: boolean;
  /** Path to diamond configurations */
  diamondsPath?: string;
  /** Path to contract source files */
  contractPath?: string;
}

/**
 * Result of ABI generation
 */
export interface DiamondAbiGenerationResult {
  /** Generated combined ABI */
  abi: any[];
  /** Function selector to facet mapping */
  selectorMap: Record<string, string>;
  /** Facet addresses included in the ABI */
  facetAddresses: string[];
  /** Output file path */
  outputPath?: string;
  /** Statistics about the generation */
  stats: {
    totalFunctions: number;
    totalEvents: number;
    totalErrors: number;
    facetCount: number;
    duplicateSelectorsSkipped: number;
  };
}

/**
 * TypeChain generation options
 */
export interface TypeChainGenerationOptions {
  /** Path to ABI file to generate types for */
  abiPath: string;
  /** TypeChain target (default: ethers-v6) */
  target?: string;
  /** Output directory for generated types */
  outputDir?: string;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * TypeChain generation result
 */
export interface TypeChainGenerationResult {
  /** Output directory where types were generated */
  outputDir: string;
  /** Generated type files */
  generatedFiles: string[];
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * CLI task arguments for diamond:flatten
 */
export interface DiamondFlattenTaskArgs {
  /** Name of the diamond to flatten (required) */
  diamondName: string;
  /** Output file path (optional, defaults to stdout) */
  output?: string;
  /** Enable verbose logging (optional flag) */
  verbose?: boolean;
  /** Target network for configuration (optional) */
  network?: string;
}

/**
 * Internal options for DiamondFlattener class
 */
export interface DiamondFlattenOptions {
  /** Name of the diamond to flatten */
  diamondName: string;
  /** Output file path for flattened source */
  outputPath: string;
  /** Network name for configuration */
  networkName: string;
  /** Hardhat runtime environment */
  hre: any; // Will be typed as HardhatRuntimeEnvironment in implementation
  /** Enable verbose logging */
  verbose: boolean;
}

/**
 * Result returned from flatten operation
 */
export interface DiamondFlattenResult {
  /** Flattened Solidity source code */
  flattenedSource: string;
  /** Output file path where source was written */
  outputPath: string;
  /** Function selector to facet mapping */
  selectorMapping: SelectorInfo[];
  /** Statistics about the flatten operation */
  stats: FlattenStats;
}

/**
 * Function selector metadata
 */
export interface SelectorInfo {
  /** 4-byte function selector (0x prefixed hex) */
  selector: string;
  /** Name of the facet containing this function */
  facetName: string;
  /** Function name */
  functionName: string;
  /** Full function signature with parameters */
  signature: string;
}

/**
 * Statistics from flatten operation
 */
export interface FlattenStats {
  /** Total number of contracts included */
  totalContracts: number;
  /** Total number of facets processed */
  totalFacets: number;
  /** Total lines of code in flattened output */
  totalLines: number;
  /** Number of duplicate contracts removed */
  deduplicatedContracts: number;
}

/**
 * Discovered facet information
 */
export interface DiscoveredFacet {
  /** Facet contract name */
  name: string;
  /** Path to the facet contract source file */
  contractPath: string;
  /** Function selectors exposed by this facet */
  selectors: string[];
  /** Whether this is an initialization contract */
  isInit: boolean;
}

/**
 * Diamond contract information
 */
export interface DiamondContractInfo {
  /** Diamond contract name */
  name: string;
  /** Path to the diamond contract source file */
  sourcePath: string;
  /** Whether the diamond contract was found */
  found: boolean;
}
