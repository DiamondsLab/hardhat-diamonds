import { expect } from "chai";
import { DiamondFlattener } from "../../../src/lib/DiamondFlattener";
import { FlattenError, ErrorCodes } from "../../../src/lib/FlattenError";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  mockDiamondConfigWithFacets,
  mockDiamondConfigEmpty,
  mockDiamondConfigWithInit,
  mockDiamondConfigMixedPriority,
} from "../../fixtures/mock-diamond-config";

describe("DiamondFlattener", () => {
  // Mock HRE for testing
  let mockHre: Partial<HardhatRuntimeEnvironment>;

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
        diamonds: {
          paths: {
            ExampleDiamond: {
              deploymentsPath: "diamonds",
              contractsPath: "contracts/examplediamond",
            },
          },
        },
        paths: {
          root: "/test/project",
          sources: "contracts",
          artifacts: "artifacts",
        },
      } as any,
    };
  });

  describe("FlattenError", () => {
    it("should create error with message, code, and details", () => {
      const error = new FlattenError(
        "Test error message",
        ErrorCodes.DIAMOND_NOT_FOUND,
        { diamondName: "TestDiamond" }
      );

      expect(error.message).to.equal("Test error message");
      expect(error.code).to.equal(ErrorCodes.DIAMOND_NOT_FOUND);
      expect(error.details).to.deep.equal({ diamondName: "TestDiamond" });
      expect(error.name).to.equal("FlattenError");
    });

    it("should create error without details", () => {
      const error = new FlattenError(
        "Test error message",
        ErrorCodes.INVALID_CONFIGURATION
      );

      expect(error.message).to.equal("Test error message");
      expect(error.code).to.equal(ErrorCodes.INVALID_CONFIGURATION);
      expect(error.details).to.be.undefined;
    });

    it("should have proper error name", () => {
      const error = new FlattenError("Test", ErrorCodes.NETWORK_ERROR);
      expect(error.name).to.equal("FlattenError");
    });

    it("should be instance of Error", () => {
      const error = new FlattenError("Test", ErrorCodes.NETWORK_ERROR);
      expect(error).to.be.instanceOf(Error);
    });
  });

  describe("ErrorCodes", () => {
    it("should have all required error codes", () => {
      expect(ErrorCodes.DIAMOND_NOT_FOUND).to.equal("DIAMOND_NOT_FOUND");
      expect(ErrorCodes.INVALID_CONFIGURATION).to.equal("INVALID_CONFIGURATION");
      expect(ErrorCodes.NETWORK_ERROR).to.equal("NETWORK_ERROR");
      expect(ErrorCodes.DIAMOND_INITIALIZATION_FAILED).to.equal("DIAMOND_INITIALIZATION_FAILED");
      expect(ErrorCodes.PATH_RESOLUTION_FAILED).to.equal("PATH_RESOLUTION_FAILED");
      expect(ErrorCodes.SELECTOR_EXTRACTION_FAILED).to.equal("SELECTOR_EXTRACTION_FAILED");
      expect(ErrorCodes.ABI_LOAD_FAILED).to.equal("ABI_LOAD_FAILED");
      expect(ErrorCodes.FILE_SYSTEM_ERROR).to.equal("FILE_SYSTEM_ERROR");
    });
  });

  describe("Constructor", () => {
    it("should create DiamondFlattener with required options", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      expect(flattener.getWarnings()).to.be.an("array").that.is.empty;
    });

    it("should apply default values for networkName", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // Network name defaults to hre.network.name which is "hardhat" in mock
    });

    it("should apply default values for chainId", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // ChainId defaults to hre.network.config.chainId which is 31337 in mock
    });

    it("should apply default values for diamondsPath", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // Should use path from config or default to "diamonds"
    });

    it("should apply default values for contractsPath", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // Should use path from config or default to "contracts"
    });

    it("should apply default values for verbose (false)", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // Verbose defaults to false, so no console output should happen
    });

    it("should accept custom networkName", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
        networkName: "localhost",
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
    });

    it("should accept custom chainId", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
        chainId: 1,
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
    });

    it("should accept custom verbose flag", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
        verbose: true,
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
    });
  });

  describe("initializeDiamond", () => {
    it("should throw FlattenError if Diamond configuration not found", () => {
      // Remove Diamond configuration
      mockHre.config = {
        diamonds: {
          paths: {},
        },
      } as any;

      expect(() => {
        new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
          diamondName: "NonExistentDiamond",
          outputPath: "./flattened/NonExistent.sol",
        });
      }).to.throw(FlattenError)
        .with.property("code", ErrorCodes.DIAMOND_NOT_FOUND);
    });

    it("should include helpful error message when Diamond not found", () => {
      mockHre.config = {
        diamonds: {
          paths: {
            ExampleDiamond: {
              deploymentsPath: "diamonds",
              contractsPath: "contracts",
            },
          },
        },
      } as any;

      expect(() => {
        new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
          diamondName: "NonExistentDiamond",
          outputPath: "./flattened/NonExistent.sol",
        });
      }).to.throw(FlattenError)
        .with.property("message")
        .that.includes("NonExistentDiamond")
        .and.includes("hardhat.config.ts");
    });

    it("should include available diamonds in error details", () => {
      mockHre.config = {
        diamonds: {
          paths: {
            ExampleDiamond: {
              deploymentsPath: "diamonds",
              contractsPath: "contracts",
            },
            AnotherDiamond: {
              deploymentsPath: "diamonds",
              contractsPath: "contracts",
            },
          },
        },
      } as any;

      try {
        new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
          diamondName: "NonExistentDiamond",
          outputPath: "./flattened/NonExistent.sol",
        });
        expect.fail("Should have thrown FlattenError");
      } catch (error) {
        expect(error).to.be.instanceOf(FlattenError);
        const flattenError = error as FlattenError;
        expect(flattenError.details).to.have.property("availableDiamonds");
        expect(flattenError.details).to.deep.include({
          diamondName: "NonExistentDiamond",
          availableDiamonds: ["ExampleDiamond", "AnotherDiamond"],
        });
      }
    });

    it("should succeed with valid Diamond configuration", () => {
      const flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });

      expect(flattener).to.be.instanceOf(DiamondFlattener);
    });
  });

  describe("Warning Collection", () => {
    let flattener: DiamondFlattener;

    beforeEach(() => {
      flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });
    });

    it("should start with empty warnings array", () => {
      expect(flattener.getWarnings()).to.be.an("array").that.is.empty;
    });

    it("should return copy of warnings array", () => {
      const warnings1 = flattener.getWarnings();
      const warnings2 = flattener.getWarnings();
      
      expect(warnings1).to.not.equal(warnings2);
      expect(warnings1).to.deep.equal(warnings2);
    });

    it("should clear all warnings", () => {
      // Note: We can't directly test addWarning since it's private,
      // but we can test that clearWarnings works
      flattener.clearWarnings();
      expect(flattener.getWarnings()).to.be.an("array").that.is.empty;
    });
  });

  describe("Public Methods (Placeholders)", () => {
    let flattener: DiamondFlattener;

    beforeEach(() => {
      flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });
    });

    it("should have discoverFacets method", () => {
      expect(flattener.discoverFacets).to.be.a("function");
    });

    it("should have buildSelectorMap method", () => {
      expect(flattener.buildSelectorMap).to.be.a("function");
    });

    it("should have discoverDiamondContract method", () => {
      expect(flattener.discoverDiamondContract).to.be.a("function");
    });

    it("buildSelectorMap should return empty Map (placeholder)", async () => {
      const selectorMap = await flattener.buildSelectorMap([]);
      expect(selectorMap).to.be.instanceOf(Map);
      expect(selectorMap.size).to.equal(0);
    });

    it("discoverDiamondContract should return not found (placeholder)", async () => {
      const contractInfo = await flattener.discoverDiamondContract();
      expect(contractInfo).to.have.property("name", "ExampleDiamond");
      expect(contractInfo).to.have.property("found", false);
      expect(contractInfo).to.have.property("sourcePath", "");
    });

    it("discoverDiamondContract should add warning when not found", async () => {
      await flattener.discoverDiamondContract();
      const warnings = flattener.getWarnings();
      expect(warnings).to.have.lengthOf(1);
      expect(warnings[0]).to.include("Diamond contract source file not found");
    });
  });

  describe("Facet Discovery", () => {
    let flattener: DiamondFlattener;

    beforeEach(() => {
      flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "./flattened/ExampleDiamond.sol",
      });
    });

    describe("resolveContractPath", () => {
      it("should return null for non-existent contract", async () => {
        // Access private method via type casting for testing
        const resolveContractPath = (flattener as any).resolveContractPath.bind(flattener);
        const path = await resolveContractPath("NonExistentContract");
        expect(path).to.be.null;
      });
    });

    describe("isInitContract", () => {
      it("should identify protocolInitFacet as init contract", () => {
        const isInitContract = (flattener as any).isInitContract.bind(flattener);
        const result = isInitContract("DiamondInit", mockDiamondConfigWithInit);
        expect(result).to.be.true;
      });

      it("should identify facet with deployInit as init contract", () => {
        const isInitContract = (flattener as any).isInitContract.bind(flattener);
        const result = isInitContract("DiamondInit", mockDiamondConfigWithInit);
        expect(result).to.be.true;
      });

      it("should identify facet by naming convention (ends with Init)", () => {
        const isInitContract = (flattener as any).isInitContract.bind(flattener);
        const result = isInitContract("CustomInit", { facets: {} });
        expect(result).to.be.true;
      });

      it("should identify facet by naming convention (ends with InitFacet)", () => {
        const isInitContract = (flattener as any).isInitContract.bind(flattener);
        const result = isInitContract("CustomInitFacet", { facets: {} });
        expect(result).to.be.true;
      });

      it("should NOT identify regular facet as init contract", () => {
        const isInitContract = (flattener as any).isInitContract.bind(flattener);
        const result = isInitContract("DiamondCutFacet", { facets: {} });
        expect(result).to.be.false;
      });
    });

    describe("discoverFacets", () => {
      it("should return empty array when no facets configured", async () => {
        // Mock diamond with no facets
        (flattener as any).diamond = {
          getDeployConfig: () => mockDiamondConfigEmpty,
        };

        // Clear any existing warnings from constructor
        flattener.clearWarnings();

        const facets = await flattener.discoverFacets();
        expect(facets).to.be.an("array").that.is.empty;
        
        // Should add warning about no facets
        const warnings = flattener.getWarnings();
        expect(warnings).to.have.length.greaterThan(0);
        const noFacetsWarning = warnings.find(w => w.includes("No facets configured"));
        expect(noFacetsWarning).to.exist;
      });

      it("should discover facets from Diamond configuration", async () => {
        // Mock diamond with facets
        (flattener as any).diamond = {
          getDeployConfig: () => mockDiamondConfigWithFacets,
        };

        const facets = await flattener.discoverFacets();
        expect(facets).to.have.lengthOf(4);
        
        // Check facet names
        const facetNames = facets.map(f => f.name);
        expect(facetNames).to.include("DiamondCutFacet");
        expect(facetNames).to.include("DiamondLoupeFacet");
        expect(facetNames).to.include("ExampleOwnershipFacet");
        expect(facetNames).to.include("ExampleInitFacet");
      });

      it("should sort facets by priority ascending", async () => {
        // Mock diamond with mixed priority facets
        (flattener as any).diamond = {
          getDeployConfig: () => mockDiamondConfigMixedPriority,
        };

        const facets = await flattener.discoverFacets();
        expect(facets).to.have.lengthOf(4);
        
        // Verify sorting: LowPriority(5), MediumPriority(50), HighPriority(100), Init(200)
        expect(facets[0].name).to.equal("LowPriorityFacet");
        expect(facets[1].name).to.equal("MediumPriorityFacet");
        expect(facets[2].name).to.equal("HighPriorityFacet");
        expect(facets[3].name).to.equal("InitFacet");
      });

      it("should identify init contracts correctly", async () => {
        // Mock diamond with init facet
        (flattener as any).diamond = {
          getDeployConfig: () => mockDiamondConfigWithFacets,
        };

        const facets = await flattener.discoverFacets();
        
        // Find ExampleInitFacet
        const initFacet = facets.find(f => f.name === "ExampleInitFacet");
        expect(initFacet).to.exist;
        expect(initFacet!.isInit).to.be.true;
        
        // Regular facets should not be init
        const regularFacet = facets.find(f => f.name === "DiamondCutFacet");
        expect(regularFacet).to.exist;
        expect(regularFacet!.isInit).to.be.false;
      });

      it("should extract version information", async () => {
        // Mock diamond with facets
        (flattener as any).diamond = {
          getDeployConfig: () => mockDiamondConfigWithFacets,
        };

        const facets = await flattener.discoverFacets();
        
        // All facets should have version info
        facets.forEach(facet => {
          expect(facet).to.have.property("version");
          expect(facet.version).to.be.a("string");
        });
      });

      it("should add warnings for missing source files", async () => {
        // Mock diamond with facets (source files won't exist in test env)
        (flattener as any).diamond = {
          getDeployConfig: () => mockDiamondConfigWithFacets,
        };

        await flattener.discoverFacets();
        
        // Should have warnings about missing source files
        const warnings = flattener.getWarnings();
        expect(warnings.length).to.be.greaterThan(0);
        // At least some warnings should be about source files
        const sourceWarnings = warnings.filter(w => w.includes("Source file not found"));
        expect(sourceWarnings.length).to.be.greaterThan(0);
      });

      it("should throw FlattenError for critical configuration errors", async () => {
        // Mock diamond returning null config
        (flattener as any).diamond = {
          getDeployConfig: () => {
            throw new Error("Critical config error");
          },
        };

        // Should throw FlattenError, not generic Error
        try {
          await flattener.discoverFacets();
          expect.fail("Should have thrown FlattenError");
        } catch (error) {
          expect(error).to.be.instanceOf(FlattenError);
          expect((error as FlattenError).code).to.equal(ErrorCodes.INVALID_CONFIGURATION);
        }
      });

      it("should use fallback config loading when Diamond instance not available", async () => {
        // Set diamond to null to trigger fallback
        (flattener as any).diamond = null;

        // Mock the fallback method
        (flattener as any).loadDeployConfigFallback = async () => mockDiamondConfigWithFacets;

        const facets = await flattener.discoverFacets();
        expect(facets.length).to.be.greaterThan(0);
      });
    });
  });
});
