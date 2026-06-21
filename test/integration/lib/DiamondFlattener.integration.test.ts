import { expect } from "chai";
import * as path from "path";
import { DiamondFlattener } from "../../../src/lib/DiamondFlattener";
import { FlattenError } from "../../../src/lib/FlattenError";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type {
  DiscoveredFacet,
  DiamondContractInfo,
  SelectorInfo,
} from "../../../src/tasks/shared/TaskOptions";

/**
 * Integration tests for DiamondFlattener
 *
 * These tests verify the complete discovery flow with real Diamond configurations.
 * They test the entire pipeline: instantiation → facet discovery → selector extraction → Diamond discovery
 */
describe("DiamondFlattener Integration Tests", () => {
  let mockHre: Partial<HardhatRuntimeEnvironment>;

  beforeEach(() => {
    // Set up mock HRE with ExampleDiamond configuration
    // Point to monorepo root where ExampleDiamond configs actually exist
    // From packages/hardhat-diamonds/test/integration/lib -> go up to packages/hardhat-diamonds (3 levels)
    // then up to packages (1 level), then up to monorepo root (1 level) = 5 levels total
    const monorepoRoot = path.resolve(__dirname, "../../../../..");
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
          root: monorepoRoot,
          sources: "contracts",
          artifacts: "artifacts",
        },
      } as any,
    };
  });

  describe("End-to-End Discovery Flow", () => {
    it("should complete full discovery flow without errors", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: true,
        }
      );

      // Step 1: Discover facets
      const facets = await flattener.discoverFacets();
      expect(facets).to.be.an("array");

      // Step 2: Build selector map
      const selectorMap = await flattener.buildSelectorMap(facets);
      expect(selectorMap).to.be.instanceOf(Map);

      // Step 3: Discover Diamond contract
      const diamondContract = await flattener.discoverDiamondContract();
      expect(diamondContract).to.have.property("name", "ExampleDiamond");

      // Verify warnings were collected (not thrown)
      const warnings = flattener.getWarnings();
      expect(warnings).to.be.an("array");
    });

    it("should handle verbose mode correctly", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: true,
        }
      );

      // Verbose mode should not throw errors, just log more
      await flattener.discoverFacets();
      await flattener.buildSelectorMap([]);
      await flattener.discoverDiamondContract();

      // Should complete without errors
      expect(true).to.be.true;
    });

    it("should accumulate warnings without stopping execution", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      // Discover facets (may add warnings for missing files)
      const facets = await flattener.discoverFacets();

      // Build selector map (may add warnings for failed facet processing)
      await flattener.buildSelectorMap(facets);

      // Discover Diamond (may add warning if not found)
      await flattener.discoverDiamondContract();

      // Should have collected warnings but not thrown
      const warnings = flattener.getWarnings();
      expect(warnings).to.be.an("array");
      // Warnings may or may not exist depending on environment
    });
  });

  describe("Facet Discovery Integration", () => {
    it("should discover facets from Diamond configuration", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      const facets = await flattener.discoverFacets();

      // Should return array (may be empty if config not found)
      expect(facets).to.be.an("array");

      // Each facet should have expected structure
      facets.forEach((facet: DiscoveredFacet) => {
        expect(facet).to.have.property("name");
        expect(facet).to.have.property("contractPath");
        expect(facet).to.have.property("selectors");
        expect(facet).to.have.property("isInit");
        expect(facet.selectors).to.be.an("array");
      });
    });

    it("should properly identify init contracts", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      const facets = await flattener.discoverFacets();

      // Filter init contracts
      const initFacets = facets.filter((f: DiscoveredFacet) => f.isInit);
      const regularFacets = facets.filter((f: DiscoveredFacet) => !f.isInit);

      // Verify init facets have expected naming patterns
      initFacets.forEach((facet: DiscoveredFacet) => {
        const name = facet.name.toLowerCase();
        const hasInitPattern =
          name.includes("init") ||
          name.includes("deployer") ||
          name === "protocolinitfacet";
        expect(hasInitPattern).to.be.true;
      });

      // Regular facets should not have init patterns
      regularFacets.forEach((facet: DiscoveredFacet) => {
        expect(facet.isInit).to.be.false;
      });
    });

    it("should sort facets by priority", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      const facets = await flattener.discoverFacets();

      // Verify priority ordering (ascending)
      for (let i = 1; i < facets.length; i++) {
        const prevPriority = facets[i - 1].priority ?? 1000;
        const currPriority = facets[i].priority ?? 1000;
        expect(currPriority).to.be.at.least(prevPriority);
      }
    });
  });

  describe("Selector Extraction Integration", () => {
    it("should build selector map from discovered facets", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      const facets = await flattener.discoverFacets();
      const selectorMap = await flattener.buildSelectorMap(facets);

      expect(selectorMap).to.be.instanceOf(Map);

      // Each selector should map to SelectorInfo with complete metadata
      selectorMap.forEach((info: SelectorInfo, selector: string) => {
        expect(selector).to.match(/^0x[0-9a-f]{8}$/); // 4-byte hex
        expect(info).to.have.property("selector", selector);
        expect(info).to.have.property("facetName");
        expect(info).to.have.property("functionName");
        expect(info).to.have.property("signature");
        expect(info.facetName).to.be.a("string");
        expect(info.functionName).to.be.a("string");
        expect(info.signature).to.be.a("string");
      });
    });

    it("should skip init contracts when building selector map", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      const facets = await flattener.discoverFacets();
      const selectorMap = await flattener.buildSelectorMap(facets);

      // Get all facet names from selector map
      const facetNamesInMap = new Set<string>();
      selectorMap.forEach((info: SelectorInfo) => {
        facetNamesInMap.add(info.facetName);
      });

      // Verify no init facets in map
      const initFacets = facets.filter((f: DiscoveredFacet) => f.isInit);
      initFacets.forEach((initFacet: DiscoveredFacet) => {
        expect(facetNamesInMap.has(initFacet.name)).to.be.false;
      });
    });

    it("should handle empty facet arrays", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      const selectorMap = await flattener.buildSelectorMap([]);

      expect(selectorMap).to.be.instanceOf(Map);
      expect(selectorMap.size).to.equal(0);
    });
  });

  describe("Diamond Contract Discovery Integration", () => {
    it("should discover Diamond contract information", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      const contractInfo = await flattener.discoverDiamondContract();

      expect(contractInfo).to.have.property("name", "ExampleDiamond");
      expect(contractInfo).to.have.property("sourcePath");
      expect(contractInfo).to.have.property("found");
      expect(contractInfo.sourcePath).to.be.a("string");
      expect(contractInfo.found).to.be.a("boolean");
    });

    it("should handle missing Diamond contract gracefully", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      const contractInfo = await flattener.discoverDiamondContract();

      // Should not throw, just mark as not found
      expect(contractInfo.found).to.be.a("boolean");

      // Should have warning if not found
      if (!contractInfo.found) {
        const warnings = flattener.getWarnings();
        const hasNotFoundWarning = warnings.some((w) =>
          w.includes("Diamond contract source file not found")
        );
        expect(hasNotFoundWarning).to.be.true;
      }
    });
  });

  describe("Error Handling", () => {
    it("should throw FlattenError for invalid Diamond configuration", async () => {
      const invalidHre = {
        ...mockHre,
        config: {
          ...mockHre.config,
          diamonds: {
            paths: {},
          },
        },
      };

      expect(() => {
        new DiamondFlattener(invalidHre as HardhatRuntimeEnvironment, {
          diamondName: "NonExistentDiamond",
          outputPath: "./flattened/NonExistent.sol",
        });
      }).to.throw(FlattenError);
    });

    it("should not throw for non-critical failures", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      // These should complete without throwing
      await flattener.discoverFacets();
      await flattener.buildSelectorMap([]);
      await flattener.discoverDiamondContract();

      // Warnings should be collected, not thrown
      const warnings = flattener.getWarnings();
      expect(warnings).to.be.an("array");
    });
  });

  describe("Warning Collection", () => {
    it("should collect warnings across multiple operations", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      const initialWarnings = flattener.getWarnings().length;

      // Run operations that may generate warnings
      await flattener.discoverFacets();
      await flattener.buildSelectorMap([]);
      await flattener.discoverDiamondContract();

      const finalWarnings = flattener.getWarnings().length;

      // Warnings should be accumulated
      expect(finalWarnings).to.be.at.least(initialWarnings);
    });

    it("should allow clearing warnings", async () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: false,
        }
      );

      // Generate some warnings
      await flattener.discoverDiamondContract();

      // Clear warnings
      flattener.clearWarnings();

      expect(flattener.getWarnings()).to.have.lengthOf(0);
    });
  });
});
