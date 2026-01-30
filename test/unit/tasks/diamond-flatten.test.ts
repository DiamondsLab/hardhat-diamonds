import { expect } from "chai";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TaskValidation } from "../../../src/tasks/shared/TaskValidation";
import { DiamondFlattenTaskArgs } from "../../../src/tasks/shared/TaskOptions";
import { HARDHAT_DIAMONDS_TASKS } from "../../../src/tasks/index";

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
      localhost: {
        chainId: 31337,
        url: "http://127.0.0.1:8545",
      },
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
        "My-Diamond": {
          deploymentsPath: "/test/project/diamonds/My-Diamond",
        },
      },
    },
  } as any,
  targetNetwork: {
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
      if (name === "My-Diamond") {
        return {
          deploymentsPath: "/test/project/diamonds/My-Diamond",
        };
      }
      return null;
    },
  } as any,
});

describe("DiamondFlattenTaskArgs Validation", () => {
  let validation: TaskValidation;
  let mockHRE: any;

  beforeEach(() => {
    mockHRE = createMockHRE();
    validation = new TaskValidation(mockHRE as HardhatRuntimeEnvironment);
  });

  describe("validateDiamondFlattenArgs", () => {
    describe("diamond name validation", () => {
      it("should reject empty diamond name", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.false;
        expect(result.errors).to.have.lengthOf(1);
        expect(result.errors[0].field).to.equal("diamondName");
        expect(result.errors[0].message).to.include("required");
        expect(result.errors[0].suggestion).to.exist;
      });

      it("should reject diamond name with invalid characters", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "Invalid@Name!",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.false;
        expect(result.errors).to.have.lengthOf(1);
        expect(result.errors[0].field).to.equal("diamondName");
        expect(result.errors[0].message).to.include("letters, numbers");
      });

      it("should reject non-existent diamond name", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "NonExistentDiamond",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.false;
        expect(result.errors).to.have.lengthOf(1);
        expect(result.errors[0].field).to.equal("diamondName");
        expect(result.errors[0].message).to.include("not found");
      });

      it("should suggest available diamonds in error message", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "NonExistentDiamond",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.false;
        expect(result.errors[0].suggestion).to.include("ExampleDiamond");
        expect(result.errors[0].suggestion).to.include("TestDiamond");
      });

      it("should accept valid diamond name", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
        expect(result.errors).to.have.lengthOf(0);
      });

      it("should accept diamond name with hyphens and underscores", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "My-Diamond",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
      });
    });

    describe("output path validation", () => {
      it("should reject empty output path when provided", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          output: "",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.false;
        expect(result.errors).to.have.lengthOf(1);
        expect(result.errors[0].field).to.equal("output");
        expect(result.errors[0].message).to.include("non-empty string");
      });

      it("should warn for output path without .sol extension", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          output: "/tmp/output.txt",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
        expect(result.warnings).to.have.length.greaterThan(0);
        expect(result.warnings.some((w) => w.includes(".sol"))).to.be.true;
      });

      it("should warn when output file has no extension", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          output: "/tmp/outputfile",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
        expect(result.warnings).to.have.length.greaterThan(0);
        expect(result.warnings.some((w) => w.includes("no extension"))).to.be
          .true;
      });

      it("should accept valid output path with .sol extension", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          output: "/tmp/ExampleDiamond.sol",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
      });

      it("should warn about relative paths with ..", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          output: "../output/Diamond.sol",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
        expect(result.warnings).to.have.length.greaterThan(0);
        expect(result.warnings.some((w) => w.includes("dangerous"))).to.be.true;
      });

      it("should accept output path when undefined", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          output: undefined,
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
      });
    });

    describe("network validation", () => {
      it("should reject invalid network name", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          targetNetwork: "nonexistent",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.false;
        expect(result.errors).to.have.lengthOf(1);
        expect(result.errors[0].field).to.equal("targetNetwork");
        expect(result.errors[0].message).to.include("not found");
      });

      it("should suggest available networks in error message", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          targetNetwork: "nonexistent",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.false;
        expect(result.errors[0].suggestion).to.include("hardhat");
        expect(result.errors[0].suggestion).to.include("mainnet");
      });

      it("should accept valid network name", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          targetNetwork: "mainnet",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
      });

      it("should accept localhost network", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          targetNetwork: "localhost",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
      });

      it("should accept network when undefined", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          targetNetwork: undefined,
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
      });
    });

    describe("error message format", () => {
      it("should include field name in all errors", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.errors).to.have.length.greaterThan(0);
        result.errors.forEach((error) => {
          expect(error.field).to.exist;
          expect(error.field).to.be.a("string");
          expect(error.field.length).to.be.greaterThan(0);
        });
      });

      it("should include message in all errors", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.errors).to.have.length.greaterThan(0);
        result.errors.forEach((error) => {
          expect(error.message).to.exist;
          expect(error.message).to.be.a("string");
          expect(error.message.length).to.be.greaterThan(0);
        });
      });

      it("should include suggestion in all errors", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.errors).to.have.length.greaterThan(0);
        result.errors.forEach((error) => {
          expect(error.suggestion).to.exist;
          expect(error.suggestion).to.be.a("string");
          expect(error.suggestion?.length).to.be.greaterThan(0);
        });
      });

      it("should format errors consistently", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "Invalid@Name",
          output: "",
          targetNetwork: "badnetwork",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.false;

        // All errors should have the required structure
        result.errors.forEach((error) => {
          expect(error).to.have.property("field");
          expect(error).to.have.property("message");
          expect(error).to.have.property("suggestion");
        });
      });
    });

    describe("combined validation", () => {
      it("should validate all parameters together", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "ExampleDiamond",
          output: "/tmp/ExampleDiamond.sol",
          flattenVerbose: true,
          targetNetwork: "hardhat",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.true;
        expect(result.errors).to.have.lengthOf(0);
      });

      it("should collect multiple errors from different fields", () => {
        const args: DiamondFlattenTaskArgs = {
          diamondName: "",
          output: "",
          targetNetwork: "nonexistent",
        };

        const result = validation.validateDiamondFlattenArgs(args);
        expect(result.isValid).to.be.false;
        expect(result.errors.length).to.be.greaterThan(1);

        const fields = result.errors.map((e) => e.field);
        expect(fields).to.include("diamondName");
        expect(fields).to.include("output");
        expect(fields).to.include("targetNetwork");
      });
    });
  });
});

