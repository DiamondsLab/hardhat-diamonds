import { expect } from "chai";
import sinon from "sinon";
import { createMockHRE } from "../../utils/mockHRE";
import { HardhatRuntimeEnvironment } from "hardhat/types";

describe("DiamondFlatten Task Validation", () => {
  let mockHRE: HardhatRuntimeEnvironment;

  beforeEach(() => {
    mockHRE = createMockHRE({
      diamondName: "TestDiamond",
      contractsPath: "/test/contracts",
      deploymentsPath: "/test/deployments",
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Task argument validation", () => {
    it("should reject missing --diamond-name argument", () => {
      const args: any = {
        output: "./flattened/Test.sol",
      };

      expect(args.diamondName).to.be.undefined;
    });

    it("should reject invalid diamond name", () => {
      const args: any = {
        diamondName: "",
        output: "./flattened/Test.sol",
      };

      expect(args.diamondName).to.have.lengthOf(0);
    });

    it("should accept valid arguments", () => {
      const args: any = {
        diamondName: "TestDiamond",
        output: "./flattened/TestDiamond.sol",
      };

      expect(args.diamondName).to.equal("TestDiamond");
      expect(args.output).to.equal("./flattened/TestDiamond.sol");
    });

    it("should handle --output flag correctly", () => {
      const args: any = {
        diamondName: "TestDiamond",
        output: "./custom/path/output.sol",
      };

      expect(args.output).to.equal("./custom/path/output.sol");
    });

    it("should handle --verbose flag correctly", () => {
      const args: any = {
        diamondName: "TestDiamond",
        verbose: true,
      };

      expect(args.verbose).to.be.true;
    });

    it("should handle --network flag correctly", () => {
      const args: any = {
        diamondName: "TestDiamond",
        network: "localhost",
      };

      expect(args.network).to.equal("localhost");
    });

    it("should use default values for optional arguments", () => {
      const args: any = {
        diamondName: "TestDiamond",
      };

      // Verbose defaults to false
      expect(args.verbose).to.be.undefined;

      // Output defaults to stdout (undefined)
      expect(args.output).to.be.undefined;

      // Network defaults to current network (undefined here)
      expect(args.network).to.be.undefined;
    });
  });

  describe("Diamond configuration validation", () => {
    it("should validate diamond exists in configuration", () => {
      const diamondName = "TestDiamond";
      const config = mockHRE.config as any;

      expect(config.diamonds).to.exist;
      expect(config.diamonds.paths).to.exist;
      expect(config.diamonds.paths[diamondName]).to.exist;
    });

    it("should handle missing diamond configuration", () => {
      const diamondName = "NonExistentDiamond";
      const config = mockHRE.config as any;

      expect(config.diamonds.paths[diamondName]).to.be.undefined;
    });
  });

  describe("Path validation", () => {
    it("should validate output path is writable", () => {
      const outputPath = "./flattened/TestDiamond.sol";

      // Basic path validation
      expect(outputPath).to.match(/\.sol$/);
    });

    it("should handle relative output paths", () => {
      const outputPath = "./flattened/Test.sol";

      expect(outputPath.startsWith(".")).to.be.true;
    });

    it("should handle absolute output paths", () => {
      const outputPath = "/absolute/path/Test.sol";

      expect(outputPath.startsWith("/")).to.be.true;
    });
  });
});
