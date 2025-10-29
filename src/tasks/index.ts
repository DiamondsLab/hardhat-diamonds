/**
 * Task registration entry point for hardhat-diamonds plugin
 *
 * This module imports and registers all Hardhat tasks provided by the
 * hardhat-diamonds plugin. Tasks are automatically registered when this
 * module is imported by the main plugin entry point.
 */

// Import task definitions - this will register them with Hardhat
import "./diamond-abi";
import "./diamond-abi-typechain";

// Re-export task-related types and utilities for external use
export type {
  DiamondAbiTaskArgs,
  DiamondAbiTypechainTaskArgs,
  DiamondAbiGenerationOptions,
  DiamondAbiGenerationResult,
  TypeChainGenerationOptions,
  TypeChainGenerationResult,
} from "./shared/TaskOptions";

export { TaskValidation } from "./shared/TaskValidation";
export { TaskHelpers, ProgressIndicator } from "./shared/TaskHelpers";

// Re-export library functions for programmatic use
export {
  HardhatDiamondAbiGenerator,
  generateDiamondAbi,
} from "../lib/DiamondAbiGenerator";

export {
  HardhatTypeChainIntegration,
  generateTypeChainTypes,
} from "../lib/TypeChainIntegration";

/**
 * Task metadata for discovery and documentation purposes
 */
export const HARDHAT_DIAMONDS_TASKS = {
  "diamond:generate-abi": {
    name: "diamond:generate-abi",
    description: "Generate Diamond ABI from configuration or deployment data",
    category: "Diamond Proxy",
    requiredParams: ["diamondName"],
    optionalParams: ["outputDir", "network"],
    flags: ["verbose", "validateSelectors", "includeSourceInfo"],
  },
  "diamond:generate-abi-typechain": {
    name: "diamond:generate-abi-typechain",
    description: "Generate Diamond ABI and TypeScript types using TypeChain",
    category: "Diamond Proxy",
    requiredParams: ["diamondName"],
    optionalParams: [
      "outputDir",
      "typechainTarget",
      "typechainOutDir",
      "network",
    ],
    flags: ["verbose", "validateSelectors", "includeSourceInfo"],
  },
} as const;

/**
 * Get information about available diamond tasks
 *
 * @returns Array of task metadata objects
 */
export function getDiamondTasks() {
  return Object.values(HARDHAT_DIAMONDS_TASKS);
}

/**
 * Check if a task is a diamond task
 *
 * @param taskName - Name of the task to check
 * @returns Whether the task is a diamond task
 */
export function isDiamondTask(taskName: string): boolean {
  return taskName in HARDHAT_DIAMONDS_TASKS;
}

/**
 * Get help information for diamond tasks
 *
 * @returns Formatted help text
 */
export function getDiamondTasksHelp(): string {
  const tasks = getDiamondTasks();

  let help = "🔹 Diamond Proxy Tasks:\n\n";

  tasks.forEach((task) => {
    help += `  ${task.name}\n`;
    help += `    ${task.description}\n`;

    if (task.requiredParams.length > 0) {
      help += `    Required: ${task.requiredParams.join(", ")}\n`;
    }

    if (task.optionalParams.length > 0) {
      help += `    Optional: ${task.optionalParams.join(", ")}\n`;
    }

    if (task.flags.length > 0) {
      help += `    Flags: ${task.flags.map((flag) => `--${flag}`).join(", ")}\n`;
    }

    help += "\n";
  });

  help += "Examples:\n";
  help += "  npx hardhat diamond:generate-abi --diamond-name ExampleDiamond\n";
  help +=
    "  npx hardhat diamond:generate-abi-typechain --diamond-name MyDiamond --verbose\n";
  help +=
    "  npx hardhat diamond:generate-abi --diamond-name TestDiamond --output-dir ./custom-abi\n";

  return help;
}
