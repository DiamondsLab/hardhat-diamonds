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
