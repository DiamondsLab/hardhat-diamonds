import { SourceResolver, LoadedSource } from "./SourceResolver";
import path from "path";

/**
 * A node in the dependency graph representing a Solidity source file.
 */
export interface DependencyNode {
  /** Contract/file name */
  name: string;
  /** The loaded source file */
  source: LoadedSource;
  /** Set of absolute paths this node depends on */
  dependencies: Set<string>;
  /** Set of absolute paths that depend on this node */
  dependents: Set<string>;
  /** Whether this node has been visited during graph traversal */
  visited: boolean;
  /** Import information for this node */
  imports: string[];
}

/**
 * Statistics about the dependency graph.
 */
export interface GraphStats {
  /** Total number of contracts in the graph */
  totalContracts: number;
  /** Number of unique contracts (after deduplication) */
  uniqueContracts: number;
  /** Number of circular dependencies detected */
  circularDependencies: number;
  /** Maximum depth of dependency tree */
  maxDepth: number;
}

/**
 * Represents a circular dependency cycle in the graph.
 */
export interface CircularDependency {
  /** Array of file paths forming the cycle */
  cycle: string[];
  /** Human-readable description of the cycle */
  description: string;
}

/**
 * DependencyGraph builds and analyzes dependency relationships between Solidity source files.
 *
 * Features:
 * - Builds dependency tree by recursively resolving imports
 * - Detects circular dependencies using depth-first search
 * - Performs topological sorting using Kahn's algorithm
 * - Provides specialized sorting for Diamond contract flattening
 * - Tracks bidirectional relationships (dependencies and dependents)
 * - Calculates graph statistics (depth, cycle count, etc.)
 *
 * @example
 * ```typescript
 * const resolver = new SourceResolver(hre);
 * const graph = new DependencyGraph(resolver, true);
 *
 * await graph.addRoot('./contracts/facets/FacetA.sol');
 * await graph.addRoot('./contracts/facets/FacetB.sol');
 *
 * const sorted = graph.getSortedForFlattening();
 * console.log(`Flattening order: ${sorted.map(n => n.name).join(', ')}`);
 * ```
 */
export class DependencyGraph {
  private readonly resolver: SourceResolver;
  private readonly nodes: Map<string, DependencyNode>;
  private readonly circularDeps: CircularDependency[];
  private readonly verbose: boolean;

  /**
   * Creates a new DependencyGraph instance.
   *
   * @param resolver - SourceResolver instance for loading source files
   * @param verbose - Enable verbose logging of graph operations (default: false)
   */
  constructor(resolver: SourceResolver, verbose: boolean = false) {
    this.resolver = resolver;
    this.nodes = new Map<string, DependencyNode>();
    this.circularDeps = [];
    this.verbose = verbose;
  }

  /**
   * Adds a root source file to the dependency graph.
   *
   * This will recursively load and resolve all dependencies of the root file,
   * building a complete dependency tree.
   *
   * @param sourcePath - Path to the root source file
   * @returns Promise resolving when the root and all dependencies are loaded
   * @throws Error if the source file cannot be loaded
   *
   * @example
   * ```typescript
   * await graph.addRoot('./contracts/Diamond.sol');
   * ```
   */
  async addRoot(sourcePath: string): Promise<void> {
    if (this.verbose) {
      console.log(`[DependencyGraph] Adding root: ${sourcePath}`);
    }

    // Load the root source
    const source = await this.resolver.loadSource(sourcePath);

    // Create node if it doesn't exist
    if (!this.nodes.has(source.path)) {
      const node: DependencyNode = {
        name: source.name,
        source,
        dependencies: new Set<string>(),
        dependents: new Set<string>(),
        visited: false,
        imports: source.imports.map((imp) => imp.path),
      };
      this.nodes.set(source.path, node);
    }

    // Resolve dependencies recursively
    await this.resolveDependencies(source.path, new Set<string>());

    if (this.verbose) {
      console.log(
        `[DependencyGraph] Root added: ${source.name} ` +
          `(${this.nodes.size} total nodes)`
      );
    }
  }

