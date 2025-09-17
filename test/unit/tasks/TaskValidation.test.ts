import { expect } from "chai";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TaskValidation } from "../../../src/tasks/shared/TaskValidation";
import { DiamondAbiTaskArgs, DiamondAbiTypechainTaskArgs } from "../../../src/tasks/shared/TaskOptions";

// Mock Hardhat Runtime Environment
const createMockHRE = (): any => ({
  config: {
    paths: {
      root: "/test/project",
      sources: "/test/project/contracts",
      artifacts: "/test/project/artifacts",
      cache: "/test/project/cache",
      tests: "/test/project/test",
    },
    networks: {
      hardhat: {
        chainId: 31337,
      },
      mainnet: {
        chainId: 1,
        url: "https://mainnet.infura.io/v3/test",
      },
      sepolia: {
        chainId: 11155111,
        url: "https://sepolia.infura.io/v3/test",
      },
    },
  } as any,
  network: {
    name: "hardhat",
    config: { chainId: 31337 },
  } as any,
  diamonds: {
    getDiamondConfig: (name: string) => {
      if (name === "ExampleDiamond") {
        return {
          deploymentsPath: "/test/project/diamonds/ExampleDiamond",
          contractsPath: "/test/project/contracts/examplediamond",
        };
      }
      if (name === "TestDiamond") {
        return {
          deploymentsPath: "/test/project/diamonds/TestDiamond",
        };
      }
      throw new Error(`Diamond configuration for "${name}" not found.`);
    },
    diamonds: {
      paths: {
        ExampleDiamond: {
          deploymentsPath: "/test/project/diamonds/ExampleDiamond",
          contractsPath: "/test/project/contracts/examplediamond",
        },
        TestDiamond: {
          deploymentsPath: "/test/project/diamonds/TestDiamond",
        },
      },
    },
  } as any,
});

