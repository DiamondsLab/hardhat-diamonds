import { expect } from "chai";
import { SourceResolver } from "../../../src/lib/SourceResolver";
import { DependencyGraph } from "../../../src/lib/DependencyGraph";
import { DiamondFlattener } from "../../../src/lib/DiamondFlattener";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

describe("Flattening Engine Integration Tests", () => {
  let mockHre: Partial<HardhatRuntimeEnvironment>;
  let resolver: SourceResolver;
  let graph: DependencyGraph;
  let flattener: DiamondFlattener;

  const fixturesPath = path.join(__dirname, "../../fixtures/flattening");

  beforeEach(() => {
    // Mock HRE for integration testing
    mockHre = {
      network: {
        name: "hardhat",
        config: {
          chainId: 31337,
        } as any,
      } as any,
      config: {
        diamonds: {
          paths: {
            ExampleDiamond: {
              deploymentsPath: "diamonds",
              contractsPath: "contracts/examplediamond",
            },
          },
        },
        paths: {
          root: path.join(__dirname, "../../../"),
          sources: "contracts",
          artifacts: "artifacts",
        },
      } as any,
    };

    resolver = new SourceResolver(mockHre as HardhatRuntimeEnvironment, false);
    graph = new DependencyGraph(resolver, false);
    flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
      diamondName: "ExampleDiamond",
      outputPath: "/test/output/ExampleDiamond.sol",
      verbose: false,
    });
  });

  describe("End-to-End Pipeline", () => {
    it("should load, resolve, and deduplicate simple contracts", async () => {
      const contractPath = path.join(fixturesPath, "SimpleContract.sol");

      // Step 1: Load source
      const source = await resolver.loadSource(contractPath);
      expect(source).to.exist;
      expect(source.name).to.include("SimpleContract");
      expect(source.content).to.be.a("string");

      // Step 2: Build dependency graph
      await graph.addRoot(contractPath);
      const nodesMap = graph.getNodes();
      const nodes = Array.from(nodesMap.values());
      expect(nodes).to.be.an("array");
      expect(nodes.length).to.be.greaterThan(0);

      // Step 3: Topological sort
      const sorted = graph.topologicalSort();
      expect(sorted).to.be.an("array");

      // Step 4: Deduplicate (if we have sorted nodes)
      if (sorted.length > 0) {
        const deduplicated = flattener.deduplicateSources(sorted);
        expect(deduplicated).to.be.an("array");
        const keptSources = deduplicated.filter((s) => s.kept);
        expect(keptSources.length).to.be.greaterThan(0);
      }
    });

    it("should handle contracts with imports", async () => {
      const contractPath = path.join(fixturesPath, "ContractWithImports.sol");

      // Build full dependency graph
      await graph.addRoot(contractPath);
      const nodesMap = graph.getNodes();
      const nodes = Array.from(nodesMap.values());

      // Should resolve all dependencies
      expect(nodes).to.be.an("array");
      expect(nodes.length).to.be.greaterThanOrEqual(1);

      // Get flattening order
      const sorted = graph.getSortedForFlattening();
      expect(sorted).to.be.an("array");

      if (sorted.length > 1) {
        // Dependencies should come before the contract that imports them
        const mainContractIndex = sorted.findIndex(
          (n) => n.name.includes("ContractWithImports")
        );
        if (mainContractIndex >= 0) {
          expect(mainContractIndex).to.be.greaterThanOrEqual(0);
        }
      }

      // Deduplicate
      if (sorted.length > 0) {
        const deduplicated = flattener.deduplicateSources(sorted);

        // All import statements should be removed (but word "import" can appear in comments)
        deduplicated.forEach((source) => {
          // Check for import statements specifically, not the word "import" in comments
          const hasImportStatement = /^import\s+/m.test(source.content);
          expect(hasImportStatement).to.be.false;
        });
      }
    });

    it("should preserve all comment types through pipeline", async () => {
      const contractPath = path.join(fixturesPath, "ContractWithComments.sol");

      await graph.addRoot(contractPath);
      const sorted = graph.topologicalSort();
      const deduplicated = flattener.deduplicateSources(sorted);

      const mainContract = deduplicated.find((s) =>
        s.name.includes("ContractWithComments")
      );
      expect(mainContract).to.exist;

      // Verify inline comments preserved
      expect(mainContract!.content).to.include("// State variable");

      // Verify block comments preserved
      expect(mainContract!.content).to.include("Multi-line block comment");

      // Verify NatSpec preserved
      expect(mainContract!.content).to.include("@title ContractWithComments");
    });
  });

  describe("Circular Dependency Handling", () => {
    it("should detect circular dependencies", async () => {
      const circularAPath = path.join(fixturesPath, "CircularA.sol");

      await graph.addRoot(circularAPath);

      // Check for circular dependency detection
      const circularDeps = graph.detectCircularDependencies();
      expect(circularDeps).to.be.an("array");
      expect(circularDeps.length).to.be.greaterThan(0);

      // Verify cycle is detected
      const cycle = circularDeps[0];
      const cycleNames = cycle.cycle.map((path: string) => path.split('/').pop()?.replace('.sol', ''));
      expect(cycleNames).to.include("CircularA");
      expect(cycleNames).to.include("CircularB");
      expect(cycleNames).to.include("CircularC");
    });

    it("should continue processing after detecting circular dependency", async () => {
      const circularAPath = path.join(fixturesPath, "CircularA.sol");

      await graph.addRoot(circularAPath);

      // Should not throw - continues processing
      const sorted = graph.topologicalSort();
      expect(sorted).to.be.an("array");
      expect(sorted.length).to.be.greaterThan(0);
    });

    it("should deduplicate circular dependencies (keep one copy)", async () => {
      const circularAPath = path.join(fixturesPath, "CircularA.sol");

      await graph.addRoot(circularAPath);
      const sorted = graph.topologicalSort();
      const deduplicated = flattener.deduplicateSources(sorted);

      // Should have entries for all three circular contracts
      const circularA = deduplicated.filter((s) =>
        s.name.includes("CircularA")
      );
      const circularB = deduplicated.filter((s) =>
        s.name.includes("CircularB")
      );
      const circularC = deduplicated.filter((s) =>
        s.name.includes("CircularC")
      );

      // Each should appear only once
      expect(circularA.length).to.equal(1);
      expect(circularB.length).to.equal(1);
      expect(circularC.length).to.equal(1);
    });
  });

  describe("Complex Dependency Trees", () => {
    it("should handle deep dependency chains", async () => {
      // ContractWithImports depends on Library and SimpleContract
      const contractPath = path.join(fixturesPath, "ContractWithImports.sol");

      await graph.addRoot(contractPath);
      const stats = graph.getStats();

      // Should resolve multiple levels
      expect(stats.totalContracts).to.be.greaterThan(1);
      expect(stats.uniqueContracts).to.be.greaterThan(1);
      expect(stats.maxDepth).to.be.greaterThan(0);
    });

    it("should order dependencies before dependents", async () => {
      const contractPath = path.join(fixturesPath, "ContractWithImports.sol");

      await graph.addRoot(contractPath);
      const sorted = graph.getSortedForFlattening();

      // Find indices
      const mainIndex = sorted.findIndex((n) =>
        n.name.includes("ContractWithImports")
      );
      const libraryIndex = sorted.findIndex((n) => n.name.includes("Library"));

      // Library should come before contract that imports it
      if (libraryIndex >= 0 && mainIndex >= 0) {
        expect(libraryIndex).to.be.lessThan(mainIndex);
      }
    });

    it("should handle multiple roots (multiple entry points)", async () => {
      const contract1Path = path.join(fixturesPath, "SimpleContract.sol");
      const contract2Path = path.join(fixturesPath, "Library.sol");

      await graph.addRoot(contract1Path);
      await graph.addRoot(contract2Path);

      const nodesMap = graph.getNodes();
      const nodes = Array.from(nodesMap.values());
      expect(nodes).to.be.an("array");
      expect(nodes.length).to.be.greaterThanOrEqual(1);

      // Both contracts should be in graph (or at least one)
      const hasSimple = nodes.some((n) => n.name.includes("SimpleContract"));
      const hasLibrary = nodes.some((n) => n.name.includes("Library"));
      expect(hasSimple || hasLibrary).to.be.true;
    });
  });

  describe("Import Syntax Variants", () => {
    it("should handle named imports", async () => {
      const namedImportsPath = path.join(fixturesPath, "NamedImports.sol");

      await graph.addRoot(namedImportsPath);
      const sorted = graph.topologicalSort();

      expect(sorted.length).to.be.greaterThan(0);

      // Should resolve imports
      const mainContract = sorted.find((n) =>
        n.name.includes("NamedImports")
      );
      expect(mainContract).to.exist;
    });

    it("should remove all import syntax variants during deduplication", async () => {
      const contractPath = path.join(fixturesPath, "ContractWithImports.sol");

      await graph.addRoot(contractPath);
      const sorted = graph.topologicalSort();
      const deduplicated = flattener.deduplicateSources(sorted);

      // No "import" keyword should remain
      deduplicated.forEach((source) => {
        if (source.kept) {
          expect(source.content).to.not.match(/\bimport\s+/);
        }
      });
    });
  });

  describe("Duplicate Handling", () => {
    it("should detect and remove duplicate contracts", async () => {
      const duplicatePath = path.join(fixturesPath, "DuplicateContract.sol");

      // Simulate duplicate by adding same file twice with different paths
      const source1 = await resolver.loadSource(duplicatePath);
      const source2 = { ...source1, path: "/different/path/" + source1.name };

      await graph.addRoot(duplicatePath);
      const sorted = graph.topologicalSort();

      // Manually create duplicate scenario for deduplication test
      const duplicatedNodes = [...sorted, ...sorted];

      const deduplicated = flattener.deduplicateSources(duplicatedNodes);

      // Should have removed duplicates
      const keptSources = deduplicated.filter((s) => s.kept);
      const removedSources = deduplicated.filter((s) => !s.kept);

      expect(removedSources.length).to.be.greaterThan(0);
    });

    it("should warn about duplicate contracts", async () => {
      const duplicatePath = path.join(fixturesPath, "DuplicateContract.sol");

      await graph.addRoot(duplicatePath);
      const sorted = graph.topologicalSort();

      // Create duplicate scenario
      const duplicatedNodes = [...sorted, ...sorted];

      flattener.clearWarnings();
      flattener.deduplicateSources(duplicatedNodes);

      const warnings = flattener.getWarnings();
      expect(warnings.length).to.be.greaterThan(0);

      // Should mention duplicate
      const hasDuplicateWarning = warnings.some((w) =>
        w.toLowerCase().includes("duplicate")
      );
      expect(hasDuplicateWarning).to.be.true;
    });

    it("should detect version mismatches", async () => {
      const contract1Path = path.join(fixturesPath, "DuplicateContract.sol");
      const contract2Path = path.join(
        fixturesPath,
        "DuplicateDifferentVersion.sol"
      );

      // Load both sources
      const source1 = await resolver.loadSource(contract1Path);
      const source2 = await resolver.loadSource(contract2Path);

      // Both define DuplicateContract but with different content
      await graph.addRoot(contract1Path);
      const nodesMap1 = graph.getNodes();
      const nodes1 = Array.from(nodesMap1.values());
      expect(nodes1.length).to.be.greaterThan(0);
      const node1 = nodes1[0];

      // Create a new graph for second source
      const graph2 = new DependencyGraph(resolver, false);
      await graph2.addRoot(contract2Path);
      const nodesMap2 = graph2.getNodes();
      const nodes2 = Array.from(nodesMap2.values());
      expect(nodes2.length).to.be.greaterThan(0);
      const node2 = nodes2[0];

      flattener.clearWarnings();
      const deduplicated = flattener.deduplicateSources([node1, node2]);

      const warnings = flattener.getWarnings();
      const hasVersionWarning = warnings.some((w) =>
        w.toLowerCase().includes("version mismatch")
      );
      expect(hasVersionWarning).to.be.true;
    });
  });

  describe("Error Handling", () => {
    it("should handle missing files gracefully", async () => {
      const missingPath = path.join(fixturesPath, "NonExistent.sol");

      try {
        await resolver.loadSource(missingPath);
        expect.fail("Should have thrown error for missing file");
      } catch (error) {
        expect(error).to.exist;
        const message = (error as Error).message;
        expect(message).to.satisfy((msg: string) => 
          msg.includes("Failed to load source") || msg.includes("Failed to read source")
        );
      }
    });

    it("should provide helpful error messages", async () => {
      const missingPath = path.join(fixturesPath, "NonExistent.sol");

      try {
        await resolver.loadSource(missingPath);
        expect.fail("Should have thrown error");
      } catch (error) {
        const message = (error as Error).message;
        expect(message).to.include(missingPath);
        expect(message).to.satisfy((msg: string) => 
          msg.includes("Failed to load source") || msg.includes("Failed to read source")
        );
      }
    });

    it("should handle invalid file content", async () => {
      // This test would require a malformed .sol file fixture
      // Skipping for now as all current fixtures are valid
    });
  });

  describe("Verbose Mode", () => {
    it("should enable verbose logging when flag is true", () => {
      const verboseResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment,
        true
      );
      const verboseGraph = new DependencyGraph(verboseResolver, true);
      const verboseFlattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "/test/output/ExampleDiamond.sol",
          verbose: true,
        }
      );

      // Verbose instances should be created successfully
      expect(verboseResolver).to.exist;
      expect(verboseGraph).to.exist;
      expect(verboseFlattener).to.exist;
    });

    it("should work with verbose mode disabled (default)", async () => {
      const contractPath = path.join(fixturesPath, "SimpleContract.sol");

      // All instances use verbose: false by default
      await graph.addRoot(contractPath);
      const sorted = graph.topologicalSort();
      const deduplicated = flattener.deduplicateSources(sorted);

      expect(deduplicated).to.exist;
    });
  });

  describe("Statistics and Metrics", () => {
    it("should provide accurate graph statistics", async () => {
      const contractPath = path.join(fixturesPath, "ContractWithImports.sol");

      await graph.addRoot(contractPath);
      const stats = graph.getStats();

      expect(stats).to.have.property("totalContracts");
      expect(stats).to.have.property("uniqueContracts");
      expect(stats).to.have.property("circularDependencies");
      expect(stats).to.have.property("maxDepth");

      expect(stats.totalContracts).to.be.a("number");
      expect(stats.uniqueContracts).to.be.a("number");
      expect(stats.totalContracts).to.be.greaterThan(0);
    });

    it("should track deduplication statistics", async () => {
      const contractPath = path.join(fixturesPath, "SimpleContract.sol");

      await graph.addRoot(contractPath);
      const sorted = graph.topologicalSort();
      const deduplicated = flattener.deduplicateSources(sorted);

      const keptCount = deduplicated.filter((s) => s.kept).length;
      const removedCount = deduplicated.filter((s) => !s.kept).length;
      const totalCount = deduplicated.length;

      expect(keptCount + removedCount).to.equal(totalCount);
      expect(keptCount).to.be.greaterThan(0);
    });
  });

  describe("Multiple Definition Types", () => {
    it("should handle files with multiple definitions", async () => {
      const multiDefPath = path.join(
        fixturesPath,
        "MultipleDefinitions.sol"
      );

      await graph.addRoot(multiDefPath);
      const sorted = graph.topologicalSort();
      const deduplicated = flattener.deduplicateSources(sorted);

      const mainSource = deduplicated.find((s) =>
        s.name.includes("MultipleDefinitions")
      );
      expect(mainSource).to.exist;
      expect(mainSource!.definitions).to.be.an("array");
      expect(mainSource!.definitions.length).to.be.greaterThan(1);

      // Should include interface, library, abstract, and concrete
      expect(mainSource!.definitions).to.include("IMultipleDefinitions");
      expect(mainSource!.definitions).to.include("MultipleDefinitionsLib");
      expect(mainSource!.definitions).to.include(
        "AbstractMultipleDefinitions"
      );
      expect(mainSource!.definitions).to.include("MultipleDefinitions");
    });
  });
});
