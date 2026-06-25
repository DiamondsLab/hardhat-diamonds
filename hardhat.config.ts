import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import path from "path";

// Load the plugin
import "./src/index";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
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
  mocha: {
    timeout: 60000,
  },

  diamonds: {
    paths: {
      MockDiamond: {
        deploymentsPath: "test/mocks/diamonds",
        contractsPath: "test/mocks/contracts",
      },
      // Add ExampleDiamond config for SPDX consolidation tests
      ExampleDiamond: {
        deploymentsPath: path.resolve(__dirname, "../../diamonds"),
        contractsPath: path.resolve(__dirname, "../../contracts/examplediamond"),
      },
    },
  },
};

export default config;
