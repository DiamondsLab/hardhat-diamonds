"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskHelpers = exports.ProgressIndicator = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
/**
 * Progress indicator for long-running operations
 */
class ProgressIndicator {
    interval = null;
    steps = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    currentStep = 0;
    message;
    constructor(message) {
        this.message = message;
    }
    /**
     * Start the progress indicator
     */
    start() {
        if (this.interval)
            return;
        this.interval = setInterval(() => {
            process.stdout.write(`\r${chalk_1.default.cyan(this.steps[this.currentStep])} ${this.message}`);
            this.currentStep = (this.currentStep + 1) % this.steps.length;
        }, 100);
    }
    /**
     * Stop the progress indicator
     *
     * @param finalMessage - Final message to display
     */
    stop(finalMessage) {
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
    updateMessage(message) {
        this.message = message;
    }
}
exports.ProgressIndicator = ProgressIndicator;
/**
 * Task helper utilities for hardhat-diamonds plugin
 *
 * This class provides common utilities for file operations, logging,
 * configuration access, and other shared functionality across tasks.
 */
class TaskHelpers {
    hre;
    diamondsConfig;
    /**
     * Create a new TaskHelpers instance
     *
     * @param hre - Hardhat runtime environment
     */
    constructor(hre) {
        this.hre = hre;
        this.diamondsConfig = hre.diamonds;
    }
    /**
     * Convert task arguments to internal generation options
     *
     * @param args - Task arguments
     * @returns Internal generation options
     */
    convertToGenerationOptions(args) {
        return {
            diamondName: args.diamondName,
            networkName: args.targetNetwork || this.hre.network.name,
            chainId: this.hre.network.config.chainId || 31337,
            outputDir: args.outputDir || (0, path_1.join)(this.hre.config.paths.root, "diamond-abi"),
            includeSourceInfo: args.includeSourceInfo ?? true,
            validateSelectors: args.validateSelectors ?? true,
            verbose: args.enableVerbose ?? false,
            diamondsPath: (0, path_1.join)(this.hre.config.paths.root, "diamonds"),
            contractPath: this.hre.config.paths.sources,
        };
    }
    /**
     * Ensure a directory exists, creating it if necessary
     *
     * @param dirPath - Directory path to ensure
     * @param verbose - Whether to log operations
     */
    ensureDirectory(dirPath, verbose = false) {
        const resolvedPath = this.resolvePath(dirPath);
        if (!(0, fs_1.existsSync)(resolvedPath)) {
            if (verbose) {
                console.log(chalk_1.default.cyan(`📁 Creating directory: ${resolvedPath}`));
            }
            (0, fs_1.mkdirSync)(resolvedPath, { recursive: true });
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
    safeWriteFile(filePath, content, verbose = false) {
        try {
            const resolvedPath = this.resolvePath(filePath);
            // Ensure parent directory exists
            this.ensureDirectory((0, path_1.dirname)(resolvedPath), verbose);
            if (verbose) {
                console.log(chalk_1.default.cyan(`📝 Writing file: ${resolvedPath}`));
            }
            (0, fs_1.writeFileSync)(resolvedPath, content, "utf-8");
            return true;
        }
        catch (error) {
            if (verbose) {
                console.error(chalk_1.default.red(`❌ Failed to write file ${filePath}: ${error}`));
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
    safeReadFile(filePath, verbose = false) {
        try {
            const resolvedPath = this.resolvePath(filePath);
            if (!(0, fs_1.existsSync)(resolvedPath)) {
                if (verbose) {
                    console.log(chalk_1.default.yellow(`⚠️  File not found: ${resolvedPath}`));
                }
                return null;
            }
            if (verbose) {
                console.log(chalk_1.default.cyan(`📖 Reading file: ${resolvedPath}`));
            }
            return (0, fs_1.readFileSync)(resolvedPath, "utf-8");
        }
        catch (error) {
            if (verbose) {
                console.error(chalk_1.default.red(`❌ Failed to read file ${filePath}: ${error}`));
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
    getDiamondConfig(diamondName) {
        try {
            return this.diamondsConfig.getDiamondConfig(diamondName);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Get all available diamond configurations
     *
     * @returns Array of diamond names
     */
    getAvailableDiamonds() {
        try {
            const diamonds = this.diamondsConfig.diamonds;
            return Object.keys(diamonds.paths || {});
        }
        catch {
            return [];
        }
    }
    /**
     * Check if a diamond configuration exists
     *
     * @param diamondName - Name of the diamond
     * @returns Whether the configuration exists
     */
    diamondConfigExists(diamondName) {
        return this.getDiamondConfig(diamondName) !== null;
    }
    /**
     * Get network information
     *
     * @returns Network information object
     */
    getNetworkInfo() {
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
    static formatFileSize(bytes) {
        if (bytes === 0)
            return "0 B";
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
    static formatDuration(milliseconds) {
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
    static createTimer() {
        let startTime = 0;
        let endTime = 0;
        return {
            start() {
                startTime = Date.now();
            },
            stop() {
                endTime = Date.now();
                return endTime - startTime;
            },
            elapsed() {
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
    logTaskStart(taskName, args) {
        console.log(chalk_1.default.blue(`🚀 Starting ${taskName} task...`));
        console.log(chalk_1.default.gray(`   Diamond: ${args.diamondName}`));
        console.log(chalk_1.default.gray(`   Network: ${this.hre.network.name}`));
        if (args.verbose) {
            console.log(chalk_1.default.gray("   Arguments:"));
            Object.entries(args).forEach(([key, value]) => {
                if (value !== undefined) {
                    console.log(chalk_1.default.gray(`     ${key}: ${value}`));
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
    logTaskCompletion(taskName, duration, success) {
        const durationStr = TaskHelpers.formatDuration(duration);
        if (success) {
            console.log(chalk_1.default.green(`✅ ${taskName} completed successfully in ${durationStr}`));
        }
        else {
            console.log(chalk_1.default.red(`❌ ${taskName} failed after ${durationStr}`));
        }
    }
    /**
     * Log verbose information with consistent formatting
     *
     * @param message - Message to log
     * @param data - Optional data to include
     */
    logVerbose(message, data) {
        console.log(chalk_1.default.cyan(`   ${message}`));
        if (data !== undefined) {
            if (typeof data === "object") {
                console.log(chalk_1.default.gray(`     ${JSON.stringify(data, null, 2)}`));
            }
            else {
                console.log(chalk_1.default.gray(`     ${data}`));
            }
        }
    }
    /**
     * Resolve path relative to Hardhat project root
     *
     * @param path - Path to resolve
     * @returns Resolved absolute path
     */
    resolvePath(path) {
        if ((0, path_1.resolve)(path) === path) {
            return path;
        }
        return (0, path_1.resolve)(this.hre.config.paths.root, path);
    }
    /**
     * Get project paths with proper resolution
     *
     * @returns Object containing resolved project paths
     */
    getProjectPaths() {
        const root = this.hre.config.paths.root;
        return {
            root,
            sources: this.hre.config.paths.sources,
            artifacts: this.hre.config.paths.artifacts,
            cache: this.hre.config.paths.cache,
            tests: this.hre.config.paths.tests,
            diamonds: (0, path_1.join)(root, "diamonds"),
            diamondAbi: (0, path_1.join)(root, "diamond-abi"),
            typechainTypes: (0, path_1.join)(root, "diamond-typechain-types"),
        };
    }
    /**
     * Validate and normalize task arguments
     *
     * @param args - Raw task arguments
     * @returns Normalized arguments with defaults applied
     */
    normalizeTaskArgs(args) {
        const normalized = { ...args };
        // Apply defaults
        normalized.outputDir =
            normalized.outputDir || (0, path_1.join)(this.hre.config.paths.root, "diamond-abi");
        normalized.network =
            normalized.targetNetwork || this.hre.network.name;
        // Add verbose property for internal compatibility
        normalized.verbose = normalized.enableVerbose ?? false;
        normalized.validateSelectors = normalized.validateSelectors ?? true;
        normalized.includeSourceInfo = normalized.includeSourceInfo ?? true;
        // For TypeChain args - check if this looks like a TypeChain task
        // by checking if it has typechainTarget or typechainOutDir properties OR
        // if the args object was passed as DiamondAbiTypechainTaskArgs
        const hasTypechainProps = "typechainTarget" in args || "typechainOutDir" in args;
        if (hasTypechainProps || args.__isTypechainTask) {
            const typechainArgs = normalized;
            typechainArgs.typechainTarget =
                typechainArgs.typechainTarget || "ethers-v6";
            typechainArgs.typechainOutDir =
                typechainArgs.typechainOutDir ||
                    (0, path_1.join)(this.hre.config.paths.root, "diamond-typechain-types");
        }
        return normalized;
    }
}
exports.TaskHelpers = TaskHelpers;
