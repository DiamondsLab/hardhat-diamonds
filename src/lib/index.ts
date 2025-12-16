/**
 * Library exports for programmatic use
 * 
 * This module exports library functions and classes WITHOUT loading Hardhat tasks.
 * Use this when you want to use hardhat-diamonds functionality programmatically
 * without registering Hardhat tasks (which would cause circular dependencies).
 */

export {
    LocalDiamondDeployer,
    LocalDiamondDeployerConfig
} from "./LocalDiamondDeployer";

export {
    HardhatDiamondAbiGenerator,
    generateDiamondAbi
} from "./DiamondAbiGenerator";

export {
    HardhatTypeChainIntegration,
    generateTypeChainTypes
} from "./TypeChainIntegration";
