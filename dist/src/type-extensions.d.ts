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
    interface HardhatUserConfig {
        diamonds?: DiamondsPathsConfig;
    }
    interface HardhatConfig {
        diamonds: DiamondsPathsConfig;
    }
}
declare module "hardhat/types/runtime" {
    interface HardhatRuntimeEnvironment {
        diamonds: DiamondsConfig;
    }
}
export declare const _hardhatDiamondsTypesLoaded = true;
