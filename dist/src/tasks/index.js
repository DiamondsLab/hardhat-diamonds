"use strict";
/**
 * Task registration entry point for hardhat-diamonds plugin
 *
 * This module imports and registers all Hardhat tasks provided by the
 * hardhat-diamonds plugin. Tasks are automatically registered when this
 * module is imported by the main plugin entry point.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HARDHAT_DIAMONDS_TASKS = exports.generateTypeChainTypes = exports.HardhatTypeChainIntegration = exports.generateDiamondAbi = exports.HardhatDiamondAbiGenerator = exports.ProgressIndicator = exports.TaskHelpers = exports.TaskValidation = void 0;
exports.getDiamondTasks = getDiamondTasks;
exports.isDiamondTask = isDiamondTask;
exports.getDiamondTasksHelp = getDiamondTasksHelp;
// Import task definitions - this will register them with Hardhat
require("./diamond-abi");
require("./diamond-abi-typechain");
var TaskValidation_1 = require("./shared/TaskValidation");
Object.defineProperty(exports, "TaskValidation", { enumerable: true, get: function () { return TaskValidation_1.TaskValidation; } });
var TaskHelpers_1 = require("./shared/TaskHelpers");
Object.defineProperty(exports, "TaskHelpers", { enumerable: true, get: function () { return TaskHelpers_1.TaskHelpers; } });
Object.defineProperty(exports, "ProgressIndicator", { enumerable: true, get: function () { return TaskHelpers_1.ProgressIndicator; } });
// Re-export library functions for programmatic use
var DiamondAbiGenerator_1 = require("../lib/DiamondAbiGenerator");
Object.defineProperty(exports, "HardhatDiamondAbiGenerator", { enumerable: true, get: function () { return DiamondAbiGenerator_1.HardhatDiamondAbiGenerator; } });
Object.defineProperty(exports, "generateDiamondAbi", { enumerable: true, get: function () { return DiamondAbiGenerator_1.generateDiamondAbi; } });
var TypeChainIntegration_1 = require("../lib/TypeChainIntegration");
Object.defineProperty(exports, "HardhatTypeChainIntegration", { enumerable: true, get: function () { return TypeChainIntegration_1.HardhatTypeChainIntegration; } });
Object.defineProperty(exports, "generateTypeChainTypes", { enumerable: true, get: function () { return TypeChainIntegration_1.generateTypeChainTypes; } });
/**
 * Task metadata for discovery and documentation purposes
 */
exports.HARDHAT_DIAMONDS_TASKS = {
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
        optionalParams: ["outputDir", "typechainTarget", "typechainOutDir", "network"],
        flags: ["verbose", "validateSelectors", "includeSourceInfo"],
    },
};
/**
 * Get information about available diamond tasks
 *
 * @returns Array of task metadata objects
 */
function getDiamondTasks() {
    return Object.values(exports.HARDHAT_DIAMONDS_TASKS);
}
/**
 * Check if a task is a diamond task
 *
 * @param taskName - Name of the task to check
 * @returns Whether the task is a diamond task
 */
function isDiamondTask(taskName) {
    return taskName in exports.HARDHAT_DIAMONDS_TASKS;
}
/**
 * Get help information for diamond tasks
 *
 * @returns Formatted help text
 */
function getDiamondTasksHelp() {
    const tasks = getDiamondTasks();
    let help = "🔹 Diamond Proxy Tasks:\n\n";
    tasks.forEach(task => {
        help += `  ${task.name}\n`;
        help += `    ${task.description}\n`;
        if (task.requiredParams.length > 0) {
            help += `    Required: ${task.requiredParams.join(", ")}\n`;
        }
        if (task.optionalParams.length > 0) {
            help += `    Optional: ${task.optionalParams.join(", ")}\n`;
        }
        if (task.flags.length > 0) {
            help += `    Flags: ${task.flags.map(flag => `--${flag}`).join(", ")}\n`;
        }
        help += "\n";
    });
    help += "Examples:\n";
    help += "  npx hardhat diamond:generate-abi --diamond-name ExampleDiamond\n";
    help += "  npx hardhat diamond:generate-abi-typechain --diamond-name MyDiamond --verbose\n";
    help += "  npx hardhat diamond:generate-abi --diamond-name TestDiamond --output-dir ./custom-abi\n";
    return help;
}
