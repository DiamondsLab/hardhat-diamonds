import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DiamondAbiTaskArgs, DiamondAbiGenerationOptions } from "./TaskOptions";
/**
 * Progress indicator for long-running operations
 */
export declare class ProgressIndicator {
    private interval;
    private steps;
    private currentStep;
    private message;
    constructor(message: string);
    /**
     * Start the progress indicator
     */
    start(): void;
    /**
     * Stop the progress indicator
     *
     * @param finalMessage - Final message to display
     */
    stop(finalMessage?: string): void;
    /**
     * Update the progress message
     *
     * @param message - New message to display
     */
    updateMessage(message: string): void;
}
/**
 * Task helper utilities for hardhat-diamonds plugin
 *
 * This class provides common utilities for file operations, logging,
 * configuration access, and other shared functionality across tasks.
 */
export declare class TaskHelpers {
    private hre;
    private diamondsConfig;
    /**
     * Create a new TaskHelpers instance
     *
     * @param hre - Hardhat runtime environment
     */
    constructor(hre: HardhatRuntimeEnvironment);
    /**
     * Convert task arguments to internal generation options
     *
     * @param args - Task arguments
     * @returns Internal generation options
     */
    convertToGenerationOptions(args: DiamondAbiTaskArgs): DiamondAbiGenerationOptions;
    /**
     * Ensure a directory exists, creating it if necessary
     *
     * @param dirPath - Directory path to ensure
     * @param verbose - Whether to log operations
     */
    ensureDirectory(dirPath: string, verbose?: boolean): void;
    /**
     * Safely write a file with proper error handling
     *
     * @param filePath - File path to write
     * @param content - Content to write
     * @param verbose - Whether to log operations
     * @returns Whether the operation was successful
     */
    safeWriteFile(filePath: string, content: string, verbose?: boolean): boolean;
    /**
     * Safely read a file with proper error handling
     *
     * @param filePath - File path to read
     * @param verbose - Whether to log operations
     * @returns File content or null if failed
     */
    safeReadFile(filePath: string, verbose?: boolean): string | null;
    /**
     * Get diamond configuration with enhanced error handling
     *
     * @param diamondName - Name of the diamond
     * @returns Diamond configuration or null if not found
     */
    getDiamondConfig(diamondName: string): any;
    /**
     * Get all available diamond configurations
     *
     * @returns Array of diamond names
     */
    getAvailableDiamonds(): string[];
    /**
     * Check if a diamond configuration exists
     *
     * @param diamondName - Name of the diamond
     * @returns Whether the configuration exists
     */
    diamondConfigExists(diamondName: string): boolean;
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
    };
    /**
     * Format file size for display
     *
     * @param bytes - Size in bytes
     * @returns Formatted size string
     */
    static formatFileSize(bytes: number): string;
    /**
     * Format duration for display
     *
     * @param milliseconds - Duration in milliseconds
     * @returns Formatted duration string
     */
    static formatDuration(milliseconds: number): string;
    /**
     * Create a simple performance timer
     *
     * @returns Timer object with start and stop methods
     */
    static createTimer(): {
        start(): void;
        stop(): number;
        elapsed(): number;
    };
    /**
     * Log task start with formatting
     *
     * @param taskName - Name of the task
     * @param args - Task arguments (for logging)
     */
    logTaskStart(taskName: string, args: any): void;
    /**
     * Log task completion with formatting
     *
     * @param taskName - Name of the task
     * @param duration - Task duration in milliseconds
     * @param success - Whether the task was successful
     */
    logTaskCompletion(taskName: string, duration: number, success: boolean): void;
    /**
     * Log verbose information with consistent formatting
     *
     * @param message - Message to log
     * @param data - Optional data to include
     */
    logVerbose(message: string, data?: any): void;
    /**
     * Resolve path relative to Hardhat project root
     *
     * @param path - Path to resolve
     * @returns Resolved absolute path
     */
    private resolvePath;
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
    };
    /**
     * Validate and normalize task arguments
     *
     * @param args - Raw task arguments
     * @returns Normalized arguments with defaults applied
     */
    normalizeTaskArgs<T extends DiamondAbiTaskArgs>(args: T): T;
}
