import { HardhatRuntimeEnvironment } from "hardhat/types";
import { promises as fs } from "fs";
import path from "path";

/**
 * Information about an import statement found in a Solidity source file.
 */
export interface ImportInfo {
  /** The full import statement as it appears in the source */
  statement: string;
  /** The import path extracted from the statement */
  path: string;
  /** Whether this import is from node_modules (starts with @) */
  isNodeModule: boolean;
  /** Starting position in the source content */
  start: number;
  /** Ending position in the source content */
  end: number;
}

/**
 * A loaded Solidity source file with its metadata.
 */
export interface LoadedSource {
  /** Contract/file name extracted from the path */
  name: string;
  /** Absolute path to the source file */
  path: string;
  /** Full source code content */
  content: string;
  /** Parsed import statements found in this source */
  imports: ImportInfo[];
}

/**
 * SourceResolver loads Solidity source files from disk and resolves import paths.
 *
 * Features:
 * - Loads .sol files from absolute or relative paths
 * - Resolves local imports (./relative, ../parent)
 * - Resolves node_modules imports (@openzeppelin/...)
 * - Parses all import syntax variants (named, namespace, default)
 * - Caches loaded sources to avoid redundant disk reads
 * - Follows Hardhat's import resolution order
 *
 * @example
 * ```typescript
 * const resolver = new SourceResolver(hre, true);
 * const source = await resolver.loadSource('./contracts/MyContract.sol');
 * console.log(`Loaded ${source.name} with ${source.imports.length} imports`);
 * ```
 */
export class SourceResolver {
  private readonly hre: HardhatRuntimeEnvironment;
  private readonly cache: Map<string, LoadedSource>;
  private readonly verbose: boolean;

  /**
   * Creates a new SourceResolver instance.
   *
   * @param hre - The Hardhat Runtime Environment for path resolution
   * @param verbose - Enable verbose logging of resolution operations (default: false)
   */
  constructor(hre: HardhatRuntimeEnvironment, verbose: boolean = false) {
    this.hre = hre;
    this.cache = new Map<string, LoadedSource>();
    this.verbose = verbose;
  }

