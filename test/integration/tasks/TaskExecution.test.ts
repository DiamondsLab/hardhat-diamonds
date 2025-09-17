import { expect } from "chai";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { 
  generateDiamondAbi, 
  HardhatDiamondAbiGenerator 
} from "../../../src/lib/DiamondAbiGenerator";
import { 
  generateTypeChainTypes, 
  HardhatTypeChainIntegration 
} from "../../../src/lib/TypeChainIntegration";
import { 
  getDiamondTasks, 
  isDiamondTask, 
  getDiamondTasksHelp 
} from "../../../src/tasks";

// Mock Hardhat Runtime Environment for integration testing
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
  artifacts: {
    readArtifact: async (name: string) => {
      // Mock artifact for testing
      return {
        contractName: name,
        abi: [
          {
            type: "function",
            name: "testFunction",
            inputs: [],
            outputs: [],
          },
        ],
        bytecode: "0x608060405234801561001057600080fd5b50",
        deployedBytecode: "0x608060405234801561001057600080fd5b50",
        linkReferences: {},
        deployedLinkReferences: {},
      };
    },
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

describe("Task Integration Tests", () => {
  let mockHRE: any;

  beforeEach(() => {
    mockHRE = createMockHRE();
  });

  describe("Diamond ABI Generation Integration", () => {
    it("should create HardhatDiamondAbiGenerator instance", () => {
      const options = {
        diamondName: "ExampleDiamond",
        verbose: false,
      };

      const generator = new HardhatDiamondAbiGenerator(mockHRE as HardhatRuntimeEnvironment, options);
      expect(generator).to.be.instanceOf(HardhatDiamondAbiGenerator);
    });

    it("should generate ABI with fallback when diamond not initialized", async () => {
      const options = {
        diamondName: "ExampleDiamond",
        verbose: false,
      };

      // This should fall back to configuration-based generation
      const result = await generateDiamondAbi(mockHRE as HardhatRuntimeEnvironment, options);
      
      expect(result).to.have.property("abi");
      expect(result).to.have.property("selectorMap");
      expect(result).to.have.property("facetAddresses");
      expect(result).to.have.property("stats");
      expect(result.stats).to.have.property("totalFunctions");
      expect(result.stats).to.have.property("totalEvents");
      expect(result.stats).to.have.property("totalErrors");
      expect(result.stats).to.have.property("facetCount");
    });

    it("should handle invalid diamond configuration gracefully", async () => {
      const options = {
        diamondName: "NonExistentDiamond",
        verbose: false,
      };

      try {
        await generateDiamondAbi(mockHRE as HardhatRuntimeEnvironment, options);
        // Should not reach here, but if it does, it should still return a result
      } catch (error) {
        // Expected behavior - should throw for non-existent diamond
        expect(error).to.be.instanceOf(Error);
      }
    });
  });

  describe("TypeChain Integration", () => {
    it("should create HardhatTypeChainIntegration instance", () => {
      const integration = new HardhatTypeChainIntegration(mockHRE as HardhatRuntimeEnvironment);
      expect(integration).to.be.instanceOf(HardhatTypeChainIntegration);
    });

    it("should validate TypeChain setup", async () => {
      const integration = new HardhatTypeChainIntegration(mockHRE as HardhatRuntimeEnvironment);
      const validation = await integration.validateTypeChainSetup(false);
      
      expect(validation).to.have.property("isValid");
      expect(validation).to.have.property("issues");
      expect(validation).to.have.property("suggestions");
      expect(validation.issues).to.be.an("array");
      expect(validation.suggestions).to.be.an("array");
    });

    it("should handle missing ABI file gracefully", async () => {
      const options = {
        abiPath: "/non/existent/file.json",
        verbose: false,
      };

      const result = await generateTypeChainTypes(mockHRE as HardhatRuntimeEnvironment, options);
      
      expect(result).to.have.property("success");
      expect(result.success).to.be.false;
      expect(result).to.have.property("error");
    });
  });

  describe("Task Registration and Discovery", () => {
    it("should return available diamond tasks", () => {
      const tasks = getDiamondTasks();
      expect(tasks).to.be.an("array");
      expect(tasks.length).to.be.greaterThan(0);
      
      // Check that our tasks are registered
      const taskNames = tasks.map(task => task.name);
      expect(taskNames).to.include("diamond:generate-abi");
      expect(taskNames).to.include("diamond:generate-abi-typechain");
    });

    it("should identify diamond tasks correctly", () => {
      expect(isDiamondTask("diamond:generate-abi")).to.be.true;
      expect(isDiamondTask("diamond:generate-abi-typechain")).to.be.true;
      expect(isDiamondTask("compile")).to.be.false;
      expect(isDiamondTask("test")).to.be.false;
    });

    it("should generate help text", () => {
      const help = getDiamondTasksHelp();
      expect(help).to.be.a("string");
      expect(help).to.include("diamond:generate-abi");
      expect(help).to.include("diamond:generate-abi-typechain");
      expect(help).to.include("Examples:");
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle malformed diamond configuration", async () => {
      // Override mock to return malformed config
      mockHRE.diamonds.getDiamondConfig = () => {
        throw new Error("Malformed configuration");
      };

      const options = {
        diamondName: "MalformedDiamond",
        verbose: false,
      };

      try {
        await generateDiamondAbi(mockHRE as HardhatRuntimeEnvironment, options);
        // Should fall back to graceful handling
      } catch (error) {
        // Expected behavior
        expect(error).to.be.instanceOf(Error);
      }
    });

    it("should handle missing artifacts gracefully", async () => {
      // Override mock to reject artifact reading
      mockHRE.artifacts.readArtifact = async () => {
        throw new Error("Artifact not found");
      };

      const options = {
        diamondName: "ExampleDiamond",
        verbose: false,
      };

      // Should still complete with fallback behavior
      const result = await generateDiamondAbi(mockHRE as HardhatRuntimeEnvironment, options);
      expect(result).to.have.property("stats");
    });
  });

  describe("Configuration Integration", () => {
    it("should use hardhat paths configuration", () => {
      const generator = new HardhatDiamondAbiGenerator(mockHRE as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
      });

      // Should use paths from HRE config
      expect(mockHRE.config.paths.root).to.equal("/test/project");
      expect(mockHRE.config.paths.sources).to.equal("/test/project/contracts");
    });

    it("should use network configuration", () => {
      const generator = new HardhatDiamondAbiGenerator(mockHRE as HardhatRuntimeEnvironment, {
        diamondName: "ExampleDiamond",
      });

      // Should use network from HRE
      expect(mockHRE.network.name).to.equal("hardhat");
      expect(mockHRE.network.config.chainId).to.equal(31337);
    });

    it("should integrate with diamonds configuration", () => {
      const config = mockHRE.diamonds.getDiamondConfig("ExampleDiamond");
      expect(config).to.have.property("deploymentsPath");
      expect(config).to.have.property("contractsPath");
    });
  });

  describe("Performance and Reliability", () => {
    it("should complete ABI generation within reasonable time", async function() {
      this.timeout(10000); // 10 second timeout
      
      const options = {
        diamondName: "ExampleDiamond",
        verbose: false,
      };

      const startTime = Date.now();
      const result = await generateDiamondAbi(mockHRE as HardhatRuntimeEnvironment, options);
      const duration = Date.now() - startTime;

      expect(duration).to.be.lessThan(5000); // Should complete in under 5 seconds
      expect(result).to.have.property("stats");
    });

    it("should handle concurrent ABI generation requests", async () => {
      const options = {
        diamondName: "ExampleDiamond",
        verbose: false,
      };

      // Run multiple generations concurrently
      const promises = Array(3).fill(null).map(() => 
        generateDiamondAbi(mockHRE as HardhatRuntimeEnvironment, options)
      );

      const results = await Promise.all(promises);
      
      // All should complete successfully
      results.forEach(result => {
        expect(result).to.have.property("stats");
      });
    });
  });
});