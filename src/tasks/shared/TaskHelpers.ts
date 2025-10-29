import { HardhatRuntimeEnvironment } from "hardhat/types";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, resolve, dirname } from "path";
import chalk from "chalk";
import { DiamondsConfig } from "../../DiamondsConfig";
import {
  DiamondAbiTaskArgs,
  DiamondAbiTypechainTaskArgs,
  DiamondAbiGenerationOptions,
} from "./TaskOptions";

/**
 * Progress indicator for long-running operations
 */
export class ProgressIndicator {
  private interval: NodeJS.Timeout | null = null;
  private steps = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  private currentStep = 0;
  private message: string;

  constructor(message: string) {
    this.message = message;
  }

  /**
   * Start the progress indicator
   */
  start(): void {
    if (this.interval) return;

    this.interval = setInterval(() => {
      process.stdout.write(
        `\r${chalk.cyan(this.steps[this.currentStep])} ${this.message}`
      );
      this.currentStep = (this.currentStep + 1) % this.steps.length;
    }, 100);
  }

  /**
   * Stop the progress indicator
   *
   * @param finalMessage - Final message to display
   */
  stop(finalMessage?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    process.stdout.write("\r" + " ".repeat(this.message.length + 5) + "\r");

    if (finalMessage) {
      console.log(finalMessage);
    }
  }

  /**
   * Update the progress message
   *
   * @param message - New message to display
   */
  updateMessage(message: string): void {
    this.message = message;
  }
}

/**
 * Task helper utilities for hardhat-diamonds plugin
 *
 * This class provides common utilities for file operations, logging,
 * configuration access, and other shared functionality across tasks.
 */
export class TaskHelpers {
  private hre: HardhatRuntimeEnvironment;
  private diamondsConfig: DiamondsConfig;

