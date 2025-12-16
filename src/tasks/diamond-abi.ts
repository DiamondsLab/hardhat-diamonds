import chalk from "chalk";
import { existsSync, statSync } from "fs";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { generateDiamondAbi } from "../lib/DiamondAbiGenerator";
import { ProgressIndicator, TaskHelpers } from "./shared/TaskHelpers";
import { DiamondAbiTaskArgs } from "./shared/TaskOptions";
import { TaskValidation } from "./shared/TaskValidation";

// Import task function - using require to avoid TypeScript module resolution issues
const { task } = require("hardhat/config");

/**
 * Diamond ABI Generation Task
 *
 * This task generates a combined ABI for a Diamond Proxy contract by analyzing
 * all facets registered in the diamond configuration. The generated ABI includes
 * all functions, events, and errors from all facets with proper deduplication
 * and validation.
 */
task(
  "diamond:generate-abi",
  "Generate Diamond ABI from configuration or deployment data"
)
  .addParam(
    "diamondName",
    "Name of the diamond to generate ABI for",
    undefined,
    undefined,
    false
  )
  .addOptionalParam(
    "outputDir",
    "Output directory for generated ABI files",
    "./diamond-abi"
  )
  .addFlag("enableVerbose", "Enable verbose logging")
  .addFlag("validateSelectors", "Validate function selector uniqueness")
  .addFlag("includeSourceInfo", "Include compilation metadata in ABI")
  .addOptionalParam(
    "targetNetwork",
    "Target network (uses current network if not specified)"
  )
  .setAction(
    async (args: DiamondAbiTaskArgs, hre: HardhatRuntimeEnvironment) => {
      const timer = TaskHelpers.createTimer();
      timer.start();

      const helpers = new TaskHelpers(hre);
      const validation = new TaskValidation(hre);

      // Log task start
      helpers.logTaskStart("diamond:generate-abi", args);

      let progressIndicator: ProgressIndicator | null = null;

      try {
        // Normalize arguments with defaults
        const normalizedArgs = helpers.normalizeTaskArgs(args);

        if (normalizedArgs.verbose) {
          helpers.logVerbose("Normalized arguments", normalizedArgs);
        }

        // Validate task arguments
        if (normalizedArgs.verbose) {
          console.log(chalk.blue("🔍 Validating task arguments..."));
        }

        const argsValidation =
          validation.validateDiamondAbiArgs(normalizedArgs);
        if (!argsValidation.isValid) {
          TaskValidation.formatValidationResult(
            argsValidation,
            normalizedArgs.verbose
          );
          throw new Error("Task argument validation failed");
        }

        // Show warnings if any
        if (argsValidation.warnings.length > 0 && normalizedArgs.verbose) {
          TaskValidation.formatValidationResult(
            argsValidation,
            normalizedArgs.verbose
          );
        }

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

        // Show configuration warnings
        if (configValidation.warnings.length > 0 && normalizedArgs.verbose) {
          configValidation.warnings.forEach((warning) => {
            console.log(chalk.yellow(`⚠️  ${warning}`));
          });
        }

        // Validate system requirements
        if (normalizedArgs.verbose) {
          console.log(chalk.blue("🔍 Validating system requirements..."));
        }

        const systemValidation = validation.validateSystemRequirements();
        if (!systemValidation.isValid) {
          TaskValidation.formatValidationResult(
            systemValidation,
            normalizedArgs.verbose
          );
          throw new Error("System requirements validation failed");
        }

        // Show system warnings
        if (systemValidation.warnings.length > 0 && normalizedArgs.verbose) {
          systemValidation.warnings.forEach((warning) => {
            console.log(chalk.yellow(`⚠️  ${warning}`));
          });
        }

        // Start progress indicator for non-verbose mode
        if (!normalizedArgs.verbose) {
          progressIndicator = new ProgressIndicator(
            `Generating Diamond ABI for ${normalizedArgs.diamondName}...`
          );
          progressIndicator.start();
        }

        // Display network information
        const networkInfo = helpers.getNetworkInfo();
        if (normalizedArgs.verbose) {
          console.log(chalk.blue("🌐 Network information:"));
          console.log(chalk.cyan(`   Name: ${networkInfo.name}`));
          console.log(
            chalk.cyan(`   Chain ID: ${networkInfo.chainId || "unknown"}`)
          );
          console.log(
            chalk.cyan(`   Is Local: ${networkInfo.isLocal ? "yes" : "no"}`)
          );
          if (networkInfo.url) {
            console.log(chalk.cyan(`   URL: ${networkInfo.url}`));
          }
        }

        // Convert to generation options
        const options = helpers.convertToGenerationOptions(normalizedArgs);

        if (normalizedArgs.verbose) {
          helpers.logVerbose("Generation options", options);
        }

        // Generate the Diamond ABI
        if (normalizedArgs.verbose) {
          console.log(chalk.blue("🔧 Generating Diamond ABI..."));
        } else if (progressIndicator) {
          progressIndicator.updateMessage("Analyzing diamond configuration...");
        }

        const result = await generateDiamondAbi(hre, options);

        // Stop progress indicator
        if (progressIndicator) {
          progressIndicator.stop();
        }

        // Display results
        const duration = timer.stop();

        console.log(chalk.green(`✅ Diamond ABI generated successfully!`));
        console.log(chalk.blue(`   Output file: ${result.outputPath}`));
        console.log(chalk.blue(`   Functions: ${result.stats.totalFunctions}`));
        console.log(chalk.blue(`   Events: ${result.stats.totalEvents}`));
        console.log(chalk.blue(`   Errors: ${result.stats.totalErrors}`));
        console.log(chalk.blue(`   Facets: ${result.stats.facetCount}`));

        if (result.stats.duplicateSelectorsSkipped > 0) {
          console.log(
            chalk.yellow(
              `   Duplicates skipped: ${result.stats.duplicateSelectorsSkipped}`
            )
          );
        }

        // Show file size if available
        if (result.outputPath && existsSync(result.outputPath)) {
          try {
            const stats = statSync(result.outputPath);
            console.log(
              chalk.blue(
                `   File size: ${TaskHelpers.formatFileSize(stats.size)}`
              )
            );
          } catch {
            // Ignore file size errors
          }
        }

        // Display selector map in verbose mode
        if (
          normalizedArgs.verbose &&
          Object.keys(result.selectorMap).length > 0
        ) {
          console.log(chalk.blue("🔍 Function selector mapping:"));
          Object.entries(result.selectorMap).forEach(([selector, facet]) => {
            console.log(chalk.cyan(`   ${selector} → ${facet}`));
          });
        }

        // Display generation statistics
        helpers.logTaskCompletion("diamond:generate-abi", duration, true);

        if (normalizedArgs.verbose) {
          console.log(chalk.blue("📊 Generation statistics:"));
          console.log(
            chalk.cyan(
              `   Total processing time: ${TaskHelpers.formatDuration(duration)}`
            )
          );
          console.log(
            chalk.cyan(
              `   Average time per facet: ${TaskHelpers.formatDuration(Math.round(duration / Math.max(result.stats.facetCount, 1)))}`
            )
          );
        }

        // Success message with next steps
        console.log(chalk.green("\n🎉 Diamond ABI generation complete!"));
        console.log(chalk.cyan("💡 Next steps:"));
        console.log(
          chalk.cyan("   - Use the generated ABI in your dApp frontend")
        );
        console.log(
          chalk.cyan(
            "   - Generate TypeScript types with: npx hardhat diamond:generate-abi-typechain"
          )
        );
        console.log(
          chalk.cyan("   - Import the ABI artifact in your tests and scripts")
        );

        return result;
      } catch (error) {
        // Stop progress indicator on error
        if (progressIndicator) {
          progressIndicator.stop();
        }

        const duration = timer.stop();
        helpers.logTaskCompletion("diamond:generate-abi", duration, false);

        console.error(chalk.red("\n❌ Diamond ABI generation failed:"));

        if (error instanceof Error) {
          console.error(chalk.red(`   ${error.message}`));

          if (args.verbose && error.stack) {
            console.error(chalk.gray("\nStack trace:"));
            console.error(chalk.gray(error.stack));
          }
        } else {
          console.error(chalk.red(`   ${String(error)}`));
        }

        // Provide helpful suggestions
        console.log(chalk.cyan("\n💡 Troubleshooting tips:"));
        console.log(
          chalk.cyan(
            "   - Verify diamond configuration exists in hardhat.config.ts"
          )
        );
        console.log(
          chalk.cyan("   - Check that diamond name is spelled correctly")
        );
        console.log(
          chalk.cyan(
            "   - Ensure contract artifacts are compiled (run: npx hardhat compile)"
          )
        );
        console.log(
          chalk.cyan(
            "   - Run with --verbose flag for detailed error information"
          )
        );

        // Check for common issues
        const availableDiamonds = helpers.getAvailableDiamonds();
        if (availableDiamonds.length > 0) {
          console.log(
            chalk.cyan(
              `   - Available diamonds: ${availableDiamonds.join(", ")}`
            )
          );
        } else {
          console.log(
            chalk.cyan(
              "   - No diamond configurations found, add them to hardhat.config.ts"
            )
          );
        }

        throw error;
      }
    }
  );
