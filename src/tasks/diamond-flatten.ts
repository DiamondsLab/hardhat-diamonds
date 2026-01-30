import chalk from "chalk";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { TaskHelpers } from "./shared/TaskHelpers";
import { DiamondFlattenTaskArgs } from "./shared/TaskOptions";
import { TaskValidation } from "./shared/TaskValidation";

// Import task function - using require to avoid TypeScript module resolution issues
const { task } = require("hardhat/config");

/**
 * Diamond Flatten Task
 *
 * This task flattens a Diamond Proxy contract with all its facets into a single
 * Solidity file. The flattened output includes all contracts, libraries, and
 * interfaces required by the Diamond and its facets, with proper deduplication
 * and SPDX/pragma handling.
 *
 * The task also generates a function selector mapping table that shows which
 * facet each function belongs to, useful for auditing and analysis.
 */
task(
  "diamond:flatten",
  "Flatten Diamond contract with all facets into single file"
)
  .addParam(
    "diamondName",
    "Name of the diamond to flatten",
    undefined,
    undefined,
    false
  )
  .addOptionalParam(
    "output",
    "Output file path (defaults to stdout)",
    undefined
  )
  .addFlag("verbose", "Enable verbose logging")
  .addOptionalParam(
    "network",
    "Target network for configuration (uses current network if not specified)"
  )
  .setAction(
    async (args: DiamondFlattenTaskArgs, hre: HardhatRuntimeEnvironment) => {
      const timer = TaskHelpers.createTimer();
      timer.start();

      const helpers = new TaskHelpers(hre);
      const validation = new TaskValidation(hre);

      // Log task start
      helpers.logTaskStart("diamond:flatten", args);

      // Normalize arguments with defaults
      const normalizedArgs = helpers.normalizeTaskArgs(args);

      try {
        if (normalizedArgs.verbose) {
          helpers.logVerbose("Normalized arguments", normalizedArgs);
        }

        // Validate task arguments
        if (normalizedArgs.verbose) {
          console.log(chalk.blue("🔍 Validating task arguments..."));
        }

        // Placeholder validation - will be implemented in Task 4
        // const argsValidation =
        //   validation.validateDiamondFlattenArgs(normalizedArgs);
        // if (!argsValidation.isValid) {
        //   TaskValidation.formatValidationResult(
        //     argsValidation,
        //     normalizedArgs.verbose
        //   );
        //   throw new Error("Task argument validation failed");
        // }

        // Show warnings if any
        // if (argsValidation.warnings.length > 0 && normalizedArgs.verbose) {
        //   TaskValidation.formatValidationResult(
        //     argsValidation,
        //     normalizedArgs.verbose
        //   );
        // }

        // Validate diamond configuration
        if (normalizedArgs.verbose) {
          console.log(chalk.blue("🔍 Validating diamond configuration..."));
        }

        const configValidation = validation.validateDiamondConfiguration(
          normalizedArgs.diamondName
        );
        if (!configValidation.isValid) {
          TaskValidation.formatValidationResult(
            configValidation,
            normalizedArgs.verbose
          );
          throw new Error("Diamond configuration validation failed");
        }

        // Log success placeholder (actual implementation in future epics)
        timer.stop();
        const duration = timer.elapsed();
        helpers.logTaskCompletion("diamond:flatten", duration, true);

        console.log(
          chalk.yellow("⚠️  Note: Flatten implementation pending (Epic 2-6)")
        );

        // Return success indicator
        return {
          success: true,
          message: "Task registration verified",
          diamondName: normalizedArgs.diamondName,
        };
      } catch (error: any) {
        const duration = timer.stop();
        helpers.logTaskCompletion("diamond:flatten", duration, false);

        console.error(chalk.red("\n❌ Diamond flatten task failed:"));

        if (error instanceof Error) {
          console.error(chalk.red(`   ${error.message}`));

          if (normalizedArgs.verbose && error.stack) {
            console.error(chalk.gray("\nStack trace:"));
            console.error(chalk.gray(error.stack));
          }
        } else {
          console.error(chalk.red(`   ${String(error)}`));
        }

        throw error;
      }
    }
  );