describe("Task Registration", () => {
  describe("HARDHAT_DIAMONDS_TASKS", () => {
    it('should register task with name "diamond:flatten"', () => {
      expect(HARDHAT_DIAMONDS_TASKS).to.have.property("diamond:flatten");
    });

    it("should have correct task metadata", () => {
      const task = HARDHAT_DIAMONDS_TASKS["diamond:flatten"];
      expect(task.name).to.equal("diamond:flatten");
      expect(task.description).to.be.a("string");
      expect(task.description.length).to.be.greaterThan(0);
    });

    it('should have "diamondName" as required parameter', () => {
      const task = HARDHAT_DIAMONDS_TASKS["diamond:flatten"];
      expect(task.requiredParams).to.be.an("array");
      expect(task.requiredParams).to.include("diamondName");
    });

    it('should have "output" as optional parameter', () => {
      const task = HARDHAT_DIAMONDS_TASKS["diamond:flatten"];
      expect(task.optionalParams).to.be.an("array");
      expect(task.optionalParams).to.include("output");
    });

    it('should have "flattenVerbose" as flag', () => {
      const task = HARDHAT_DIAMONDS_TASKS["diamond:flatten"];
      expect(task.flags).to.be.an("array");
      expect(task.flags).to.include("flattenVerbose");
    });

    it('should have "targetNetwork" as optional parameter', () => {
      const task = HARDHAT_DIAMONDS_TASKS["diamond:flatten"];
      expect(task.optionalParams).to.be.an("array");
      expect(task.optionalParams).to.include("targetNetwork");
    });

    it("should have correct category", () => {
      const task = HARDHAT_DIAMONDS_TASKS["diamond:flatten"];
      expect(task.category).to.equal("Diamond Proxy");
    });

    it("should have all parameters defined", () => {
      const task = HARDHAT_DIAMONDS_TASKS["diamond:flatten"];
      expect(task.requiredParams.length).to.equal(1);
      expect(task.optionalParams.length).to.equal(2);
      expect(task.flags.length).to.equal(1);
    });
  });
});
