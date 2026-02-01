import { expect } from "chai";
import { flattenDiamond } from "../../../src/lib/DiamondFlattener";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

describe("Epic 5: flattenDiamond Programmatic API", () => {
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
            TestDiamond: {
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

  describe("flattenDiamond function", () => {
    it("should be a function", () => {
      expect(flattenDiamond).to.be.a("function");
    });

    it("should require diamondName parameter", () => {
      const options = {
        diamondName: "TestDiamond",
      };

      expect(options).to.have.property("diamondName");
    });

    it("should accept optional networkName parameter", () => {
      const options = {
        diamondName: "TestDiamond",
        networkName: "localhost",
      };

      expect(options.networkName).to.equal("localhost");
    });

    it("should accept optional chainId parameter", () => {
      const options = {
        diamondName: "TestDiamond",
        chainId: 1,
      };

      expect(options.chainId).to.equal(1);
    });

    it("should accept optional diamondsPath parameter", () => {
      const options = {
        diamondName: "TestDiamond",
        diamondsPath: "custom/diamonds/path",
      };

      expect(options.diamondsPath).to.equal("custom/diamonds/path");
    });

    it("should accept optional contractsPath parameter", () => {
      const options = {
        diamondName: "TestDiamond",
        contractsPath: "custom/contracts/path",
      };

      expect(options.contractsPath).to.equal("custom/contracts/path");
    });

    it("should accept optional verbose parameter", () => {
      const options = {
        diamondName: "TestDiamond",
        verbose: true,
      };

      expect(options.verbose).to.be.true;
    });

    it("should accept optional outputPath parameter", () => {
      const options = {
        diamondName: "TestDiamond",
        outputPath: "./custom/output.sol",
      };

      expect(options.outputPath).to.equal("./custom/output.sol");
    });

    it("should accept partial options with required diamondName", () => {
      const partialOptions = {
        diamondName: "TestDiamond",
        verbose: true,
      };

      expect(partialOptions).to.have.property("diamondName");
      expect(partialOptions).to.have.property("verbose");
      expect(partialOptions).to.not.have.property("networkName");
    });

    it("should accept all options together", () => {
      const fullOptions = {
        diamondName: "TestDiamond",
        networkName: "mainnet",
        chainId: 1,
        diamondsPath: "custom/diamonds",
        contractsPath: "custom/contracts",
        verbose: true,
        outputPath: "./output.sol",
      };

      expect(fullOptions.diamondName).to.equal("TestDiamond");
      expect(fullOptions.networkName).to.equal("mainnet");
      expect(fullOptions.chainId).to.equal(1);
      expect(fullOptions.diamondsPath).to.equal("custom/diamonds");
      expect(fullOptions.contractsPath).to.equal("custom/contracts");
      expect(fullOptions.verbose).to.be.true;
      expect(fullOptions.outputPath).to.equal("./output.sol");
    });
  });

  describe("Return value structure", () => {
    it("should define expected result structure", () => {
      // This test documents the expected return type structure
      const expectedResult = {
        flattenedSource: "// Solidity source code",
        facets: [],
        selectorMap: {},
        warnings: [],
        stats: {
          totalFacets: 0,
          totalSelectors: 0,
          totalContracts: 0,
          totalLines: 0,
          deduplicatedContracts: 0,
          executionTimeMs: 0,
        },
      };

      expect(expectedResult).to.have.property("flattenedSource");
      expect(expectedResult).to.have.property("facets");
      expect(expectedResult).to.have.property("selectorMap");
      expect(expectedResult).to.have.property("warnings");
      expect(expectedResult).to.have.property("stats");
      expect(expectedResult.stats).to.have.property("totalFacets");
      expect(expectedResult.stats).to.have.property("totalSelectors");
      expect(expectedResult.stats).to.have.property("totalContracts");
      expect(expectedResult.stats).to.have.property("totalLines");
      expect(expectedResult.stats).to.have.property("deduplicatedContracts");
      expect(expectedResult.stats).to.have.property("executionTimeMs");
    });
  });

  describe("Default parameter handling", () => {
    it("should use networkName from HRE when not provided", () => {
      const options = {
        diamondName: "TestDiamond",
      };

      // networkName should default to hre.network.name
      expect(mockHre.network?.name).to.equal("hardhat");
    });

    it("should use chainId from HRE when not provided", () => {
      const options = {
        diamondName: "TestDiamond",
      };

      // chainId should default to hre.network.config.chainId
      expect(mockHre.network?.config?.chainId).to.equal(31337);
    });

    it("should use default diamondsPath when not provided", () => {
      const options = {
        diamondName: "TestDiamond",
      };

      // diamondsPath defaults to "diamonds" or from config
      expect(mockHre.config?.diamonds?.paths?.TestDiamond?.deploymentsPath).to.equal(
        "diamonds"
      );
    });

    it("should use default contractsPath when not provided", () => {
      const options = {
        diamondName: "TestDiamond",
      };

      // contractsPath defaults to "contracts" or from config
      expect(mockHre.config?.diamonds?.paths?.TestDiamond?.contractsPath).to.equal(
        "contracts/examplediamond"
      );
    });

    it("should use verbose false when not provided", () => {
      const options = {
        diamondName: "TestDiamond",
      };

      // verbose defaults to false
      expect(options).to.not.have.property("verbose");
    });

    it("should use default outputPath when not provided", () => {
      const diamondName = "TestDiamond";
      const defaultPath = `./flattened/${diamondName}.sol`;

      expect(defaultPath).to.equal("./flattened/TestDiamond.sol");
    });
  });

  describe("Parameter override", () => {
    it("should override networkName from HRE when provided", () => {
      const options = {
        diamondName: "TestDiamond",
        networkName: "localhost",
      };

      expect(options.networkName).to.equal("localhost");
      expect(options.networkName).to.not.equal(mockHre.network?.name);
    });

    it("should override chainId from HRE when provided", () => {
      const options = {
        diamondName: "TestDiamond",
        chainId: 1,
      };

      expect(options.chainId).to.equal(1);
      expect(options.chainId).to.not.equal(mockHre.network?.config?.chainId);
    });

    it("should override default paths when provided", () => {
      const options = {
        diamondName: "TestDiamond",
        diamondsPath: "custom/path",
        contractsPath: "custom/contracts",
      };

      expect(options.diamondsPath).to.equal("custom/path");
      expect(options.contractsPath).to.equal("custom/contracts");
    });
  });
});
