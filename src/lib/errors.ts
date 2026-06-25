/**
 * Custom error class for Diamond flatten operations
 *
 * Provides structured error information including:
 * - Machine-readable error code
 * - Human-readable suggestion for resolution
 * - Additional context for debugging
 *
 * @example
 * ```typescript
 * throw new FlattenError(
 *   'Diamond "MyDiamond" not found in configuration',
 *   FlattenErrorCode.DIAMOND_NOT_FOUND,
 *   'Check diamonds.paths in hardhat.config.ts',
 *   { diamondName: 'MyDiamond' }
 * );
 * ```
 */
export class FlattenError extends Error {
  /**
   * Machine-readable error code for programmatic handling
   */
  public readonly code: string;

  /**
   * Human-readable suggestion for resolving the error
   */
  public readonly suggestion?: string;

  /**
   * Additional context information about the error
   */
  public readonly context?: Record<string, unknown>;

  /**
   * Creates a new FlattenError
   *
   * @param message - Clear description of what went wrong
   * @param code - Machine-readable error code from FlattenErrorCode
   * @param suggestion - Optional actionable suggestion for fixing the error
   * @param context - Optional context information (e.g., diamond name, file paths)
   */
  constructor(
    message: string,
    code: string,
    suggestion?: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "FlattenError";
    this.code = code;
    this.suggestion = suggestion;
    this.context = context;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FlattenError);
    }
  }
}

/**
 * Standard error codes for Diamond flatten operations
 *
 * Each error code corresponds to a specific failure condition:
 *
 * - **DIAMOND_NOT_FOUND**: Diamond configuration doesn't exist in hardhat.config.ts
 * - **FACET_SOURCE_NOT_FOUND**: Facet source .sol file is missing or uncompiled
 * - **DEPENDENCY_RESOLUTION_FAILED**: Cannot resolve contract imports/dependencies
 * - **CIRCULAR_DEPENDENCY**: Import cycle detected between contracts
 * - **FILE_WRITE_FAILED**: Cannot write output file (permissions/disk space)
 * - **VALIDATION_FAILED**: Task arguments failed validation
 *
 * @example
 * ```typescript
 * if (!diamondExists) {
 *   throw new FlattenError(
 *     `Diamond "${name}" not found`,
 *     FlattenErrorCode.DIAMOND_NOT_FOUND,
 *     'Check diamonds.paths in hardhat.config.ts'
 *   );
 * }
 * ```
 */
export const FlattenErrorCode = {
  /**
   * Diamond configuration not found in hardhat.config.ts
   *
   * **Trigger**: Requested diamond name doesn't exist in diamonds.paths configuration
   *
   * **Suggestion**: Check diamonds.paths in hardhat.config.ts
   */
  DIAMOND_NOT_FOUND: "DIAMOND_NOT_FOUND",

  /**
   * Facet source file not found or not compiled
   *
   * **Trigger**: Cannot locate .sol file for a facet listed in diamond configuration
   *
   * **Suggestion**: Ensure contract is compiled and path is correct
   */
  FACET_SOURCE_NOT_FOUND: "FACET_SOURCE_NOT_FOUND",

  /**
   * Dependency resolution failed
   *
   * **Trigger**: Cannot resolve import statements in contract source files
   *
   * **Suggestion**: Run 'npx hardhat compile' and ensure all imports are valid
   */
  DEPENDENCY_RESOLUTION_FAILED: "DEPENDENCY_RESOLUTION_FAILED",

  /**
   * Circular dependency detected
   *
   * **Trigger**: Import cycle found between contracts (A imports B imports A)
   *
   * **Suggestion**: Refactor contracts to remove circular imports
   */
  CIRCULAR_DEPENDENCY: "CIRCULAR_DEPENDENCY",

  /**
   * File write operation failed
   *
   * **Trigger**: Cannot write flattened output to specified file path
   *
   * **Suggestion**: Check directory permissions and available disk space
   */
  FILE_WRITE_FAILED: "FILE_WRITE_FAILED",

  /**
   * Argument validation failed
   *
   * **Trigger**: Task arguments don't meet validation requirements
   *
   * **Suggestion**: See validation errors above
   */
  VALIDATION_FAILED: "VALIDATION_FAILED",
} as const;

/**
 * Type representing valid error codes
 */
export type FlattenErrorCodeType =
  (typeof FlattenErrorCode)[keyof typeof FlattenErrorCode];