  /**
   * Recursively resolves dependencies for a node.
   *
   * @param nodePath - Absolute path of the node to resolve
   * @param visitedInPath - Set of paths visited in current DFS path (for cycle detection)
   * @returns Promise resolving when all dependencies are resolved
   * @private
   */
  private async resolveDependencies(
    nodePath: string,
    visitedInPath: Set<string>
  ): Promise<void> {
    const node = this.nodes.get(nodePath);
    if (!node) {
      throw new Error(`Node not found: ${nodePath}`);
    }

    // Mark as visited for cycle detection
    node.visited = true;
    visitedInPath.add(nodePath);

    // Resolve each import
    for (const importInfo of node.source.imports) {
      try {
        // Resolve the import path
        const resolvedPath = await this.resolveImportForNode(
          importInfo.path,
          nodePath
        );

        if (this.verbose) {
          console.log(
            `[DependencyGraph] Resolved: ${importInfo.path} -> ${path.basename(resolvedPath)}`
          );
        }

        // Check for circular dependency
        if (visitedInPath.has(resolvedPath)) {
          // Circular dependency detected
          const cycle = this.buildCyclePath(visitedInPath, resolvedPath);
          this.circularDeps.push({
            cycle,
            description: this.formatCycleDescription(cycle),
          });

          if (this.verbose) {
            console.warn(
              `[DependencyGraph] ⚠️  Circular dependency detected: ${this.formatCycleDescription(cycle)}`
            );
          }

          // Add the dependency but don't recurse
          node.dependencies.add(resolvedPath);
          continue;
        }

        // Add dependency relationship
        node.dependencies.add(resolvedPath);

        // Load the dependency if not already loaded
        if (!this.nodes.has(resolvedPath)) {
          const depSource = await this.resolver.loadSource(resolvedPath);
          const depNode: DependencyNode = {
            name: depSource.name,
            source: depSource,
            dependencies: new Set<string>(),
            dependents: new Set<string>(),
            visited: false,
            imports: depSource.imports.map((imp) => imp.path),
          };
          this.nodes.set(resolvedPath, depNode);
        }

        // Add reverse dependency (dependent relationship)
        const depNode = this.nodes.get(resolvedPath)!;
        depNode.dependents.add(nodePath);

        // Recursively resolve dependencies if not visited
        if (!depNode.visited) {
          await this.resolveDependencies(resolvedPath, new Set(visitedInPath));
        }
      } catch (error) {
        // Log error but continue with other imports
        console.error(
          `[DependencyGraph] Failed to resolve import: ${importInfo.path}\n` +
            `  From: ${nodePath}\n` +
            `  Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    visitedInPath.delete(nodePath);
  }

  /**
   * Resolves an import path relative to a source node.
   *
   * @param importPath - The import path to resolve
   * @param sourceNodePath - Absolute path of the node containing the import
   * @returns Promise resolving to the absolute path of the imported file
   * @private
   */
  private async resolveImportForNode(
    importPath: string,
    sourceNodePath: string
  ): Promise<string> {
    // Determine if this is a node_modules import
    const isNodeModule =
      importPath.startsWith("@") ||
      (!importPath.startsWith(".") && !path.isAbsolute(importPath));

    if (isNodeModule) {
      // Use resolver's node_modules resolution
      return (this.resolver as any).resolveNodeModulesPath(importPath);
    }

    // Local import - resolve relative to source file directory
    const sourceDir = path.dirname(sourceNodePath);
    const resolvedPath = path.resolve(sourceDir, importPath);

    return resolvedPath;
  }

  /**
   * Builds the cycle path for a detected circular dependency.
   *
   * @param visitedInPath - Set of paths in current DFS traversal
   * @param cyclePath - Path that completes the cycle
   * @returns Array of paths forming the cycle
   * @private
   */
  private buildCyclePath(
    visitedInPath: Set<string>,
    cyclePath: string
  ): string[] {
    const pathArray = Array.from(visitedInPath);
    const cycleStartIndex = pathArray.indexOf(cyclePath);

    if (cycleStartIndex === -1) {
      return [cyclePath];
    }

    return [...pathArray.slice(cycleStartIndex), cyclePath];
  }

  /**
   * Formats a circular dependency cycle as a human-readable string.
   *
   * @param cycle - Array of file paths forming the cycle
   * @returns Formatted cycle description
   * @private
   */
  private formatCycleDescription(cycle: string[]): string {
    const names = cycle.map((p) => path.basename(p, ".sol"));
    return names.join(" → ");
  }

  /**
   * Detects all circular dependencies in the graph.
   *
   * This method is called automatically during graph construction, but can
   * be called manually after modifications.
   *
   * @returns Array of detected circular dependencies
   */
  detectCircularDependencies(): CircularDependency[] {
    return this.circularDeps;
  }

  /**
   * Performs topological sort using Kahn's algorithm.
   *
   * Returns nodes in an order where dependencies come before dependents.
   * If circular dependencies exist, they are included but the order may not
   * be strictly topological within the cycle.
   *
   * @returns Array of nodes in topologically sorted order
   *
   * @example
   * ```typescript
   * const sorted = graph.topologicalSort();
   * sorted.forEach(node => {
   *   console.log(`${node.name} depends on: ${node.dependencies.size} files`);
   * });
   * ```
   */
  topologicalSort(): DependencyNode[] {
    // Create in-degree map
    const inDegree = new Map<string, number>();
    for (const [path, node] of this.nodes) {
      inDegree.set(path, node.dependencies.size);
    }

    // Find all nodes with zero in-degree
    const queue: string[] = [];
    for (const [path, degree] of inDegree) {
      if (degree === 0) {
        queue.push(path);
      }
    }

    const result: DependencyNode[] = [];

    // Process queue
    while (queue.length > 0) {
      const currentPath = queue.shift()!;
      const currentNode = this.nodes.get(currentPath)!;
      result.push(currentNode);

      if (this.verbose) {
        console.log(`[DependencyGraph] Sorted: ${currentNode.name}`);
      }

      // Reduce in-degree of dependents
      for (const dependentPath of currentNode.dependents) {
        const degree = inDegree.get(dependentPath)!;
        inDegree.set(dependentPath, degree - 1);

        if (degree - 1 === 0) {
          queue.push(dependentPath);
        }
      }
    }

    // Check if all nodes were processed (no cycles if true)
    if (result.length < this.nodes.size) {
      // Some nodes remain - they're part of cycles
      // Add them to the result anyway
      for (const [_path, node] of this.nodes) {
        if (!result.includes(node)) {
          result.push(node);
          if (this.verbose) {
            console.log(`[DependencyGraph] Added cyclic node: ${node.name}`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Returns nodes sorted for Diamond contract flattening.
   *
   * Ensures Diamond contract appears last, with facets before it, and all
   * dependencies (libraries, interfaces, base contracts) before facets.
   *
   * Order: Dependencies → Facets → Diamond
   *
   * @returns Array of nodes in optimal flattening order
   *
   * @example
   * ```typescript
   * const sorted = graph.getSortedForFlattening();
   * const flattenedCode = sorted.map(n => n.source.content).join('\n\n');
   * ```
   */
  getSortedForFlattening(): DependencyNode[] {
    // Get base topological sort
    const sorted = this.topologicalSort();

    // Separate into three groups
    const dependencies: DependencyNode[] = [];
    const facets: DependencyNode[] = [];
    const diamonds: DependencyNode[] = [];

    for (const node of sorted) {
      const name = node.name.toLowerCase();

      if (name.includes("diamond") && !name.includes("facet")) {
        diamonds.push(node);
      } else if (name.includes("facet")) {
        facets.push(node);
      } else {
        dependencies.push(node);
      }
    }

    // Combine: dependencies first, then facets, then diamond
    const result = [...dependencies, ...facets, ...diamonds];

    if (this.verbose) {
      console.log(
        `[DependencyGraph] Flattening order: ${result.map((n) => n.name).join(" → ")}`
      );
    }

    return result;
  }

  /**
   * Calculates statistics about the dependency graph.
   *
   * @returns Graph statistics object
   *
   * @example
   * ```typescript
   * const stats = graph.getStats();
   * console.log(`Total contracts: ${stats.totalContracts}`);
   * console.log(`Circular dependencies: ${stats.circularDependencies}`);
   * ```
   */
  getStats(): GraphStats {
    const totalContracts = this.nodes.size;
    const uniqueContracts = totalContracts; // After loading, all are unique
    const circularDependencies = this.circularDeps.length;
    const maxDepth = this.calculateMaxDepth();

    return {
      totalContracts,
      uniqueContracts,
      circularDependencies,
      maxDepth,
    };
  }

  /**
   * Calculates the maximum depth of the dependency tree.
   *
   * @returns Maximum depth (number of levels)
   * @private
   */
  private calculateMaxDepth(): number {
    let maxDepth = 0;

    const calculateDepth = (
      nodePath: string,
      visited: Set<string>,
      currentDepth: number
    ): number => {
      if (visited.has(nodePath)) {
        return currentDepth;
      }

      visited.add(nodePath);
      const node = this.nodes.get(nodePath);

      if (!node || node.dependencies.size === 0) {
        return currentDepth;
      }

      let max = currentDepth;
      for (const depPath of node.dependencies) {
        const depth = calculateDepth(
          depPath,
          new Set(visited),
          currentDepth + 1
        );
        max = Math.max(max, depth);
      }

      return max;
    };

    // Calculate depth from each root node
    for (const [path, node] of this.nodes) {
      if (node.dependents.size === 0) {
        // This is a root node
        const depth = calculateDepth(path, new Set<string>(), 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth;
  }

  /**
   * Gets all nodes in the graph.
   *
   * @returns Map of absolute paths to dependency nodes
   */
  getNodes(): Map<string, DependencyNode> {
    return new Map(this.nodes);
  }

  /**
   * Gets a specific node by path.
   *
   * @param path - Absolute path of the node
   * @returns The dependency node, or undefined if not found
   */
  getNode(path: string): DependencyNode | undefined {
    return this.nodes.get(path);
  }

  /**
   * Clears the graph, removing all nodes and dependencies.
   *
   * Useful for testing or rebuilding the graph.
   */
  clear(): void {
    this.nodes.clear();
    this.circularDeps.length = 0;
    if (this.verbose) {
      console.log("[DependencyGraph] Graph cleared");
    }
  }
}