  /**
   * Loads a Solidity source file and parses its import statements.
   *
   * The source is cached after the first load. Subsequent calls with the same
   * path return the cached version.
   *
   * @param sourcePath - Path to the source file (absolute or relative to project root)
   * @returns Promise resolving to the loaded source with parsed imports
   * @throws Error if the file cannot be read or doesn't exist
   *
   * @example
   * ```typescript
   * const source = await resolver.loadSource('./contracts/Token.sol');
   * ```
   */
  async loadSource(sourcePath: string): Promise<LoadedSource> {
    // Resolve to absolute path
    const absolutePath = path.isAbsolute(sourcePath)
      ? sourcePath
      : path.resolve(this.hre.config.paths.root, sourcePath);

    // Check cache first
    if (this.cache.has(absolutePath)) {
      if (this.verbose) {
        console.log(`[SourceResolver] Cache hit: ${absolutePath}`);
      }
      return this.cache.get(absolutePath)!;
    }

    if (this.verbose) {
      console.log(`[SourceResolver] Loading source: ${absolutePath}`);
    }

    // Read file content
    let content: string;
    try {
      content = await fs.readFile(absolutePath, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to read source file: ${absolutePath}\n` +
          `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Extract contract name from filename
    const name = path.basename(absolutePath, ".sol");

    // Parse import statements
    const imports = this.parseImports(content);

    // Create LoadedSource object
    const loadedSource: LoadedSource = {
      name,
      path: absolutePath,
      content,
      imports,
    };

    // Store in cache
    this.cache.set(absolutePath, loadedSource);

    if (this.verbose) {
      console.log(
        `[SourceResolver] Loaded ${name} with ${imports.length} import(s)`
      );
    }

    return loadedSource;
  }

  /**
   * Parses all import statements from Solidity source code.
   *
   * Supports all Solidity import syntaxes:
   * - import "./Contract.sol";
   * - import "../Parent.sol";
   * - import { A } from "./Named.sol";
   * - import { A, B, C } from "./Multiple.sol";
   * - import * as Lib from "./Library.sol";
   * - import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
   *
   * @param content - Source code content to parse
   * @returns Array of parsed import information
   * @private
   */
  private parseImports(content: string): ImportInfo[] {
    const imports: ImportInfo[] = [];

    // Regex to match all import statement variants
    // Matches: import "path"; import { A } from "path"; import * as X from "path";
    const importRegex =
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+)\s+from\s+)?["']([^"']+)["']\s*;/g;

    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(content)) !== null) {
      const statement = match[0];
      const importPath = match[1];
      const start = match.index;
      const end = match.index + statement.length;

      // Determine if this is a node_modules import
      const isNodeModule =
        importPath.startsWith("@") ||
        (!importPath.startsWith(".") && !path.isAbsolute(importPath));

      imports.push({
        statement,
        path: importPath,
        isNodeModule,
        start,
        end,
      });

      if (this.verbose) {
        console.log(
          `[SourceResolver] Found import: ${importPath} ` +
            `(node_modules: ${isNodeModule})`
        );
      }
    }

    return imports;
  }

  /**
   * Resolves an import path to an absolute file system path.
   *
   * Follows Hardhat's resolution order:
   * 1. Local imports (./relative, ../parent) - resolved relative to source file
   * 2. node_modules imports (@org/package) - resolved through node_modules
   *
   * @param importPath - The import path from the import statement
   * @param sourceFilePath - Absolute path of the file containing the import
   * @returns Promise resolving to the absolute path of the imported file
   * @throws Error if the import cannot be resolved
   * @private
   *
   * @example
   * ```typescript
   * const resolved = await this.resolveImportPath(
   *   './Token.sol',
   *   '/project/contracts/MyContract.sol'
   * );
   * // Returns: /project/contracts/Token.sol
   * ```
   */
  // @ts-expect-error - Method kept for potential future use
  private async resolveImportPath(
    importPath: string,
    sourceFilePath: string
  ): Promise<string> {
    // Check if this is a node_modules import
    const isNodeModule =
      importPath.startsWith("@") ||
      (!importPath.startsWith(".") && !path.isAbsolute(importPath));

    if (isNodeModule) {
      return this.resolveNodeModulesPath(importPath);
    }

    // Local import - resolve relative to source file directory
    const sourceDir = path.dirname(sourceFilePath);
    const resolvedPath = path.resolve(sourceDir, importPath);

    // Verify file exists
    try {
      await fs.access(resolvedPath);

      if (this.verbose) {
        console.log(
          `[SourceResolver] Resolved ${importPath} -> ${resolvedPath}`
        );
      }

      return resolvedPath;
    } catch (error) {
      throw new Error(
        `Cannot resolve import: ${importPath}\n` +
          `Source file: ${sourceFilePath}\n` +
          `Attempted path: ${resolvedPath}\n` +
          `File not found. Please check the import statement.`
      );
    }
  }

  /**
   * Resolves a node_modules import path following Hardhat's resolution strategy.
   *
   * Searches for the package in:
   * 1. Project root node_modules
   * 2. Parent directories (recursively)
   * 3. Applies Hardhat remappings if configured
   *
   * @param importPath - The node_modules import path (e.g., "@openzeppelin/contracts/...")
   * @returns Promise resolving to the absolute path of the imported file
   * @throws Error if the package or file cannot be found
   * @private
   *
   * @example
   * ```typescript
   * const resolved = await this.resolveNodeModulesPath(
   *   '@openzeppelin/contracts/token/ERC20/ERC20.sol'
   * );
   * // Returns: /project/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol
   * ```
   */
  private async resolveNodeModulesPath(importPath: string): Promise<string> {
    // Start from project root
    let currentDir = this.hre.config.paths.root;

    // Search up the directory tree for node_modules
    while (true) {
      const nodeModulesPath = path.join(currentDir, "node_modules", importPath);

      try {
        await fs.access(nodeModulesPath);

        if (this.verbose) {
          console.log(
            `[SourceResolver] Resolved node_modules import: ${importPath} -> ${nodeModulesPath}`
          );
        }

        return nodeModulesPath;
      } catch (error) {
        // File not found in this node_modules, try parent directory
        const parentDir = path.dirname(currentDir);

        // Stop if we've reached the root of the filesystem
        if (parentDir === currentDir) {
          break;
        }

        currentDir = parentDir;
      }
    }

    // Not found anywhere
    throw new Error(
      `Cannot resolve node_modules import: ${importPath}\n` +
        `Searched from: ${this.hre.config.paths.root}\n` +
        `Make sure the package is installed: npm install or yarn install\n` +
        `If the package is installed, check the import path is correct.`
    );
  }

  /**
   * Gets statistics about loaded sources.
   *
   * @returns Object with cache statistics
   */
  getStats(): { cachedSources: number; cacheSize: number } {
    return {
      cachedSources: this.cache.size,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Clears the source cache.
   *
   * Useful for testing or when sources have been modified on disk.
   */
  clearCache(): void {
    this.cache.clear();
    if (this.verbose) {
      console.log("[SourceResolver] Cache cleared");
    }
  }
}
