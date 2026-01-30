import { HardhatRuntimeEnvironment } from "hardhat/types";
import { existsSync, accessSync, constants, statSync } from "fs";
import { join, resolve, isAbsolute, dirname, extname } from "path";
import chalk from "chalk";
import {
  DiamondAbiTaskArgs,
  DiamondAbiTypechainTaskArgs,
  DiamondFlattenTaskArgs,
} from "./TaskOptions";

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
export class TaskValidation {
  private hre: HardhatRuntimeEnvironment;

  /**
   * Create a new TaskValidation instance
   *
   * @param hre - Hardhat runtime environment
   */
  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre;
  }

  /**
   * Validate diamond ABI task arguments
   *
   * @param args - Task arguments to validate
   * @returns Validation result
   */
  validateDiamondAbiArgs(args: DiamondAbiTaskArgs): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (
      !args.diamondName ||
      typeof args.diamondName !== "string" ||
      args.diamondName.trim() === ""
    ) {
      errors.push({
        field: "diamondName",
        message: "Diamond name is required and must be a non-empty string",
        suggestion:
          "Provide a valid diamond name, e.g., --diamond-name ExampleDiamond",
      });
    } else {
      // Validate diamond name format
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(args.diamondName)) {
        errors.push({
          field: "diamondName",
          message:
            "Diamond name must start with a letter and contain only letters, numbers, and underscores",
          suggestion:
            "Use a valid identifier format, e.g., ExampleDiamond or MyDiamond_V2",
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
    if (
      (args as any).targetNetwork !== undefined &&
      (args as any).targetNetwork !== null
    ) {
      const networkValidation = this.validateNetwork(
        (args as any).targetNetwork
      );
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
  validateDiamondAbiTypechainArgs(
    args: DiamondAbiTypechainTaskArgs
  ): ValidationResult {
    // First validate base ABI arguments
    const baseValidation = this.validateDiamondAbiArgs(args);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Validate TypeChain-specific arguments
    if (args.typechainTarget !== undefined) {
      const targetValidation = this.validateTypechainTarget(
        args.typechainTarget
      );
      if (!targetValidation.isValid) {
        errors.push(...targetValidation.errors);
        warnings.push(...targetValidation.warnings);
      }
    }

    if (args.typechainOutDir !== undefined) {
      const outDirValidation = this.validateOutputDirectory(
        args.typechainOutDir
      );
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
   * Validate diamond flatten task arguments
   *
   * @param args - Task arguments to validate
   * @returns Validation result
   */
  validateDiamondFlattenArgs(args: DiamondFlattenTaskArgs): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Validate required diamond name
    if (
      !args.diamondName ||
      typeof args.diamondName !== "string" ||
      args.diamondName.trim() === ""
    ) {
      errors.push({
        field: "diamondName",
        message: "Diamond name is required and must be a non-empty string",
        suggestion:
          "Provide a valid diamond name, e.g., --diamond-name ExampleDiamond",
      });
    } else {
      // Validate diamond name format
      if (!/^[a-zA-Z0-9_-]+$/.test(args.diamondName)) {
        errors.push({
          field: "diamondName",
          message:
            "Diamond name must contain only letters, numbers, underscores, and hyphens",
          suggestion:
            "Use a valid identifier format, e.g., ExampleDiamond or MyDiamond-V2",
        });
      } else {
        // Check if diamond configuration exists
        try {
          const diamondConfig = this.hre.diamonds.getDiamondConfig(
            args.diamondName
          );
          if (!diamondConfig) {
            const availableDiamonds = Object.keys(
              this.hre.config.diamonds?.paths || {}
            );
            errors.push({
              field: "diamondName",
              message: `Diamond "${args.diamondName}" not found in configuration`,
              suggestion:
                availableDiamonds.length > 0
                  ? `Available diamonds: ${availableDiamonds.join(", ")}`
                  : "Add diamond configuration to hardhat.config.ts",
            });
          }
        } catch (error) {
          warnings.push(
            `Could not verify diamond configuration: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    // Validate optional output path
    if (args.output !== undefined && args.output !== null) {
      if (typeof args.output !== "string" || args.output.trim() === "") {
        errors.push({
          field: "output",
          message: "Output path must be a non-empty string when provided",
          suggestion:
            "Provide a valid file path, e.g., --output ./flat/Diamond.sol",
        });
      } else {
        const resolvedPath = this.resolvePath(args.output);

        // Check if path is a directory
        if (existsSync(resolvedPath)) {
          try {
            const stats = statSync(resolvedPath);
            if (stats.isDirectory()) {
              errors.push({
                field: "output",
                message: `Output path must be a file, not a directory: ${resolvedPath}`,
                suggestion:
                  "Provide a file path with a filename, e.g., ./flat/Diamond.sol",
              });
            }
          } catch (error) {
            errors.push({
              field: "output",
              message: `Cannot access output path: ${error instanceof Error ? error.message : String(error)}`,
              suggestion: "Check path validity and permissions",
            });
          }
        } else {
          // Validate parent directory exists or can be created
          const parentDir = dirname(resolvedPath);
          if (existsSync(parentDir)) {
            try {
              accessSync(parentDir, constants.W_OK);
            } catch {
              errors.push({
                field: "output",
                message: `Cannot write to parent directory: ${parentDir}`,
                suggestion:
                  "Check directory permissions or choose a different path",
              });
            }
          } else {
            warnings.push(`Parent directory will be created: ${parentDir}`);
          }
        }

        // Warn if extension is not .sol
        const ext = extname(args.output);
        if (ext && ext !== ".sol") {
          warnings.push(
            `Output file extension is "${ext}" instead of ".sol" - this may not be a Solidity file`
          );
        } else if (!ext) {
          warnings.push(
            "Output file has no extension - consider using .sol extension"
          );
        }

        // Validate path format
        if (args.output.includes("..") && !isAbsolute(args.output)) {
          warnings.push(
            'Relative paths with ".." can be dangerous, consider using absolute paths'
          );
        }
      }
    }

    // Validate network if provided
    if (args.network !== undefined && args.network !== null) {
      const networkValidation = this.validateNetwork(args.network);
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
   * Validate diamond configuration exists and is accessible
   *
   * @param diamondName - Name of the diamond to validate
   * @returns Validation result
   */
  validateDiamondConfiguration(diamondName: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Check if diamond configuration exists in hardhat-diamonds plugin
      const diamondConfig = this.hre.diamonds.getDiamondConfig(diamondName);

      if (!diamondConfig) {
        errors.push({
          field: "diamondName",
          message: `Diamond configuration for "${diamondName}" not found`,
          suggestion:
            "Add diamond configuration to your hardhat.config.ts diamonds section",
        });
        return { isValid: false, errors, warnings };
      }

      // Validate deployment path if specified
      if (diamondConfig.deploymentsPath) {
        const deploymentPath = this.resolvePath(diamondConfig.deploymentsPath);
        if (!existsSync(deploymentPath)) {
          warnings.push(`Deployment path not found: ${deploymentPath}`);
        }
      }

      // Validate contracts path if specified
      if (diamondConfig.contractsPath) {
        const contractsPath = this.resolvePath(diamondConfig.contractsPath);
        if (!existsSync(contractsPath)) {
          warnings.push(`Contracts path not found: ${contractsPath}`);
        }
      }

      // Check for diamond configuration file
      const configPath = join(
        this.hre.config.paths.root,
        "diamonds",
        diamondName,
        `${diamondName.toLowerCase()}.config.json`
      );

      if (!existsSync(configPath)) {
        warnings.push(`Diamond configuration file not found: ${configPath}`);
        warnings.push(
          "ABI generation will fall back to deployment data or basic configuration"
        );
      }
    } catch (error) {
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
  private validateOutputDirectory(outputDir: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (
      !outputDir ||
      typeof outputDir !== "string" ||
      outputDir.trim() === ""
    ) {
      errors.push({
        field: "outputDir",
        message: "Output directory must be a non-empty string",
        suggestion: "Provide a valid directory path",
      });
      return { isValid: false, errors, warnings };
    }

    const resolvedPath = this.resolvePath(outputDir);

    // Check if path exists
    if (existsSync(resolvedPath)) {
      try {
        const stat = statSync(resolvedPath);
        if (!stat.isDirectory()) {
          errors.push({
            field: "outputDir",
            message: `Output path exists but is not a directory: ${resolvedPath}`,
            suggestion: "Choose a different path or remove the existing file",
          });
        } else {
          // Check write permissions
          try {
            accessSync(resolvedPath, constants.W_OK);
          } catch {
            errors.push({
              field: "outputDir",
              message: `Output directory is not writable: ${resolvedPath}`,
              suggestion:
                "Check directory permissions or choose a different path",
            });
          }
        }
      } catch (error) {
        errors.push({
          field: "outputDir",
          message: `Cannot access output directory: ${error instanceof Error ? error.message : String(error)}`,
          suggestion: "Check path validity and permissions",
        });
      }
    } else {
      // Check if parent directory exists and is writable
      const parentDir = resolve(resolvedPath, "..");
      if (existsSync(parentDir)) {
        try {
          accessSync(parentDir, constants.W_OK);
        } catch {
          errors.push({
            field: "outputDir",
            message: `Cannot create directory, parent is not writable: ${parentDir}`,
            suggestion:
              "Check parent directory permissions or choose a different path",
          });
        }
      } else {
        warnings.push(`Parent directory will be created: ${parentDir}`);
      }
    }

    // Validate path format
    if (outputDir.includes("..") && !isAbsolute(outputDir)) {
      warnings.push(
        'Relative paths with ".." can be dangerous, consider using absolute paths'
      );
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
  private validateNetwork(networkName: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (
      !networkName ||
      typeof networkName !== "string" ||
      networkName.trim() === ""
    ) {
      errors.push({
        field: "network",
        message: "Network name must be a non-empty string",
        suggestion:
          "Provide a valid network name from your Hardhat configuration",
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
    } else {
      // Validate network configuration
      const networkConfig = networks[networkName];
      if (networkConfig.chainId === undefined) {
        warnings.push(
          `Network "${networkName}" does not have a chainId configured`
        );
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
  private validateTypechainTarget(target: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

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
  validateSystemRequirements(includeTypeChain = false): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0], 10);
    if (majorVersion < 16) {
      warnings.push(
        `Node.js version ${nodeVersion} detected, recommend version 16 or higher`
      );
    }

    // Check if diamonds module is available
    // Try to resolve from the consuming project's context first
    try {
      const projectRoot = this.hre.config.paths.root;
      require.resolve("@diamondslab/diamonds", {
        paths: [projectRoot, process.cwd()],
      });
    } catch {
      errors.push({
        field: "dependencies",
        message: "diamonds module not found",
        suggestion:
          "Install the diamonds module: npm install @diamondslab/diamonds",
      });
    }

    // Check if ethers is available
    try {
      const projectRoot = this.hre.config.paths.root;
      require.resolve("ethers", {
        paths: [projectRoot, process.cwd()],
      });
    } catch {
      errors.push({
        field: "dependencies",
        message: "ethers module not found",
        suggestion: "Install ethers: npm install ethers",
      });
    }

    // TypeChain-specific validation
    if (includeTypeChain) {
      try {
        const projectRoot = this.hre.config.paths.root;
        require.resolve("typechain", {
          paths: [projectRoot, process.cwd()],
        });
      } catch {
        errors.push({
          field: "dependencies",
          message: "typechain module not found",
          suggestion:
            "Install TypeChain: npm install --save-dev typechain @typechain/ethers-v6",
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
  private resolvePath(path: string): string {
    if (isAbsolute(path)) {
      return path;
    }
    return resolve(this.hre.config.paths.root, path);
  }

  /**
   * Format validation errors for display
   *
   * @param result - Validation result to format
   * @param verbose - Whether to show verbose output
   */
  static formatValidationResult(
    result: ValidationResult,
    verbose = false
  ): void {
    if (result.isValid) {
      if (verbose && result.warnings.length > 0) {
        console.log(chalk.yellow("⚠️  Validation warnings:"));
        result.warnings.forEach((warning) => {
          console.log(chalk.yellow(`   - ${warning}`));
        });
      }
      return;
    }

    console.log(chalk.red("❌ Validation failed:"));
    result.errors.forEach((error) => {
      console.log(chalk.red(`   ${error.field}: ${error.message}`));
      if (error.suggestion) {
        console.log(chalk.cyan(`   💡 ${error.suggestion}`));
      }
    });

    if (result.warnings.length > 0) {
      console.log(chalk.yellow("⚠️  Additional warnings:"));
      result.warnings.forEach((warning) => {
        console.log(chalk.yellow(`   - ${warning}`));
      });
    }
  }
}
