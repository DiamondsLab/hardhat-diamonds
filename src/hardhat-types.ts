// Hardhat type extensions for the diamonds plugin
import { DiamondsConfig } from "./DiamondsConfig";
import { DiamondsPathsConfig } from "./interfaces";

declare module "hardhat/types/config" {
  interface HardhatUserConfig {
    diamonds?: DiamondsPathsConfig;
  }

  interface HardhatConfig {
    diamonds?: DiamondsPathsConfig;
  }
}

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    diamonds?: DiamondsConfig;
  }
}
