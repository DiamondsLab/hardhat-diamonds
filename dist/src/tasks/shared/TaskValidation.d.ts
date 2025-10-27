import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DiamondAbiTaskArgs, DiamondAbiTypechainTaskArgs } from "./TaskOptions";
/**
 * Validation error details
 */
export interface ValidationError {
    field: string;
    message: string;
    suggestion?: string;
}
/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: string[];
}
/**
 * Task validation utilities for hardhat-diamonds plugin
 *
 * This class provides comprehensive validation for task arguments,
 * configurations, file paths, and system requirements.
 */
export declare class TaskValidation {
    private hre;
    /**
     * Create a new TaskValidation instance
     *
     * @param hre - Hardhat runtime environment
     */
    constructor(hre: HardhatRuntimeEnvironment);
    /**
     * Validate diamond ABI task arguments
     *
     * @param args - Task arguments to validate
     * @returns Validation result
     */
    validateDiamondAbiArgs(args: DiamondAbiTaskArgs): ValidationResult;
    /**
     * Validate diamond ABI TypeChain task arguments
     *
     * @param args - Task arguments to validate
     * @returns Validation result
     */
    validateDiamondAbiTypechainArgs(args: DiamondAbiTypechainTaskArgs): ValidationResult;
    /**
     * Validate diamond configuration exists and is accessible
     *
     * @param diamondName - Name of the diamond to validate
     * @returns Validation result
     */
    validateDiamondConfiguration(diamondName: string): ValidationResult;
    /**
     * Validate output directory path and permissions
     *
     * @param outputDir - Output directory path to validate
     * @returns Validation result
     */
    private validateOutputDirectory;
    /**
     * Validate network configuration
     *
     * @param networkName - Network name to validate
     * @returns Validation result
     */
    private validateNetwork;
    /**
     * Validate TypeChain target
     *
     * @param target - TypeChain target to validate
     * @returns Validation result
     */
    private validateTypechainTarget;
    /**
     * Validate system requirements for diamond ABI generation
     *
     * @param includeTypeChain - Whether to include TypeChain validation
     * @returns Validation result
     */
    validateSystemRequirements(includeTypeChain?: boolean): ValidationResult;
    /**
     * Resolve path relative to Hardhat project root
     *
     * @param path - Path to resolve
     * @returns Resolved absolute path
     */
    private resolvePath;
    /**
     * Format validation errors for display
     *
     * @param result - Validation result to format
     * @param verbose - Whether to show verbose output
     */
    static formatValidationResult(result: ValidationResult, verbose?: boolean): void;
}
