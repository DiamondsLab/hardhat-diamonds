import { expect } from "chai";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  TaskHelpers,
  ProgressIndicator,
} from "../../../src/tasks/shared/TaskHelpers";
import {
  DiamondAbiTaskArgs,
  DiamondAbiTypechainTaskArgs,
} from "../../../src/tasks/shared/TaskOptions";

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
  },
  network: {
    name: "hardhat",
    config: { chainId: 31337 },
  },
  diamonds: {
    getDiamondConfig: (name: string) => {
      if (name === "ExampleDiamond") {
        return {
          deploymentsPath: "/test/project/diamonds/ExampleDiamond",
          contractsPath: "/test/project/contracts/examplediamond",
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
      },
    },
  },
});

describe("TaskHelpers", () => {
  let helpers: TaskHelpers;
  let mockHRE: any;

  beforeEach(() => {
    mockHRE = createMockHRE();
    helpers = new TaskHelpers(mockHRE as HardhatRuntimeEnvironment);
  });

  describe("convertToGenerationOptions", () => {
    it("should convert basic task args to generation options", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
        enableVerbose: true,
      };

      const options = helpers.convertToGenerationOptions(args);

      expect(options.diamondName).to.equal("ExampleDiamond");
      expect(options.networkName).to.equal("hardhat");
      expect(options.chainId).to.equal(31337);
      expect(options.verbose).to.be.true;
      expect(options.includeSourceInfo).to.be.true;
      expect(options.validateSelectors).to.be.true;
    });

    it("should handle custom output directory", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
        outputDir: "/custom/output",
      };

      const options = helpers.convertToGenerationOptions(args);
      expect(options.outputDir).to.equal("/custom/output");
    });

    it("should handle custom network", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
        targetNetwork: "mainnet",
      };

      const options = helpers.convertToGenerationOptions(args);
      expect(options.networkName).to.equal("mainnet");
    });
  });

  describe("getDiamondConfig", () => {
    it("should get existing diamond config", () => {
      const config = helpers.getDiamondConfig("ExampleDiamond");
      expect(config).to.not.be.null;
      expect(config.deploymentsPath).to.equal(
        "/test/project/diamonds/ExampleDiamond"
      );
    });

    it("should return null for non-existing diamond", () => {
      const config = helpers.getDiamondConfig("NonExistentDiamond");
      expect(config).to.be.null;
    });
  });

  describe("getAvailableDiamonds", () => {
    it("should return list of available diamonds", () => {
      const diamonds = helpers.getAvailableDiamonds();
      expect(diamonds).to.be.an("array");
      expect(diamonds).to.include("ExampleDiamond");
    });
  });

  describe("diamondConfigExists", () => {
    it("should return true for existing diamond", () => {
      const exists = helpers.diamondConfigExists("ExampleDiamond");
      expect(exists).to.be.true;
    });

    it("should return false for non-existing diamond", () => {
      const exists = helpers.diamondConfigExists("NonExistentDiamond");
      expect(exists).to.be.false;
    });
  });

  describe("getNetworkInfo", () => {
    it("should return network information", () => {
      const networkInfo = helpers.getNetworkInfo();
      expect(networkInfo.name).to.equal("hardhat");
      expect(networkInfo.chainId).to.equal(31337);
      expect(networkInfo.isLocal).to.be.true;
    });
  });

  describe("normalizeTaskArgs", () => {
    it("should normalize basic task args with defaults", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
      };

      const normalized = helpers.normalizeTaskArgs(args);

      expect(normalized.diamondName).to.equal("ExampleDiamond");
      expect(normalized.outputDir).to.include("diamond-abi");
      expect(normalized.network).to.equal("hardhat");
      expect(normalized.verbose).to.be.false;
      expect(normalized.validateSelectors).to.be.true;
      expect(normalized.includeSourceInfo).to.be.true;
    });

    it("should preserve existing values", () => {
      const args: DiamondAbiTaskArgs = {
        diamondName: "ExampleDiamond",
        outputDir: "/custom/output",
        enableVerbose: true,
        validateSelectors: false,
        includeSourceInfo: false,
        targetNetwork: "mainnet",
      };

      const normalized = helpers.normalizeTaskArgs(args);

      expect(normalized.outputDir).to.equal("/custom/output");
      expect(normalized.enableVerbose).to.be.true;
      expect(normalized.validateSelectors).to.be.false;
      expect(normalized.includeSourceInfo).to.be.false;
      expect((normalized as any).network).to.equal("mainnet");
    });

    it("should normalize TypeChain task args", () => {
      const args: DiamondAbiTypechainTaskArgs = {
        diamondName: "ExampleDiamond",
        typechainTarget: undefined,
        typechainOutDir: undefined,
      };

      const normalized = helpers.normalizeTaskArgs(
        args
      ) as DiamondAbiTypechainTaskArgs;

      expect(normalized.typechainTarget).to.equal("ethers-v6");
      expect(normalized.typechainOutDir).to.include("diamond-typechain-types");
    });
  });

  describe("getProjectPaths", () => {
    it("should return all project paths", () => {
      const paths = helpers.getProjectPaths();

      expect(paths.root).to.equal("/test/project");
      expect(paths.sources).to.equal("/test/project/contracts");
      expect(paths.artifacts).to.equal("/test/project/artifacts");
      expect(paths.cache).to.equal("/test/project/cache");
      expect(paths.tests).to.equal("/test/project/test");
      expect(paths.diamonds).to.include("diamonds");
      expect(paths.diamondAbi).to.include("diamond-abi");
      expect(paths.typechainTypes).to.include("diamond-typechain-types");
    });
  });

  describe("static utility methods", () => {
    describe("formatFileSize", () => {
      it("should format bytes correctly", () => {
        expect(TaskHelpers.formatFileSize(0)).to.equal("0 B");
        expect(TaskHelpers.formatFileSize(1024)).to.equal("1 KB");
        expect(TaskHelpers.formatFileSize(1048576)).to.equal("1 MB");
        expect(TaskHelpers.formatFileSize(1536)).to.equal("1.5 KB");
      });
    });

    describe("formatDuration", () => {
      it("should format milliseconds correctly", () => {
        expect(TaskHelpers.formatDuration(500)).to.equal("500ms");
        expect(TaskHelpers.formatDuration(1000)).to.equal("1s");
        expect(TaskHelpers.formatDuration(1500)).to.equal("1.5s");
        expect(TaskHelpers.formatDuration(60000)).to.equal("1m 0s");
        expect(TaskHelpers.formatDuration(65000)).to.equal("1m 5s");
      });
    });

    describe("createTimer", () => {
      it("should create a working timer", (done) => {
        const timer = TaskHelpers.createTimer();
        timer.start();

        setTimeout(() => {
          const elapsed = timer.stop();
          expect(elapsed).to.be.a("number");
          expect(elapsed).to.be.greaterThan(0);
          expect(elapsed).to.be.lessThan(200); // Should be around 50ms
          done();
        }, 50);
      });

      it("should track elapsed time", (done) => {
        const timer = TaskHelpers.createTimer();
        timer.start();

        setTimeout(() => {
          const elapsed1 = timer.elapsed();
          setTimeout(() => {
            const elapsed2 = timer.elapsed();
            expect(elapsed2).to.be.greaterThan(elapsed1);
            done();
          }, 10);
        }, 10);
      });
    });
  });
});

describe("ProgressIndicator", () => {
  let progressIndicator: ProgressIndicator;

  beforeEach(() => {
    progressIndicator = new ProgressIndicator("Test message");
  });

  afterEach(() => {
    // Make sure to stop any running indicators
    progressIndicator.stop();
  });

  it("should create with message", () => {
    expect(progressIndicator).to.be.instanceOf(ProgressIndicator);
  });

  it("should start and stop without errors", () => {
    expect(() => {
      progressIndicator.start();
      progressIndicator.stop();
    }).to.not.throw();
  });

  it("should update message", () => {
    expect(() => {
      progressIndicator.updateMessage("New message");
    }).to.not.throw();
  });

  it("should handle multiple start/stop calls", () => {
    expect(() => {
      progressIndicator.start();
      progressIndicator.start(); // Should not cause issues
      progressIndicator.stop();
      progressIndicator.stop(); // Should not cause issues
    }).to.not.throw();
  });

  it("should stop with final message", () => {
    expect(() => {
      progressIndicator.start();
      progressIndicator.stop("Final message");
    }).to.not.throw();
  });
});
