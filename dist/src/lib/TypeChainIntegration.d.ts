import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TypeChainGenerationOptions, TypeChainGenerationResult } from "../tasks/shared/TaskOptions";
/**
 * TypeChain integration for hardhat-diamonds plugin
 *
 * This class provides TypeChain integration for generating TypeScript types
 * from Diamond ABI files. It integrates with the Hardhat runtime environment
 * and provides comprehensive error handling and validation.
 */
export declare class HardhatTypeChainIntegration {
    private hre;
    /**
     * Create a new HardhatTypeChainIntegration instance
     *
     * @param hre - Hardhat runtime environment
     */
    constructor(hre: HardhatRuntimeEnvironment);
    /**
     * Generate TypeChain types from a Diamond ABI file
     *
     * @param options - TypeChain generation options
     * @returns Promise resolving to generation result
     */
    generateTypes(options: TypeChainGenerationOptions): Promise<TypeChainGenerationResult>;
    /**
     * Run TypeChain CLI command
     *
     * @param abiPath - Path to ABI file
     * @param target - TypeChain target
     * @param outputDir - Output directory
     * @param verbose - Whether to show verbose output
     */
    private runTypeChain;
    /**
     * Get list of generated TypeScript files in the output directory
     *
     * @param outputDir - Output directory to scan
     * @returns Array of generated file paths
     */
    private getGeneratedFiles;
    /**
     * Validate TypeChain installation and configuration
     *
     * @param verbose - Whether to show verbose output
     * @returns Promise resolving to validation result
     */
    validateTypeChainSetup(verbose?: boolean): Promise<{
        isValid: boolean;
        issues: string[];
        suggestions: string[];
    }>;
    /**
     * Run a command and return a promise
     *
     * @param command - Command to run
     * @param args - Command arguments
     * @param options - Spawn options
     * @returns Promise that resolves when command completes successfully
     */
    private runCommand;
}
/**
 * Convenience function to generate TypeChain types using Hardhat runtime environment
 *
 * @param hre - Hardhat runtime environment
 * @param options - TypeChain generation options
 * @returns Promise resolving to generation result
 */
export declare function generateTypeChainTypes(hre: HardhatRuntimeEnvironment, options: TypeChainGenerationOptions): Promise<TypeChainGenerationResult>;
