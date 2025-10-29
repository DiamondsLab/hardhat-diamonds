import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DiamondsPathsConfig } from "../../src/type-extensions";
import { DiamondsConfig } from "../../src/DiamondsConfig";

/**
 * Test setup utilities for hardhat-diamonds tests
 */
export class TestSetup {
  /**
   * Creates a mock HardhatRuntimeEnvironment for testing
   */
  static createMockHRE(
    diamondsConfig: DiamondsPathsConfig = { paths: {} }
  ): HardhatRuntimeEnvironment {
    return {
      config: {
        diamonds: diamondsConfig,
        solidity: {
          version: "0.8.17",
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          },
        },
        networks: {
          hardhat: {
            chainId: 31337,
          },
        },
        paths: {
          sources: "./test/mocks/contracts",
          tests: "./test",
          cache: "./cache",
          artifacts: "./artifacts",
        },
      },
      userConfig: {},
      hardhatArguments: {},
      tasks: {},
      scopes: {},
      run: async () => {},
      ethers: {} as any,
      waffle: {} as any,
      network: {
        name: "hardhat",
        config: {},
        provider: {} as any,
      },
      artifacts: {} as any,
    } as unknown as HardhatRuntimeEnvironment;
  }

  /**
   * Creates a test DiamondsConfig instance
   */
  static createDiamondsConfig(
    diamondsConfig: DiamondsPathsConfig = { paths: {} }
  ): DiamondsConfig {
    const hre = this.createMockHRE(diamondsConfig);
    return new DiamondsConfig(hre);
  }

  /**
   * Sets up common test environment
   */
  static setupTestEnvironment() {
    // Reset any global state if needed
    process.env.NODE_ENV = "test";
  }

  /**
   * Cleanup after tests
   */
  static cleanup() {
    // Cleanup any test artifacts
  }
}
