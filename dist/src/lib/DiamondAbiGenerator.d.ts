import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DiamondAbiGenerationOptions, DiamondAbiGenerationResult } from "../tasks/shared/TaskOptions";
/**
 * Hardhat-integrated Diamond ABI Generator
 *
 * This class wraps the diamonds module's DiamondAbiGenerator for Hardhat plugin integration.
 * It provides seamless integration with the Hardhat runtime environment and the hardhat-diamonds
 * plugin configuration system.
 */
export declare class HardhatDiamondAbiGenerator {
    private hre;
    private diamondsConfig;
    private options;
    private diamond;
    private repository;
    private initializationError;
    /**
     * Create a new HardhatDiamondAbiGenerator instance
     *
     * @param hre - Hardhat runtime environment
     * @param options - ABI generation options
     */
    constructor(hre: HardhatRuntimeEnvironment, options: DiamondAbiGenerationOptions);
    /**
     * Initialize the Diamond instance with proper error handling
     */
    private initializeDiamond;
    /**
     * Dynamically load the Diamond class from the diamonds module
     */
    private getDiamondClass;
    /**
     * Dynamically load the FileDeploymentRepository class from the diamonds module
     */
    private getFileDeploymentRepositoryClass;
    /**
     * Generate the diamond ABI using the diamonds module DiamondAbiGenerator
     *
     * @returns Promise resolving to the generation result
     */
    generateAbi(): Promise<DiamondAbiGenerationResult>;
    /**
     * Generate ABI from deployed diamond data using function selector registry
     *
     * @param outputDir - Output directory for the generated ABI
     * @param abiFileName - Name for the ABI file
     * @returns Promise resolving to generation result
     */
    private generateFromDeployedData;
    /**
     * Generate a fallback ABI when the diamonds module fails
     *
     * @returns Promise resolving to fallback ABI generation result
     */
    private generateFallbackAbi;
    /**
     * Generate ABI based on diamond configuration when no deployment data is available
     *
     * @returns Promise resolving to configuration-based ABI generation result
     */
    private generateConfigBasedAbi;
    /**
     * Load facet artifact using Hardhat artifacts manager
     *
     * @param facetName - Name of the facet to load
     * @returns Promise resolving to the artifact or null if not found
     */
    private loadFacetArtifact;
    /**
     * Process ABI items for a facet
     *
     * @param abiItems - ABI items to process
     * @param facetName - Name of the facet
     * @param combinedAbi - Combined ABI array to append to
     * @param selectorMap - Selector to facet mapping
     * @param eventSignatures - Set of event signatures for deduplication
     * @param errorSignatures - Set of error signatures for deduplication
     * @param counters - Counters for statistics
     */
    private processAbiItems;
}
/**
 * Convenience function to generate diamond ABI using Hardhat runtime environment
 *
 * @param hre - Hardhat runtime environment
 * @param options - Generation options including diamondName
 * @returns Promise resolving to generation result
 */
export declare function generateDiamondAbi(hre: HardhatRuntimeEnvironment, options: DiamondAbiGenerationOptions & {
    diamondName: string;
}): Promise<DiamondAbiGenerationResult>;
