/**
 * Utility exports for hardhat-diamonds
 * 
 * These exports are separated from the main index to avoid loading them
 * during Hardhat configuration initialization, which would cause circular
 * dependency issues (HH9 error).
 */

export { loadDiamondContract } from "./lib/LoadDiamondArtifact";
export { LocalDiamondDeployer, LocalDiamondDeployerConfig } from "./lib/LocalDiamondDeployer";
