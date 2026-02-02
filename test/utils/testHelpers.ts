import { expect } from "chai";

/**
 * Shared test helper functions for Diamond Flatten test suites
 */

/**
 * Asserts that a function throws an error with a specific message
 * 
 * @param fn - Function that should throw
 * @param expectedMessage - Expected error message (substring match)
 * 
 * @example
 * ```typescript
 * await expectError(
 *   () => flattener.flatten(),
 *   'Diamond not found'
 * );
 * ```
 */
export async function expectError(
  fn: () => Promise<any>,
  expectedMessage: string
): Promise<void> {
  let error: Error | null = null;
  
  try {
    await fn();
  } catch (err) {
    error = err as Error;
  }
  
  expect(error).to.not.be.null;
  expect(error?.message).to.include(expectedMessage);
}

/**
 * Asserts that a function completes successfully without throwing
 * 
 * @param fn - Function that should succeed
 * @returns Promise resolving to the function's return value
 * 
 * @example
 * ```typescript
 * const result = await expectSuccess(() => flattener.flatten());
 * expect(result.stats.totalContracts).to.equal(4);
 * ```
 */
export async function expectSuccess<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new Error(
      `Expected function to succeed, but it threw: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Compares two Solidity source code strings, ignoring whitespace differences
 * 
 * @param actual - Actual source code
 * @param expected - Expected source code
 * @returns True if sources match (ignoring whitespace), false otherwise
 * 
 * @example
 * ```typescript
 * const match = compareSourceCode(flattenedOutput, expectedOutput);
 * expect(match).to.be.true;
 * ```
 */
export function compareSourceCode(actual: string, expected: string): boolean {
  // Normalize whitespace: remove extra spaces, normalize line endings
  const normalize = (source: string): string => {
    return source
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim();
  };
  
  return normalize(actual) === normalize(expected);
}

/**
 * Counts occurrences of a pattern in source code
 * 
 * @param source - Source code to search
 * @param pattern - String or RegExp pattern to count
 * @returns Number of occurrences
 * 
 * @example
 * ```typescript
 * const spdxCount = countOccurrences(flattenedSource, 'SPDX-License-Identifier');
 * expect(spdxCount).to.equal(1); // Should be deduplicated
 * ```
 */
export function countOccurrences(source: string, pattern: string | RegExp): number {
  if (typeof pattern === "string") {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const matches = source.match(regex);
    return matches ? matches.length : 0;
  } else {
    const matches = source.match(pattern);
    return matches ? matches.length : 0;
  }
}

/**
 * Extracts all function selectors from source code
 * 
 * @param source - Solidity source code
 * @returns Array of function signatures found
 * 
 * @example
 * ```typescript
 * const functions = extractFunctionSignatures(facetSource);
 * // Returns: ['setValue(uint256)', 'getValue()', ...]
 * ```
 */
export function extractFunctionSignatures(source: string): string[] {
  // Regex to match function declarations
  const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*(public|external|internal|private)?/g;
  const functions: string[] = [];
  let match;
  
  while ((match = functionRegex.exec(source)) !== null) {
    const functionName = match[1];
    const params = match[2]
      .split(",")
      .map((p) => p.trim().split(/\s+/)[0]) // Get type only
      .filter((p) => p.length > 0)
      .join(",");
    
    const signature = `${functionName}(${params})`;
    functions.push(signature);
  }
  
  return functions;
}

/**
 * Validates that a selector mapping table contains expected selectors
 * 
 * @param selectorTable - The selector mapping table string
 * @param expectedSelectors - Array of expected function selectors (0x prefixed)
 * @returns True if all expected selectors are present
 * 
 * @example
 * ```typescript
 * const isValid = validateSelectorTable(
 *   result.flattenedSource,
 *   ['0x12345678', '0xabcdef00']
 * );
 * expect(isValid).to.be.true;
 * ```
 */
export function validateSelectorTable(
  selectorTable: string,
  expectedSelectors: string[]
): boolean {
  return expectedSelectors.every((selector) => selectorTable.includes(selector));
}

/**
 * Extracts the selector mapping table from flattened output
 * 
 * @param flattenedSource - Complete flattened source code
 * @returns The selector mapping table section, or empty string if not found
 */
export function extractSelectorTable(flattenedSource: string): string {
  const tableStartMarker = "// Function Selector Mapping";
  const tableEndMarker = "// End Function Selector Mapping";
  
  const startIndex = flattenedSource.indexOf(tableStartMarker);
  if (startIndex === -1) return "";
  
  const endIndex = flattenedSource.indexOf(tableEndMarker, startIndex);
  if (endIndex === -1) return "";
  
  return flattenedSource.substring(startIndex, endIndex + tableEndMarker.length);
}

/**
 * Strips all comments from Solidity source code
 * 
 * @param source - Solidity source code
 * @returns Source code with comments removed
 */
export function stripComments(source: string): string {
  // Remove single-line comments
  let result = source.replace(/\/\/.*$/gm, "");
  
  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  
  return result;
}

/**
 * Counts the number of contract definitions in source code
 * 
 * @param source - Solidity source code
 * @returns Number of contract definitions found
 */
export function countContracts(source: string): number {
  const contractRegex = /contract\s+\w+/g;
  const matches = source.match(contractRegex);
  return matches ? matches.length : 0;
}

/**
 * Checks if source code contains a specific import statement
 * 
 * @param source - Solidity source code
 * @param importPath - Import path to search for
 * @returns True if import is present
 */
export function hasImport(source: string, importPath: string): boolean {
  const importRegex = new RegExp(`import\\s+.*${importPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
  return importRegex.test(source);
}

/**
 * Validates SPDX license identifier format and presence
 * 
 * @param source - Solidity source code
 * @returns Object with validation results
 */
export function validateSPDX(source: string): {
  present: boolean;
  count: number;
  license: string | null;
} {
  const spdxRegex = /\/\/\s*SPDX-License-Identifier:\s*([^\s\n]+)/g;
  const matches = source.match(spdxRegex);
  
  if (!matches || matches.length === 0) {
    return { present: false, count: 0, license: null };
  }
  
  // Extract license from first match
  const firstMatch = spdxRegex.exec(source);
  const license = firstMatch ? firstMatch[1] : null;
  
  return {
    present: true,
    count: matches.length,
    license,
  };
}
