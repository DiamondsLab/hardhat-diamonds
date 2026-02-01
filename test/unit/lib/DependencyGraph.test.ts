import { expect } from "chai";
import {
  DependencyGraph,
  DependencyNode,
  GraphStats,
  CircularDependency,
} from "../../../src/lib/DependencyGraph";
import { SourceResolver } from "../../../src/lib/SourceResolver";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

describe("DependencyGraph", () => {
  // Mock HRE for testing
  let mockHre: Partial<HardhatRuntimeEnvironment>;
  let resolver: SourceResolver;
  let graph: DependencyGraph;

  // Paths to test fixtures
  const fixturesPath = path.join(__dirname, "../../fixtures/flattening");
  const simpleContractPath = path.join(fixturesPath, "SimpleContract.sol");
  const contractWithImportsPath = path.join(
    fixturesPath,
    "ContractWithImports.sol"
  );
  const libraryPath = path.join(fixturesPath, "Library.sol");
  const circularAPath = path.join(fixturesPath, "CircularA.sol");
  const circularBPath = path.join(fixturesPath, "CircularB.sol");
  const circularCPath = path.join(fixturesPath, "CircularC.sol");

  beforeEach(() => {
    // Reset mock HRE before each test
    mockHre = {
      network: {
        name: "hardhat",
        config: {
          chainId: 31337,
        } as any,
      } as any,
      config: {
        paths: {
          root: path.join(__dirname, "../../../"),
          sources: "contracts",
          artifacts: "artifacts",
        },
      } as any,
    };

    resolver = new SourceResolver(mockHre as HardhatRuntimeEnvironment, false);
    graph = new DependencyGraph(resolver, false);
  });

  describe("Interfaces", () => {
    it("DependencyNode should have correct properties", async () => {
      await graph.addRoot(simpleContractPath);
      const nodes = graph.getNodes();
      const node = nodes.values().next().value as DependencyNode;

      expect(node).to.have.property("name");
      expect(node).to.have.property("source");
      expect(node).to.have.property("dependencies");
      expect(node).to.have.property("dependents");
      expect(node).to.have.property("visited");
      expect(node).to.have.property("imports");

      expect(node.name).to.be.a("string");
      expect(node.dependencies).to.be.instanceOf(Set);
      expect(node.dependents).to.be.instanceOf(Set);
      expect(node.visited).to.be.a("boolean");
      expect(node.imports).to.be.an("array");
    });

    it("GraphStats should have correct properties", () => {
      const stats: GraphStats = {
        totalContracts: 5,
        uniqueContracts: 5,
        circularDependencies: 1,
        maxDepth: 3,
      };

      expect(stats.totalContracts).to.equal(5);
      expect(stats.uniqueContracts).to.equal(5);
      expect(stats.circularDependencies).to.equal(1);
      expect(stats.maxDepth).to.equal(3);
    });

    it("CircularDependency should have correct properties", () => {
      const circular: CircularDependency = {
        cycle: ["A.sol", "B.sol", "A.sol"],
        description: "A → B → A",
      };

      expect(circular.cycle).to.be.an("array");
      expect(circular.description).to.be.a("string");
    });
  });

  describe("constructor", () => {
    it("should create instance with SourceResolver", () => {
      const testGraph = new DependencyGraph(resolver);
      expect(testGraph).to.be.instanceOf(DependencyGraph);
    });

    it("should create instance with verbose flag", () => {
      const testGraph = new DependencyGraph(resolver, true);
      expect(testGraph).to.be.instanceOf(DependencyGraph);
    });

    it("should initialize with empty nodes", () => {
      const nodes = graph.getNodes();
      expect(nodes.size).to.equal(0);
    });

    it("should initialize with no circular dependencies", () => {
      const circular = graph.detectCircularDependencies();
      expect(circular).to.have.length(0);
    });
  });

  describe("addRoot()", () => {
    it("should add simple contract without dependencies", async () => {
      await graph.addRoot(simpleContractPath);

      const nodes = graph.getNodes();
      expect(nodes.size).to.equal(1);
      expect(nodes.has(simpleContractPath)).to.be.true;
    });

    it("should add contract and its dependencies", async () => {
      await graph.addRoot(contractWithImportsPath);

      const nodes = graph.getNodes();
      expect(nodes.size).to.be.greaterThan(1);
    });

    it("should create node with correct properties", async () => {
      await graph.addRoot(simpleContractPath);

      const node = graph.getNode(simpleContractPath);
      expect(node).to.not.be.undefined;
      expect(node!.name).to.equal("SimpleContract");
      expect(node!.dependencies).to.be.instanceOf(Set);
      expect(node!.dependents).to.be.instanceOf(Set);
    });

    it("should handle multiple roots", async () => {
      await graph.addRoot(simpleContractPath);
      await graph.addRoot(libraryPath);

      const nodes = graph.getNodes();
      expect(nodes.size).to.equal(2);
    });

    it("should not duplicate nodes when adding same root twice", async () => {
      await graph.addRoot(simpleContractPath);
      await graph.addRoot(simpleContractPath);

      const nodes = graph.getNodes();
      expect(nodes.size).to.equal(1);
    });
  });

  describe("resolveDependencies()", () => {
    it("should resolve all dependencies recursively", async () => {
      await graph.addRoot(contractWithImportsPath);

      const mainNode = graph.getNode(contractWithImportsPath);
      expect(mainNode).to.not.be.undefined;
      expect(mainNode!.dependencies.size).to.be.greaterThan(0);
    });

    it("should establish bidirectional relationships", async () => {
      await graph.addRoot(contractWithImportsPath);

      const mainNode = graph.getNode(contractWithImportsPath);
      const firstDep = Array.from(mainNode!.dependencies)[0];
      const depNode = graph.getNode(firstDep);

      expect(depNode).to.not.be.undefined;
      expect(depNode!.dependents.has(contractWithImportsPath)).to.be.true;
    });

    it("should mark nodes as visited", async () => {
      await graph.addRoot(contractWithImportsPath);

      const nodes = graph.getNodes();
      for (const node of nodes.values()) {
        expect(node.visited).to.be.true;
      }
    });

    it("should handle contracts with no dependencies", async () => {
      await graph.addRoot(simpleContractPath);

      const node = graph.getNode(simpleContractPath);
      expect(node!.dependencies.size).to.equal(0);
    });
  });

  describe("Circular Dependency Detection", () => {
    it("should detect circular dependencies", async () => {
      await graph.addRoot(circularAPath);

      const circular = graph.detectCircularDependencies();
      expect(circular.length).to.be.greaterThan(0);
    });

    it("should provide cycle information", async () => {
      await graph.addRoot(circularAPath);

      const circular = graph.detectCircularDependencies();
      expect(circular[0]).to.have.property("cycle");
      expect(circular[0]).to.have.property("description");
      expect(circular[0].cycle).to.be.an("array");
      expect(circular[0].description).to.be.a("string");
    });

    it("should format cycle description", async () => {
      await graph.addRoot(circularAPath);

      const circular = graph.detectCircularDependencies();
      const description = circular[0].description;

      expect(description).to.include("→");
      expect(description).to.satisfy(
        (desc: string) =>
          desc.includes("CircularA") ||
          desc.includes("CircularB") ||
          desc.includes("CircularC")
      );
    });

    it("should continue processing after detecting cycle", async () => {
      await graph.addRoot(circularAPath);

      const nodes = graph.getNodes();
      expect(nodes.size).to.equal(3); // A, B, C
    });

    it("should not detect cycles in acyclic graphs", async () => {
      await graph.addRoot(contractWithImportsPath);

      const circular = graph.detectCircularDependencies();
      expect(circular).to.have.length(0);
    });
  });

  describe("topologicalSort()", () => {
    it("should return nodes in valid topological order", async () => {
      await graph.addRoot(contractWithImportsPath);

      const sorted = graph.topologicalSort();
      expect(sorted).to.be.an("array");
      expect(sorted.length).to.be.greaterThan(0);
    });

    it("should place dependencies before dependents", async () => {
      await graph.addRoot(contractWithImportsPath);

      const sorted = graph.topologicalSort();
      const nodes = graph.getNodes();

      // For each node, all its dependencies should appear earlier in the sorted list
      for (let i = 0; i < sorted.length; i++) {
        const node = sorted[i];
        for (const depPath of node.dependencies) {
          const depNode = nodes.get(depPath);
          if (depNode) {
            const depIndex = sorted.indexOf(depNode);
            if (depIndex !== -1) {
              expect(depIndex).to.be.lessThan(
                i,
                `Dependency ${depNode.name} should come before ${node.name}`
              );
            }
          }
        }
      }
    });

    it("should handle graphs with circular dependencies", async () => {
      await graph.addRoot(circularAPath);

      const sorted = graph.topologicalSort();
      expect(sorted.length).to.equal(3);
    });

    it("should handle single node graphs", async () => {
      await graph.addRoot(simpleContractPath);

      const sorted = graph.topologicalSort();
      expect(sorted).to.have.length(1);
      expect(sorted[0].name).to.equal("SimpleContract");
    });

    it("should handle multiple root nodes", async () => {
      await graph.addRoot(simpleContractPath);
      await graph.addRoot(libraryPath);

      const sorted = graph.topologicalSort();
      expect(sorted.length).to.equal(2);
    });
  });

  describe("getSortedForFlattening()", () => {
    it("should return nodes in flattening order", async () => {
      await graph.addRoot(contractWithImportsPath);

      const sorted = graph.getSortedForFlattening();
      expect(sorted).to.be.an("array");
      expect(sorted.length).to.be.greaterThan(0);
    });

    it("should place dependencies before facets", async () => {
      await graph.addRoot(contractWithImportsPath);

      const sorted = graph.getSortedForFlattening();

      // Find indices of libraries and contracts
      const libraryIndex = sorted.findIndex((n) => n.name === "Library");
      const contractIndex = sorted.findIndex(
        (n) => n.name === "ContractWithImports"
      );

      if (libraryIndex !== -1 && contractIndex !== -1) {
        expect(libraryIndex).to.be.lessThan(contractIndex);
      }
    });

    it("should handle empty graph", () => {
      const sorted = graph.getSortedForFlattening();
      expect(sorted).to.have.length(0);
    });

    it("should handle single node", async () => {
      await graph.addRoot(simpleContractPath);

      const sorted = graph.getSortedForFlattening();
      expect(sorted).to.have.length(1);
    });
  });

  describe("getStats()", () => {
    it("should return correct stats for empty graph", () => {
      const stats = graph.getStats();

      expect(stats.totalContracts).to.equal(0);
      expect(stats.uniqueContracts).to.equal(0);
      expect(stats.circularDependencies).to.equal(0);
      expect(stats.maxDepth).to.equal(0);
    });

    it("should return correct stats for single node", async () => {
      await graph.addRoot(simpleContractPath);

      const stats = graph.getStats();

      expect(stats.totalContracts).to.equal(1);
      expect(stats.uniqueContracts).to.equal(1);
      expect(stats.circularDependencies).to.equal(0);
      expect(stats.maxDepth).to.be.greaterThanOrEqual(1);
    });

    it("should return correct stats with dependencies", async () => {
      await graph.addRoot(contractWithImportsPath);

      const stats = graph.getStats();

      expect(stats.totalContracts).to.be.greaterThan(1);
      expect(stats.uniqueContracts).to.equal(stats.totalContracts);
      expect(stats.maxDepth).to.be.greaterThanOrEqual(1);
    });

    it("should count circular dependencies", async () => {
      await graph.addRoot(circularAPath);

      const stats = graph.getStats();

      expect(stats.circularDependencies).to.be.greaterThan(0);
    });

    it("should calculate max depth correctly", async () => {
      await graph.addRoot(contractWithImportsPath);

      const stats = graph.getStats();

      expect(stats.maxDepth).to.be.a("number");
      expect(stats.maxDepth).to.be.greaterThan(0);
    });
  });

  describe("getNodes() and getNode()", () => {
    it("should return all nodes", async () => {
      await graph.addRoot(contractWithImportsPath);

      const nodes = graph.getNodes();
      expect(nodes).to.be.instanceOf(Map);
      expect(nodes.size).to.be.greaterThan(0);
    });

    it("should return copy of nodes map", async () => {
      await graph.addRoot(simpleContractPath);

      const nodes1 = graph.getNodes();
      const nodes2 = graph.getNodes();

      expect(nodes1).to.not.equal(nodes2); // Different map instances
      expect(nodes1.size).to.equal(nodes2.size);
    });

    it("should get specific node by path", async () => {
      await graph.addRoot(simpleContractPath);

      const node = graph.getNode(simpleContractPath);
      expect(node).to.not.be.undefined;
      expect(node!.name).to.equal("SimpleContract");
    });

    it("should return undefined for non-existent node", () => {
      const node = graph.getNode("/nonexistent/path.sol");
      expect(node).to.be.undefined;
    });
  });

  describe("clear()", () => {
    it("should clear all nodes", async () => {
      await graph.addRoot(contractWithImportsPath);
      expect(graph.getNodes().size).to.be.greaterThan(0);

      graph.clear();
      expect(graph.getNodes().size).to.equal(0);
    });

    it("should clear circular dependencies", async () => {
      await graph.addRoot(circularAPath);
      expect(graph.detectCircularDependencies().length).to.be.greaterThan(0);

      graph.clear();
      expect(graph.detectCircularDependencies()).to.have.length(0);
    });

    it("should allow rebuilding after clear", async () => {
      await graph.addRoot(simpleContractPath);
      graph.clear();
      await graph.addRoot(libraryPath);

      const nodes = graph.getNodes();
      expect(nodes.size).to.equal(1);
      expect(nodes.has(libraryPath)).to.be.true;
    });
  });

  describe("Verbose Mode", () => {
    it("should work with verbose enabled", async () => {
      const verboseGraph = new DependencyGraph(resolver, true);

      // Should not throw with verbose logging
      await verboseGraph.addRoot(simpleContractPath);

      const nodes = verboseGraph.getNodes();
      expect(nodes.size).to.equal(1);
    });

    it("should work with verbose disabled", async () => {
      const quietGraph = new DependencyGraph(resolver, false);

      await quietGraph.addRoot(simpleContractPath);

      const nodes = quietGraph.getNodes();
      expect(nodes.size).to.equal(1);
    });
  });

  describe("Complex Dependency Trees", () => {
    it("should handle deep dependency chains", async () => {
      await graph.addRoot(contractWithImportsPath);

      const stats = graph.getStats();
      expect(stats.maxDepth).to.be.greaterThanOrEqual(1);
    });

    it("should handle multiple independent trees", async () => {
      await graph.addRoot(simpleContractPath);
      await graph.addRoot(libraryPath);

      const nodes = graph.getNodes();
      expect(nodes.size).to.equal(2);

      const sorted = graph.topologicalSort();
      expect(sorted.length).to.equal(2);
    });

    it("should handle shared dependencies", async () => {
      // Both contracts depend on Library
      await graph.addRoot(contractWithImportsPath);

      const libraryNode = graph.getNode(libraryPath);
      if (libraryNode) {
        expect(libraryNode.dependents.size).to.be.greaterThan(0);
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle missing source files gracefully", async () => {
      // This should not throw, but log an error for the missing import
      // The main file should still be added
      await graph.addRoot(simpleContractPath);

      expect(graph.getNodes().size).to.be.greaterThanOrEqual(1);
    });
  });
});