describe("TaskValidation", () => {
  let validation: TaskValidation;
  let mockHRE: any;

  beforeEach(() => {
    mockHRE = createMockHRE();
    validation = new TaskValidation(mockHRE as HardhatRuntimeEnvironment);
  });

  describe("validateDiamondAbiArgs", () => {
    it("should validate valid arguments", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
        outputDir: "/tmp/test-output",
        verbose: true,
        validateSelectors: true,
        includeSourceInfo: true,
        network: "hardhat",
      };

      const result = validation.validateDiamondAbiArgs(args);
      expect(result.isValid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
    });

    it("should reject empty diamond name", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "",
      };

      const result = validation.validateDiamondAbiArgs(args);
      expect(result.isValid).to.be.false;
      expect(result.errors).to.have.lengthOf(1);
      expect(result.errors[0].field).to.equal("diamondName");
      expect(result.errors[0].message).to.include("required");
    });

    it("should reject invalid diamond name format", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "123InvalidName",
      };

      const result = validation.validateDiamondAbiArgs(args);
      expect(result.isValid).to.be.false;
      expect(result.errors).to.have.lengthOf(1);
      expect(result.errors[0].field).to.equal("diamondName");
      expect(result.errors[0].message).to.include("start with a letter");
    });

    it("should reject invalid network", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
        network: "nonexistent",
      };

      const result = validation.validateDiamondAbiArgs(args);
      expect(result.isValid).to.be.false;
      expect(result.errors).to.have.lengthOf(1);
      expect(result.errors[0].field).to.equal("network");
      expect(result.errors[0].message).to.include("not found");
    });

    it("should accept valid network", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
        network: "mainnet",
      };

      const result = validation.validateDiamondAbiArgs(args);
      expect(result.isValid).to.be.true;
    });
  });

  describe("validateDiamondAbiTypechainArgs", () => {
    it("should validate valid TypeChain arguments", () => {
      const args: DiamondAbiTypechainTaskArgs = {
        diamondName: "ExampleDiamond",
        typechainTarget: "ethers-v6",
        typechainOutDir: "/tmp/typechain-output",
      };

      const result = validation.validateDiamondAbiTypechainArgs(args);
      expect(result.isValid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
    });

    it("should reject invalid TypeChain target", () => {
      const args: DiamondAbiTypechainTaskArgs = {
        diamondName: "ExampleDiamond",
        typechainTarget: "invalid-target",
      };

      const result = validation.validateDiamondAbiTypechainArgs(args);
      expect(result.isValid).to.be.false;
      expect(result.errors.some(e => e.field === "typechainTarget")).to.be.true;
    });

    it("should accept valid TypeChain targets", () => {
      const validTargets = ["ethers-v6", "ethers-v5", "web3-v1", "truffle-v5"];

      for (const target of validTargets) {
        const args: DiamondAbiTypechainTaskArgs = {
          diamondName: "ExampleDiamond",
          typechainTarget: target,
        };

        const result = validation.validateDiamondAbiTypechainArgs(args);
        expect(result.isValid).to.be.true;
      }
    });
  });

  describe("validateDiamondConfiguration", () => {
    it("should validate existing diamond configuration", () => {
      const result = validation.validateDiamondConfiguration("ExampleDiamond");
      expect(result.isValid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
    });

    it("should reject non-existing diamond configuration", () => {
      const result = validation.validateDiamondConfiguration("NonExistentDiamond");
      expect(result.isValid).to.be.false;
      expect(result.errors).to.have.lengthOf(1);
      expect(result.errors[0].field).to.equal("diamondName");
      expect(result.errors[0].message).to.include("not found");
    });

    it("should handle configuration with missing paths gracefully", () => {
      const result = validation.validateDiamondConfiguration("TestDiamond");
      // Should still be valid, but might have warnings about missing paths
      expect(result.isValid).to.be.true;
    });
  });

  describe("validateSystemRequirements", () => {
    it("should validate system requirements", () => {
      const result = validation.validateSystemRequirements();
      // This will depend on the actual system, but should not throw
      expect(result).to.have.property("isValid");
      expect(result).to.have.property("errors");
      expect(result).to.have.property("warnings");
    });

    it("should validate system requirements with TypeChain", () => {
      const result = validation.validateSystemRequirements(true);
      // This will depend on the actual system, but should not throw
      expect(result).to.have.property("isValid");
      expect(result).to.have.property("errors");
      expect(result).to.have.property("warnings");
    });
  });

  describe("formatValidationResult", () => {
    it("should format validation results without throwing", () => {
      const result = {
        isValid: false,
        errors: [
          {
            field: "testField",
            message: "Test error message",
            suggestion: "Test suggestion",
          },
        ],
        warnings: ["Test warning"],
      };

      // Should not throw when formatting
      expect(() => {
        TaskValidation.formatValidationResult(result, true);
      }).to.not.throw();
    });

    it("should handle valid results with warnings", () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: ["Test warning"],
      };

      // Should not throw when formatting
      expect(() => {
        TaskValidation.formatValidationResult(result, true);
      }).to.not.throw();
    });
  });

  describe("edge cases", () => {
    it("should handle undefined arguments gracefully", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
        outputDir: undefined,
        verbose: undefined,
        validateSelectors: undefined,
        includeSourceInfo: undefined,
        network: undefined,
      };

      const result = validation.validateDiamondAbiArgs(args);
      expect(result.isValid).to.be.true;
    });

    it("should handle empty strings in optional fields", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
        outputDir: "",
        network: "",
      };

      const result = validation.validateDiamondAbiArgs(args);
      // Empty string for outputDir should be invalid
      expect(result.isValid).to.be.false;
      expect(result.errors.some(e => e.field === "outputDir")).to.be.true;
      expect(result.errors.some(e => e.field === "network")).to.be.true;
    });

    it("should handle special characters in diamond name", () => {
      const invalidNames = ["Diamond-Name", "Diamond.Name", "Diamond Name", "Diamond@Name"];

      for (const name of invalidNames) {
        const args: DiamondAbiTaskArgs = { diamondName: name };
        const result = validation.validateDiamondAbiArgs(args);
        expect(result.isValid).to.be.false;
        expect(result.errors.some(e => e.field === "diamondName")).to.be.true;
      }
    });

    it("should accept valid diamond names with underscores and numbers", () => {
      const validNames = ["ExampleDiamond", "Test_Diamond", "Diamond123", "My_Diamond_V2"];

      for (const name of validNames) {
        const args: DiamondAbiTaskArgs = { diamondName: name };
        const result = validation.validateDiamondAbiArgs(args);
        expect(result.isValid).to.be.true;
      }
    });
  });
});