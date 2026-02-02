import fs from "fs/promises";
import path from "path";

/**
 * Fixture loading utilities for test suites
 */

/**
 * Loads a fixture contract source file
 * 
 * @param fixturePath - Relative path to fixture from test/fixtures/flatten
 * @param contractName - Name of the contract file (e.g., 'SimpleDiamond.sol')
 * @returns Promise resolving to contract source code
 * 
 * @example
 * ```typescript
 * const source = await loadFixtureContract('simple/contracts', 'SimpleDiamond.sol');
 * ```
 */
export async function loadFixtureContract(
  fixturePath: string,
  contractName: string
): Promise<string> {
  const fixturesRoot = path.join(__dirname, "../fixtures/flatten");
  const contractPath = path.join(fixturesRoot, fixturePath, contractName);
  
  try {
    const source = await fs.readFile(contractPath, "utf-8");
    return source;
  } catch (error) {
    throw new Error(
      `Failed to load fixture contract at ${contractPath}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Loads a diamond configuration file from fixtures
 * 
 * @param diamondName - Name of the diamond (e.g., 'SimpleDiamond')
 * @param fixturePath - Path to fixture directory
 * @returns Promise resolving to parsed configuration object
 * 
 * @example
 * ```typescript
 * const config = await loadFixtureDiamond('SimpleDiamond', 'simple');
 * ```
 */
export async function loadFixtureDiamond(
  diamondName: string,
  fixturePath: string
): Promise<any> {
  const fixturesRoot = path.join(__dirname, "../fixtures/flatten");
  const configPath = path.join(
    fixturesRoot,
    fixturePath,
    "diamonds",
    diamondName,
    `${diamondName}.config.json`
  );
  
  try {
    const configContent = await fs.readFile(configPath, "utf-8");
    return JSON.parse(configContent);
  } catch (error) {
    throw new Error(
      `Failed to load fixture diamond config at ${configPath}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Gets the absolute path to a fixture directory
 * 
 * @param fixturePath - Relative path from test/fixtures/flatten
 * @returns Absolute path to fixture directory
 * 
 * @example
 * ```typescript
 * const simplePath = getFixturePath('simple/contracts');
 * // Returns: /absolute/path/to/test/fixtures/flatten/simple/contracts
 * ```
 */
export function getFixturePath(fixturePath: string): string {
  const fixturesRoot = path.join(__dirname, "../fixtures/flatten");
  return path.join(fixturesRoot, fixturePath);
}

/**
 * Checks if a fixture file exists
 * 
 * @param fixturePath - Relative path to fixture from test/fixtures/flatten
 * @param fileName - Name of the file to check
 * @returns Promise resolving to true if file exists, false otherwise
 */
export async function fixtureExists(
  fixturePath: string,
  fileName: string
): Promise<boolean> {
  const fixturesRoot = path.join(__dirname, "../fixtures/flatten");
  const filePath = path.join(fixturesRoot, fixturePath, fileName);
  
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lists all files in a fixture directory
 * 
 * @param fixturePath - Relative path to fixture from test/fixtures/flatten
 * @returns Promise resolving to array of file names
 */
export async function listFixtureFiles(fixturePath: string): Promise<string[]> {
  const fixturesRoot = path.join(__dirname, "../fixtures/flatten");
  const dirPath = path.join(fixturesRoot, fixturePath);
  
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch (error) {
    throw new Error(
      `Failed to list fixture files at ${dirPath}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Loads all facet contracts from a fixture
 * 
 * @param fixturePath - Path to fixture directory
 * @returns Promise resolving to map of facet names to source code
 * 
 * @example
 * ```typescript
 * const facets = await loadFixtureFacets('simple');
 * // Returns: { 'FacetA': '...source...', 'FacetB': '...source...', ... }
 * ```
 */
export async function loadFixtureFacets(
  fixturePath: string
): Promise<Record<string, string>> {
  const facetsPath = path.join(fixturePath, "contracts/facets");
  const facetFiles = await listFixtureFiles(facetsPath);
  
  const facets: Record<string, string> = {};
  
  for (const file of facetFiles) {
    if (file.endsWith(".sol")) {
      const facetName = file.replace(".sol", "");
      const source = await loadFixtureContract(facetsPath, file);
      facets[facetName] = source;
    }
  }
  
  return facets;
}
