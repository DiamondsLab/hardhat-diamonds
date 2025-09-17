import { DiamondsConfig } from "./DiamondsConfig";
import "hardhat/types/config";

export interface DiamondPathsConfig {
  deploymentsPath?: string;
  contractsPath?: string;
  [key: string]: any;
}

export interface DiamondsPathsConfig {
  paths: Record<string, DiamondPathsConfig>;
  [key: string]: any;
}

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    diamonds?: DiamondsPathsConfig;
  }

  export interface HardhatConfig {
    diamonds: DiamondsPathsConfig;
  }
}

// Extend HardhatRuntimeEnvironment to include diamondsConfig
declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    diamonds: DiamondsConfig;
  }
}

// Export a dummy value to ensure the module is executed
export const _hardhatDiamondsTypesLoaded = true;

// Re-export task option types for external use
export type {
  DiamondAbiTaskArgs,
  DiamondAbiTypechainTaskArgs,
  DiamondAbiGenerationOptions,
  DiamondAbiGenerationResult,
  TypeChainGenerationOptions,
  TypeChainGenerationResult,
} from "./tasks/shared/TaskOptions";
