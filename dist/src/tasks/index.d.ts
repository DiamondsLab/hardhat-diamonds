/**
 * Task registration entry point for hardhat-diamonds plugin
 *
 * This module imports and registers all Hardhat tasks provided by the
 * hardhat-diamonds plugin. Tasks are automatically registered when this
 * module is imported by the main plugin entry point.
 */
import "./diamond-abi";
import "./diamond-abi-typechain";
export type { DiamondAbiTaskArgs, DiamondAbiTypechainTaskArgs, DiamondAbiGenerationOptions, DiamondAbiGenerationResult, TypeChainGenerationOptions, TypeChainGenerationResult, } from "./shared/TaskOptions";
export { TaskValidation } from "./shared/TaskValidation";
export { TaskHelpers, ProgressIndicator } from "./shared/TaskHelpers";
export { HardhatDiamondAbiGenerator, generateDiamondAbi, } from "../lib/DiamondAbiGenerator";
export { HardhatTypeChainIntegration, generateTypeChainTypes, } from "../lib/TypeChainIntegration";
/**
 * Task metadata for discovery and documentation purposes
 */
export declare const HARDHAT_DIAMONDS_TASKS: {
    readonly "diamond:generate-abi": {
        readonly name: "diamond:generate-abi";
        readonly description: "Generate Diamond ABI from configuration or deployment data";
        readonly category: "Diamond Proxy";
        readonly requiredParams: readonly ["diamondName"];
        readonly optionalParams: readonly ["outputDir", "network"];
        readonly flags: readonly ["verbose", "validateSelectors", "includeSourceInfo"];
    };
    readonly "diamond:generate-abi-typechain": {
        readonly name: "diamond:generate-abi-typechain";
        readonly description: "Generate Diamond ABI and TypeScript types using TypeChain";
        readonly category: "Diamond Proxy";
        readonly requiredParams: readonly ["diamondName"];
        readonly optionalParams: readonly ["outputDir", "typechainTarget", "typechainOutDir", "network"];
        readonly flags: readonly ["verbose", "validateSelectors", "includeSourceInfo"];
    };
};
/**
 * Get information about available diamond tasks
 *
 * @returns Array of task metadata objects
 */
export declare function getDiamondTasks(): ({
    readonly name: "diamond:generate-abi";
    readonly description: "Generate Diamond ABI from configuration or deployment data";
    readonly category: "Diamond Proxy";
    readonly requiredParams: readonly ["diamondName"];
    readonly optionalParams: readonly ["outputDir", "network"];
    readonly flags: readonly ["verbose", "validateSelectors", "includeSourceInfo"];
} | {
    readonly name: "diamond:generate-abi-typechain";
    readonly description: "Generate Diamond ABI and TypeScript types using TypeChain";
    readonly category: "Diamond Proxy";
    readonly requiredParams: readonly ["diamondName"];
    readonly optionalParams: readonly ["outputDir", "typechainTarget", "typechainOutDir", "network"];
    readonly flags: readonly ["verbose", "validateSelectors", "includeSourceInfo"];
})[];
/**
 * Check if a task is a diamond task
 *
 * @param taskName - Name of the task to check
 * @returns Whether the task is a diamond task
 */
export declare function isDiamondTask(taskName: string): boolean;
/**
 * Get help information for diamond tasks
 *
 * @returns Formatted help text
 */
export declare function getDiamondTasksHelp(): string;
