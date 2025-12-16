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
    diamonds?: DiamondsPathsConfig;
  }
}

// Export a dummy value to ensure the module is executed
export const _hardhatDiamondsTypesLoaded = true;

// Re-export task option types for external use
export type {
  DiamondAbiGenerationOptions,
  DiamondAbiGenerationResult, DiamondAbiTaskArgs,
  DiamondAbiTypechainTaskArgs, TypeChainGenerationOptions,
  TypeChainGenerationResult
} from "./tasks/shared/TaskOptions";

