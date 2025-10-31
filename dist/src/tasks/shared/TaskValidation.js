"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskValidation = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
/**
 * Task validation utilities for hardhat-diamonds plugin
 *
 * This class provides comprehensive validation for task arguments,
 * configurations, file paths, and system requirements.
 */
class TaskValidation {
    hre;
    /**
     * Create a new TaskValidation instance
     *
     * @param hre - Hardhat runtime environment
     */
    constructor(hre) {
        this.hre = hre;
    }
    /**
     * Validate diamond ABI task arguments
     *
     * @param args - Task arguments to validate
     * @returns Validation result
     */
    validateDiamondAbiArgs(args) {
        const errors = [];
        const warnings = [];
        // Validate required fields
        if (!args.diamondName ||
            typeof args.diamondName !== "string" ||
            args.diamondName.trim() === "") {
            errors.push({
                field: "diamondName",
                message: "Diamond name is required and must be a non-empty string",
                suggestion: "Provide a valid diamond name, e.g., --diamond-name ExampleDiamond",
            });
        }
        else {
            // Validate diamond name format
            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(args.diamondName)) {
                errors.push({
                    field: "diamondName",
                    message: "Diamond name must start with a letter and contain only letters, numbers, and underscores",
                    suggestion: "Use a valid identifier format, e.g., ExampleDiamond or MyDiamond_V2",
                });
            }
        }
        // Validate optional output directory
        if (args.outputDir !== undefined && args.outputDir !== null) {
            const outputDirValidation = this.validateOutputDirectory(args.outputDir);
            if (!outputDirValidation.isValid) {
                errors.push(...outputDirValidation.errors);
                warnings.push(...outputDirValidation.warnings);
            }
        }
        // Validate network if provided
        if (args.targetNetwork !== undefined &&
            args.targetNetwork !== null) {
            const networkValidation = this.validateNetwork(args.targetNetwork);
            if (!networkValidation.isValid) {
                errors.push(...networkValidation.errors);
                warnings.push(...networkValidation.warnings);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Validate diamond ABI TypeChain task arguments
     *
     * @param args - Task arguments to validate
     * @returns Validation result
     */
    validateDiamondAbiTypechainArgs(args) {
        // First validate base ABI arguments
        const baseValidation = this.validateDiamondAbiArgs(args);
        const errors = [...baseValidation.errors];
        const warnings = [...baseValidation.warnings];
        // Validate TypeChain-specific arguments
        if (args.typechainTarget !== undefined) {
            const targetValidation = this.validateTypechainTarget(args.typechainTarget);
            if (!targetValidation.isValid) {
                errors.push(...targetValidation.errors);
                warnings.push(...targetValidation.warnings);
            }
        }
        if (args.typechainOutDir !== undefined) {
            const outDirValidation = this.validateOutputDirectory(args.typechainOutDir);
            if (!outDirValidation.isValid) {
                errors.push(...outDirValidation.errors);
                warnings.push(...outDirValidation.warnings);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Validate diamond configuration exists and is accessible
     *
     * @param diamondName - Name of the diamond to validate
     * @returns Validation result
     */
    validateDiamondConfiguration(diamondName) {
        const errors = [];
        const warnings = [];
        try {
            // Check if diamond configuration exists in hardhat-diamonds plugin
            const diamondConfig = this.hre.diamonds.getDiamondConfig(diamondName);
            if (!diamondConfig) {
                errors.push({
                    field: "diamondName",
                    message: `Diamond configuration for "${diamondName}" not found`,
                    suggestion: "Add diamond configuration to your hardhat.config.ts diamonds section",
                });
                return { isValid: false, errors, warnings };
            }
            // Validate deployment path if specified
            if (diamondConfig.deploymentsPath) {
                const deploymentPath = this.resolvePath(diamondConfig.deploymentsPath);
                if (!(0, fs_1.existsSync)(deploymentPath)) {
                    warnings.push(`Deployment path not found: ${deploymentPath}`);
                }
            }
            // Validate contracts path if specified
            if (diamondConfig.contractsPath) {
                const contractsPath = this.resolvePath(diamondConfig.contractsPath);
                if (!(0, fs_1.existsSync)(contractsPath)) {
                    warnings.push(`Contracts path not found: ${contractsPath}`);
                }
            }
            // Check for diamond configuration file
            const configPath = (0, path_1.join)(this.hre.config.paths.root, "diamonds", diamondName, `${diamondName.toLowerCase()}.config.json`);
            if (!(0, fs_1.existsSync)(configPath)) {
                warnings.push(`Diamond configuration file not found: ${configPath}`);
                warnings.push("ABI generation will fall back to deployment data or basic configuration");
            }
        }
        catch (error) {
            errors.push({
                field: "diamondName",
                message: `Failed to validate diamond configuration: ${error instanceof Error ? error.message : String(error)}`,
                suggestion: "Check your hardhat.config.ts diamonds configuration",
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Validate output directory path and permissions
     *
     * @param outputDir - Output directory path to validate
     * @returns Validation result
     */
    validateOutputDirectory(outputDir) {
        const errors = [];
        const warnings = [];
        if (!outputDir ||
            typeof outputDir !== "string" ||
            outputDir.trim() === "") {
            errors.push({
                field: "outputDir",
                message: "Output directory must be a non-empty string",
                suggestion: "Provide a valid directory path",
            });
            return { isValid: false, errors, warnings };
        }
        const resolvedPath = this.resolvePath(outputDir);
        // Check if path exists
        if ((0, fs_1.existsSync)(resolvedPath)) {
            try {
                const stat = (0, fs_1.statSync)(resolvedPath);
                if (!stat.isDirectory()) {
                    errors.push({
                        field: "outputDir",
                        message: `Output path exists but is not a directory: ${resolvedPath}`,
                        suggestion: "Choose a different path or remove the existing file",
                    });
                }
                else {
                    // Check write permissions
                    try {
                        (0, fs_1.accessSync)(resolvedPath, fs_1.constants.W_OK);
                    }
                    catch {
                        errors.push({
                            field: "outputDir",
                            message: `Output directory is not writable: ${resolvedPath}`,
                            suggestion: "Check directory permissions or choose a different path",
                        });
                    }
                }
            }
            catch (error) {
                errors.push({
                    field: "outputDir",
                    message: `Cannot access output directory: ${error instanceof Error ? error.message : String(error)}`,
                    suggestion: "Check path validity and permissions",
                });
            }
        }
        else {
            // Check if parent directory exists and is writable
            const parentDir = (0, path_1.resolve)(resolvedPath, "..");
            if ((0, fs_1.existsSync)(parentDir)) {
                try {
                    (0, fs_1.accessSync)(parentDir, fs_1.constants.W_OK);
                }
                catch {
                    errors.push({
                        field: "outputDir",
                        message: `Cannot create directory, parent is not writable: ${parentDir}`,
                        suggestion: "Check parent directory permissions or choose a different path",
                    });
                }
            }
            else {
                warnings.push(`Parent directory will be created: ${parentDir}`);
            }
        }
        // Validate path format
        if (outputDir.includes("..") && !(0, path_1.isAbsolute)(outputDir)) {
            warnings.push('Relative paths with ".." can be dangerous, consider using absolute paths');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Validate network configuration
     *
     * @param networkName - Network name to validate
     * @returns Validation result
     */
    validateNetwork(networkName) {
        const errors = [];
        const warnings = [];
        if (!networkName ||
            typeof networkName !== "string" ||
            networkName.trim() === "") {
            errors.push({
                field: "network",
                message: "Network name must be a non-empty string",
                suggestion: "Provide a valid network name from your Hardhat configuration",
            });
            return { isValid: false, errors, warnings };
        }
        // Check if network exists in Hardhat configuration
        const networks = this.hre.config.networks;
        if (!networks[networkName]) {
            errors.push({
                field: "network",
                message: `Network "${networkName}" not found in Hardhat configuration`,
                suggestion: `Available networks: ${Object.keys(networks).join(", ")}`,
            });
        }
        else {
            // Validate network configuration
            const networkConfig = networks[networkName];
            if (networkConfig.chainId === undefined) {
                warnings.push(`Network "${networkName}" does not have a chainId configured`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Validate TypeChain target
     *
     * @param target - TypeChain target to validate
     * @returns Validation result
     */
    validateTypechainTarget(target) {
        const errors = [];
        const warnings = [];
        if (!target || typeof target !== "string" || target.trim() === "") {
            errors.push({
                field: "typechainTarget",
                message: "TypeChain target must be a non-empty string",
                suggestion: "Provide a valid TypeChain target",
            });
            return { isValid: false, errors, warnings };
        }
        const validTargets = ["ethers-v6", "ethers-v5", "web3-v1", "truffle-v5"];
        if (!validTargets.includes(target)) {
            errors.push({
                field: "typechainTarget",
                message: `Invalid TypeChain target: ${target}`,
                suggestion: `Valid targets: ${validTargets.join(", ")}`,
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Validate system requirements for diamond ABI generation
     *
     * @param includeTypeChain - Whether to include TypeChain validation
     * @returns Validation result
     */
    validateSystemRequirements(includeTypeChain = false) {
        const errors = [];
        const warnings = [];
        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0], 10);
        if (majorVersion < 16) {
            warnings.push(`Node.js version ${nodeVersion} detected, recommend version 16 or higher`);
        }
        // Check if diamonds module is available
        try {
            require("@diamondslab/diamonds");
        }
        catch {
            errors.push({
                field: "dependencies",
                message: "diamonds module not found",
                suggestion: "Install the diamonds module: npm install @diamondslab/diamonds",
            });
        }
        // Check if ethers is available
        try {
            require("ethers");
        }
        catch {
            errors.push({
                field: "dependencies",
                message: "ethers module not found",
                suggestion: "Install ethers: npm install ethers",
            });
        }
        // TypeChain-specific validation
        if (includeTypeChain) {
            try {
                require("typechain");
            }
            catch {
                errors.push({
                    field: "dependencies",
                    message: "typechain module not found",
                    suggestion: "Install TypeChain: npm install --save-dev typechain @typechain/ethers-v6",
                });
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Resolve path relative to Hardhat project root
     *
     * @param path - Path to resolve
     * @returns Resolved absolute path
     */
    resolvePath(path) {
        if ((0, path_1.isAbsolute)(path)) {
            return path;
        }
        return (0, path_1.resolve)(this.hre.config.paths.root, path);
    }
    /**
     * Format validation errors for display
     *
     * @param result - Validation result to format
     * @param verbose - Whether to show verbose output
     */
    static formatValidationResult(result, verbose = false) {
        if (result.isValid) {
            if (verbose && result.warnings.length > 0) {
                console.log(chalk_1.default.yellow("⚠️  Validation warnings:"));
                result.warnings.forEach((warning) => {
                    console.log(chalk_1.default.yellow(`   - ${warning}`));
                });
            }
            return;
        }
        console.log(chalk_1.default.red("❌ Validation failed:"));
        result.errors.forEach((error) => {
            console.log(chalk_1.default.red(`   ${error.field}: ${error.message}`));
            if (error.suggestion) {
                console.log(chalk_1.default.cyan(`   💡 ${error.suggestion}`));
            }
        });
        if (result.warnings.length > 0) {
            console.log(chalk_1.default.yellow("⚠️  Additional warnings:"));
            result.warnings.forEach((warning) => {
                console.log(chalk_1.default.yellow(`   - ${warning}`));
            });
        }
    }
}
exports.TaskValidation = TaskValidation;