  /**
   * Create a new TaskHelpers instance
   *
   * @param hre - Hardhat runtime environment
   */
  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre;
    this.diamondsConfig = hre.diamonds;
  }

  /**
   * Convert task arguments to internal generation options
   *
   * @param args - Task arguments
   * @returns Internal generation options
   */
  convertToGenerationOptions(
    args: DiamondAbiTaskArgs
  ): DiamondAbiGenerationOptions {
    return {
      diamondName: args.diamondName,
      networkName: args.targetNetwork || this.hre.network.name,
      chainId: this.hre.network.config.chainId || 31337,
      outputDir:
        args.outputDir || join(this.hre.config.paths.root, "diamond-abi"),
      includeSourceInfo: args.includeSourceInfo ?? true,
      validateSelectors: args.validateSelectors ?? true,
      verbose: args.enableVerbose ?? false,
      diamondsPath: join(this.hre.config.paths.root, "diamonds"),
      contractPath: this.hre.config.paths.sources,
    };
  }

  /**
   * Ensure a directory exists, creating it if necessary
   *
   * @param dirPath - Directory path to ensure
   * @param verbose - Whether to log operations
   */
  ensureDirectory(dirPath: string, verbose = false): void {
    const resolvedPath = this.resolvePath(dirPath);

    if (!existsSync(resolvedPath)) {
      if (verbose) {
        console.log(chalk.cyan(`📁 Creating directory: ${resolvedPath}`));
      }
      mkdirSync(resolvedPath, { recursive: true });
    }
  }

  /**
   * Safely write a file with proper error handling
   *
   * @param filePath - File path to write
   * @param content - Content to write
   * @param verbose - Whether to log operations
   * @returns Whether the operation was successful
   */
  safeWriteFile(filePath: string, content: string, verbose = false): boolean {
    try {
      const resolvedPath = this.resolvePath(filePath);

      // Ensure parent directory exists
      this.ensureDirectory(dirname(resolvedPath), verbose);

      if (verbose) {
        console.log(chalk.cyan(`📝 Writing file: ${resolvedPath}`));
      }

      writeFileSync(resolvedPath, content, "utf-8");
      return true;
    } catch (error) {
      if (verbose) {
        console.error(
          chalk.red(`❌ Failed to write file ${filePath}: ${error}`)
        );
      }
      return false;
    }
  }

  /**
   * Safely read a file with proper error handling
   *
   * @param filePath - File path to read
   * @param verbose - Whether to log operations
   * @returns File content or null if failed
   */
  safeReadFile(filePath: string, verbose = false): string | null {
    try {
      const resolvedPath = this.resolvePath(filePath);

      if (!existsSync(resolvedPath)) {
        if (verbose) {
          console.log(chalk.yellow(`⚠️  File not found: ${resolvedPath}`));
        }
        return null;
      }

      if (verbose) {
        console.log(chalk.cyan(`📖 Reading file: ${resolvedPath}`));
      }

      return readFileSync(resolvedPath, "utf-8");
    } catch (error) {
      if (verbose) {
        console.error(
          chalk.red(`❌ Failed to read file ${filePath}: ${error}`)
        );
      }
      return null;
    }
  }

  /**
   * Get diamond configuration with enhanced error handling
   *
   * @param diamondName - Name of the diamond
   * @returns Diamond configuration or null if not found
   */
  getDiamondConfig(diamondName: string): any {
    try {
      return this.diamondsConfig.getDiamondConfig(diamondName);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all available diamond configurations
   *
   * @returns Array of diamond names
   */
  getAvailableDiamonds(): string[] {
    try {
      const diamonds = this.diamondsConfig.diamonds;
      return Object.keys(diamonds.paths || {});
    } catch {
      return [];
    }
  }

  /**
   * Check if a diamond configuration exists
   *
   * @param diamondName - Name of the diamond
   * @returns Whether the configuration exists
   */
  diamondConfigExists(diamondName: string): boolean {
    return this.getDiamondConfig(diamondName) !== null;
  }

  /**
   * Get network information
   *
   * @returns Network information object
   */
  getNetworkInfo(): {
    name: string;
    chainId?: number;
    url?: string;
    isLocal: boolean;
  } {
    const network = this.hre.network;
    const config = network.config;

    return {
      name: network.name,
      chainId: config.chainId,
      url: "url" in config ? config.url : undefined,
      isLocal: network.name === "hardhat" || network.name === "localhost",
    };
  }

  /**
   * Format file size for display
   *
   * @param bytes - Size in bytes
   * @returns Formatted size string
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Format duration for display
   *
   * @param milliseconds - Duration in milliseconds
   * @returns Formatted duration string
   */
  static formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }

    const seconds = Math.floor(milliseconds / 1000);
    const remainingMs = milliseconds % 1000;

    if (seconds < 60) {
      return remainingMs > 0
        ? `${seconds}.${Math.floor(remainingMs / 100)}s`
        : `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Create a simple performance timer
   *
   * @returns Timer object with start and stop methods
   */
  static createTimer(): {
    start(): void;
    stop(): number;
    elapsed(): number;
  } {
    let startTime = 0;
    let endTime = 0;

    return {
      start(): void {
        startTime = Date.now();
      },
      stop(): number {
        endTime = Date.now();
        return endTime - startTime;
      },
      elapsed(): number {
        return endTime > 0 ? endTime - startTime : Date.now() - startTime;
      },
    };
  }

  /**
   * Log task start with formatting
   *
   * @param taskName - Name of the task
   * @param args - Task arguments (for logging)
   */
  logTaskStart(taskName: string, args: any): void {
    console.log(chalk.blue(`🚀 Starting ${taskName} task...`));
    console.log(chalk.gray(`   Diamond: ${args.diamondName}`));
    console.log(chalk.gray(`   Network: ${this.hre.network.name}`));

    if (args.verbose) {
      console.log(chalk.gray("   Arguments:"));
      Object.entries(args).forEach(([key, value]) => {
        if (value !== undefined) {
          console.log(chalk.gray(`     ${key}: ${value}`));
        }
      });
    }
  }

  /**
   * Log task completion with formatting
   *
   * @param taskName - Name of the task
   * @param duration - Task duration in milliseconds
   * @param success - Whether the task was successful
   */
  logTaskCompletion(
    taskName: string,
    duration: number,
    success: boolean
  ): void {
    const durationStr = TaskHelpers.formatDuration(duration);

    if (success) {
      console.log(
        chalk.green(`✅ ${taskName} completed successfully in ${durationStr}`)
      );
    } else {
      console.log(chalk.red(`❌ ${taskName} failed after ${durationStr}`));
    }
  }

  /**
   * Log verbose information with consistent formatting
   *
   * @param message - Message to log
   * @param data - Optional data to include
   */
  logVerbose(message: string, data?: any): void {
    console.log(chalk.cyan(`   ${message}`));

    if (data !== undefined) {
      if (typeof data === "object") {
        console.log(chalk.gray(`     ${JSON.stringify(data, null, 2)}`));
      } else {
        console.log(chalk.gray(`     ${data}`));
      }
    }
  }

  /**
   * Resolve path relative to Hardhat project root
   *
   * @param path - Path to resolve
   * @returns Resolved absolute path
   */
  private resolvePath(path: string): string {
    if (resolve(path) === path) {
      return path;
    }
    return resolve(this.hre.config.paths.root, path);
  }

  /**
   * Get project paths with proper resolution
   *
   * @returns Object containing resolved project paths
   */
  getProjectPaths(): {
    root: string;
    sources: string;
    artifacts: string;
    cache: string;
    tests: string;
    diamonds: string;
    diamondAbi: string;
    typechainTypes: string;
  } {
    const root = this.hre.config.paths.root;

    return {
      root,
      sources: this.hre.config.paths.sources,
      artifacts: this.hre.config.paths.artifacts,
      cache: this.hre.config.paths.cache,
      tests: this.hre.config.paths.tests,
      diamonds: join(root, "diamonds"),
      diamondAbi: join(root, "diamond-abi"),
      typechainTypes: join(root, "diamond-typechain-types"),
    };
  }

  /**
   * Validate and normalize task arguments
   *
   * @param args - Raw task arguments
   * @returns Normalized arguments with defaults applied
   */
  normalizeTaskArgs<T extends DiamondAbiTaskArgs>(args: T): T {
    const normalized = { ...args };

    // Apply defaults
    normalized.outputDir =
      normalized.outputDir || join(this.hre.config.paths.root, "diamond-abi");
    (normalized as any).network =
      (normalized as any).targetNetwork || this.hre.network.name;
    // Add verbose property for internal compatibility
    (normalized as any).verbose = normalized.enableVerbose ?? false;
    normalized.validateSelectors = normalized.validateSelectors ?? true;
    normalized.includeSourceInfo = normalized.includeSourceInfo ?? true;

    // For TypeChain args - check if this looks like a TypeChain task
    // by checking if it has typechainTarget or typechainOutDir properties OR
    // if the args object was passed as DiamondAbiTypechainTaskArgs
    const hasTypechainProps =
      "typechainTarget" in args || "typechainOutDir" in args;
    if (hasTypechainProps || (args as any).__isTypechainTask) {
      const typechainArgs = normalized as any as DiamondAbiTypechainTaskArgs;
      typechainArgs.typechainTarget =
        typechainArgs.typechainTarget || "ethers-v6";
      typechainArgs.typechainOutDir =
        typechainArgs.typechainOutDir ||
        join(this.hre.config.paths.root, "diamond-typechain-types");
    }

    return normalized;
  }
}
