/**
 * Library exports for programmatic use
 *
 * This module exports library functions and classes WITHOUT loading Hardhat tasks.
 * Use this when you want to use hardhat-diamonds functionality programmatically
 * without registering Hardhat tasks (which would cause circular dependencies).
 */

export {
  LocalDiamondDeployer,
  LocalDiamondDeployerConfig,
} from "./LocalDiamondDeployer";

export {
  generateDiamondAbi,
  HardhatDiamondAbiGenerator,
} from "./DiamondAbiGenerator";

export {
  generateTypeChainTypes,
  HardhatTypeChainIntegration,
} from "./TypeChainIntegration";

export { loadDiamondContract } from "./LoadDiamondArtifact";

export { DiamondFlattener } from "./DiamondFlattener";

export { OutputFormatter } from "./OutputFormatter";
export type { SummaryHeaderOptions } from "./OutputFormatter";

export { FlattenError, ErrorCodes } from "./FlattenError";
export type { ErrorCode } from "./FlattenError";

export { SourceResolver } from "./SourceResolver";
export type { LoadedSource, ImportInfo } from "./SourceResolver";

export { DependencyGraph } from "./DependencyGraph";
export type {
  DependencyNode,
  GraphStats,
  CircularDependency,
} from "./DependencyGraph";

export type { DeduplicatedSource } from "../tasks/shared/TaskOptions";
