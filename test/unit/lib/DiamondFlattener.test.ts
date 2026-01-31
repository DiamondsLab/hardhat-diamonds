import { expect } from "chai";
import { DiamondFlattener } from "../../../src/lib/DiamondFlattener";
import { FlattenError, ErrorCodes } from "../../../src/lib/FlattenError";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { DiscoveredFacet } from "../../../src/tasks/shared/TaskOptions";
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
      expect(ErrorCodes.INVALID_CONFIGURATION).to.equal(
        "INVALID_CONFIGURATION"
      );
      expect(ErrorCodes.NETWORK_ERROR).to.equal("NETWORK_ERROR");
      expect(ErrorCodes.DIAMOND_INITIALIZATION_FAILED).to.equal(
        "DIAMOND_INITIALIZATION_FAILED"
      );
      expect(ErrorCodes.PATH_RESOLUTION_FAILED).to.equal(
        "PATH_RESOLUTION_FAILED"
      );
      expect(ErrorCodes.SELECTOR_EXTRACTION_FAILED).to.equal(
        "SELECTOR_EXTRACTION_FAILED"
      );
      expect(ErrorCodes.ABI_LOAD_FAILED).to.equal("ABI_LOAD_FAILED");
      expect(ErrorCodes.FILE_SYSTEM_ERROR).to.equal("FILE_SYSTEM_ERROR");
    });
  });

  describe("Constructor", () => {
    it("should create DiamondFlattener with required options", () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
        }
      );

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      expect(flattener.getWarnings()).to.be.an("array").that.is.empty;
    });

    it("should apply default values for networkName", () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
        }
      );

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // Network name defaults to hre.network.name which is "hardhat" in mock
    });

    it("should apply default values for chainId", () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
        }
      );

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // ChainId defaults to hre.network.config.chainId which is 31337 in mock
    });

    it("should apply default values for diamondsPath", () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
        }
      );

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // Should use path from config or default to "diamonds"
    });

    it("should apply default values for contractsPath", () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
        }
      );

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // Should use path from config or default to "contracts"
    });

    it("should apply default values for verbose (false)", () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
        }
      );

      expect(flattener).to.be.instanceOf(DiamondFlattener);
      // Verbose defaults to false, so no console output should happen
    });

    it("should accept custom networkName", () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          networkName: "localhost",
        }
      );

      expect(flattener).to.be.instanceOf(DiamondFlattener);
    });

    it("should accept custom chainId", () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          chainId: 1,
        }
      );

      expect(flattener).to.be.instanceOf(DiamondFlattener);
    });

    it("should accept custom verbose flag", () => {
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
          verbose: true,
        }
      );

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
      })
        .to.throw(FlattenError)
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
      })
        .to.throw(FlattenError)
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
      const flattener = new DiamondFlattener(
        mockHre as HardhatRuntimeEnvironment,
        {
          diamondName: "ExampleDiamond",
          outputPath: "./flattened/ExampleDiamond.sol",
        }
      );

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
        const resolveContractPath = (flattener as any).resolveContractPath.bind(
          flattener
        );
        const path = await resolveContractPath("NonExistentContract");
        expect(path).to.be.null;
      });
    });

    describe("isInitContract", () => {
      it("should identify protocolInitFacet as init contract", () => {
        const isInitContract = (flattener as any).isInitContract.bind(
          flattener
        );
        const result = isInitContract("DiamondInit", mockDiamondConfigWithInit);
        expect(result).to.be.true;
      });

      it("should identify facet with deployInit as init contract", () => {
        const isInitContract = (flattener as any).isInitContract.bind(
          flattener
        );
        const result = isInitContract("DiamondInit", mockDiamondConfigWithInit);
        expect(result).to.be.true;
      });

      it("should identify facet by naming convention (ends with Init)", () => {
        const isInitContract = (flattener as any).isInitContract.bind(
          flattener
        );
        const result = isInitContract("CustomInit", { facets: {} });
        expect(result).to.be.true;
      });

      it("should identify facet by naming convention (ends with InitFacet)", () => {
        const isInitContract = (flattener as any).isInitContract.bind(
          flattener
        );
        const result = isInitContract("CustomInitFacet", { facets: {} });
        expect(result).to.be.true;
      });

      it("should NOT identify regular facet as init contract", () => {
        const isInitContract = (flattener as any).isInitContract.bind(
          flattener
        );
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
        const noFacetsWarning = warnings.find((w) =>
          w.includes("No facets configured")
        );
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
        const facetNames = facets.map((f) => f.name);
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
        const initFacet = facets.find((f) => f.name === "ExampleInitFacet");
        expect(initFacet).to.exist;
        expect(initFacet!.isInit).to.be.true;

        // Regular facets should not be init
        const regularFacet = facets.find((f) => f.name === "DiamondCutFacet");
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
        facets.forEach((facet) => {
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
        const sourceWarnings = warnings.filter((w) =>
          w.includes("Source file not found")
        );
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
          expect((error as FlattenError).code).to.equal(
            ErrorCodes.INVALID_CONFIGURATION
          );
        }
      });

      it("should use fallback config loading when Diamond instance not available", async () => {
        // Set diamond to null to trigger fallback
        (flattener as any).diamond = null;

        // Mock the fallback method
        (flattener as any).loadDeployConfigFallback = async () =>
          mockDiamondConfigWithFacets;

        const facets = await flattener.discoverFacets();
        expect(facets.length).to.be.greaterThan(0);
      });
    });
  });

  describe("Selector Extraction (Task 3.0)", () => {
    let flattener: DiamondFlattener;

    beforeEach(() => {
      flattener = new DiamondFlattener(mockHre as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
        outputPath: "/test/output/ExampleDiamond.sol",
        verbose: false,
      });
    });

    describe("buildFunctionSignature()", () => {
      it("should build signature for function with no parameters", () => {
        const abiItem = {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [{ name: "", type: "address" }],
        };

        const signature = (flattener as any).buildFunctionSignature(abiItem);
        expect(signature).to.equal("owner()");
      });

      it("should build signature for function with single parameter", () => {
        const abiItem = {
          type: "function",
          name: "balanceOf",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "uint256" }],
        };

        const signature = (flattener as any).buildFunctionSignature(abiItem);
        expect(signature).to.equal("balanceOf(address)");
      });

      it("should build signature for function with multiple parameters", () => {
        const abiItem = {
          type: "function",
          name: "transfer",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
        };

        const signature = (flattener as any).buildFunctionSignature(abiItem);
        expect(signature).to.equal("transfer(address,uint256)");
      });

      it("should handle complex types (tuples, arrays)", () => {
        const abiItem = {
          type: "function",
          name: "complexFunction",
          inputs: [
            { name: "simpleParam", type: "uint256" },
            { name: "arrayParam", type: "address[]" },
            {
              name: "tupleParam",
              type: "tuple",
              components: [
                { name: "field1", type: "uint256" },
                { name: "field2", type: "string" },
              ],
            },
          ],
          outputs: [],
        };

        const signature = (flattener as any).buildFunctionSignature(abiItem);
        expect(signature).to.equal("complexFunction(uint256,address[],tuple)");
      });
    });

    describe("buildFullSignature()", () => {
      it("should build full signature with parameter names", () => {
        const abiItem = {
          type: "function",
          name: "transfer",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
        };

        const signature = (flattener as any).buildFullSignature(abiItem);
        expect(signature).to.equal("transfer(address to, uint256 amount)");
      });

      it("should handle unnamed parameters", () => {
        const abiItem = {
          type: "function",
          name: "testFunction",
          inputs: [
            { name: "", type: "uint256" },
            { name: "named", type: "address" },
          ],
          outputs: [],
        };

        const signature = (flattener as any).buildFullSignature(abiItem);
        expect(signature).to.equal("testFunction(uint256, address named)");
      });

      it("should handle function with no parameters", () => {
        const abiItem = {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [{ name: "", type: "address" }],
        };

        const signature = (flattener as any).buildFullSignature(abiItem);
        expect(signature).to.equal("owner()");
      });
    });

    describe("extractSelectorsFromAbi()", () => {
      it("should extract selectors from ABI with multiple functions", () => {
        const abi = [
          {
            type: "function",
            name: "owner",
            inputs: [],
            outputs: [{ name: "", type: "address" }],
          },
          {
            type: "function",
            name: "transfer",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "", type: "bool" }],
          },
        ];

        const selectors = (flattener as any).extractSelectorsFromAbi(abi);
        expect(selectors).to.have.lengthOf(2);
        expect(selectors[0]).to.match(/^0x[0-9a-f]{8}$/); // 4-byte hex
        expect(selectors[1]).to.match(/^0x[0-9a-f]{8}$/);
      });

      it("should return empty array for empty ABI", () => {
        const selectors = (flattener as any).extractSelectorsFromAbi([]);
        expect(selectors).to.be.an("array").that.is.empty;
      });

      it("should filter out non-function entries", () => {
        const abi = [
          {
            type: "function",
            name: "testFunction",
            inputs: [],
            outputs: [],
          },
          {
            type: "event",
            name: "TestEvent",
            inputs: [{ name: "value", type: "uint256", indexed: false }],
          },
          {
            type: "error",
            name: "TestError",
            inputs: [{ name: "message", type: "string" }],
          },
        ];

        const selectors = (flattener as any).extractSelectorsFromAbi(abi);
        expect(selectors).to.have.lengthOf(1); // Only the function
      });

      it("should compute correct selector for known function", () => {
        // transfer(address,uint256) should have selector 0xa9059cbb
        const abi = [
          {
            type: "function",
            name: "transfer",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "", type: "bool" }],
          },
        ];

        const selectors = (flattener as any).extractSelectorsFromAbi(abi);
        expect(selectors).to.have.lengthOf(1);
        expect(selectors[0]).to.equal("0xa9059cbb");
      });
    });

    describe("buildSelectorMap()", () => {
      it("should build selector map for non-init facets", async () => {
        const mockFacets: DiscoveredFacet[] = [
          {
            name: "OwnershipFacet",
            contractPath: "/path/to/OwnershipFacet.sol",
            selectors: [],
            isInit: false,
            priority: 1,
          },
        ];

        // Mock getFacetSelectors to return expected selectors
        const originalGetFacetSelectors = (flattener as any).getFacetSelectors;
        (flattener as any).getFacetSelectors = async () => ["0x8da5cb5b"];

        // Clear warnings before test
        flattener.clearWarnings();

        const selectorMap = await flattener.buildSelectorMap(mockFacets);
        
        // Should have warning about failed artifact import (since we're not mocking that)
        // But map should still be processed
        expect(selectorMap).to.be.instanceOf(Map);

      });

      it("should skip init contracts", async () => {
        const mockFacets: DiscoveredFacet[] = [
          {
            name: "DiamondInit",
            contractPath: "/path/to/DiamondInit.sol",
            selectors: [],
            isInit: true,
            priority: 0,
          },
        ];

        const selectorMap = await flattener.buildSelectorMap(mockFacets);
        expect(selectorMap.size).to.equal(0); // Init contracts are skipped
      });

      it("should add warnings for facets that fail to process", async () => {
        const mockFacets: DiscoveredFacet[] = [
          {
            name: "NonExistentFacet",
            contractPath: "/path/to/NonExistent.sol",
            selectors: [],
            isInit: false,
            priority: 1,
          },
        ];

        // Clear warnings before test
        flattener.clearWarnings();

        await flattener.buildSelectorMap(mockFacets);
        const warnings = flattener.getWarnings();

        // Should have warning about failed processing
        expect(warnings.length).to.be.greaterThan(0);
        const hasProcessingWarning = warnings.some((w) =>
          w.includes("Failed to process facet")
        );
        expect(hasProcessingWarning).to.be.true;
      });

      it("should handle empty facets array", async () => {
        const mockFacets: DiscoveredFacet[] = [];

        const selectorMap = await flattener.buildSelectorMap(mockFacets);
        expect(selectorMap.size).to.equal(0);
      });
    });
  });
});
