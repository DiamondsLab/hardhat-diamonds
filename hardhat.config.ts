import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";


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
    },
  },
};

export default config;
