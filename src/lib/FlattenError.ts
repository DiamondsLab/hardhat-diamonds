/**
 * Custom error class for Diamond flattening operations
 *
 * Provides structured error handling with error codes and additional details
 * to help diagnose and fix issues during the flattening process.
 */
export class FlattenError extends Error {
  /**
   * Creates a new FlattenError instance
   *
   * @param message - Human-readable error message describing what went wrong
   * @param code - Machine-readable error code from ErrorCodes constant
   * @param details - Optional additional context or data related to the error
   * @param suggestion - Optional helpful suggestion for resolving the error
   */
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
    public suggestion?: string
  ) {
    super(message);
    this.name = "FlattenError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FlattenError);
    }
  }

  /**
   * Get error context (alias for details property for Epic 5 compatibility)
   */
  get context(): unknown {
    return this.details;
  }
}

/**
 * Standard error codes for Diamond flattening operations
 *
 * These codes help identify the type of error that occurred and can be used
 * for programmatic error handling.
 */
export const ErrorCodes = {
  /** Diamond configuration not found in Hardhat config */
  DIAMOND_NOT_FOUND: "DIAMOND_NOT_FOUND",

  /** Invalid or malformed Diamond configuration */
  INVALID_CONFIGURATION: "INVALID_CONFIGURATION",

  /** Network configuration error or network not found */
  NETWORK_ERROR: "NETWORK_ERROR",

  /** Failed to initialize Diamond instance from @diamondslab/diamonds module */
  DIAMOND_INITIALIZATION_FAILED: "DIAMOND_INITIALIZATION_FAILED",

  /** Failed to resolve contract source path */
  PATH_RESOLUTION_FAILED: "PATH_RESOLUTION_FAILED",

  /** Failed to extract function selectors from ABI */
  SELECTOR_EXTRACTION_FAILED: "SELECTOR_EXTRACTION_FAILED",

  /** Failed to load or parse contract ABI */
  ABI_LOAD_FAILED: "ABI_LOAD_FAILED",

  /** File system operation failed (read, write, etc.) */
  FILE_SYSTEM_ERROR: "FILE_SYSTEM_ERROR",
} as const;

/**
 * Type for error code values
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
