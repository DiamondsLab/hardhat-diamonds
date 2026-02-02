import chalk from "chalk";
import { mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { DiamondFlattenTaskArgs } from "./shared/TaskOptions";
import { TaskValidation } from "./shared/TaskValidation";
import { FlattenError } from "../lib/errors";
import { DiamondFlattener } from "../lib/DiamondFlattener";

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
  .addFlag("flattenVerbose", "Enable verbose logging")
  .addOptionalParam(
    "targetNetwork",
    "Target network for configuration (uses current network if not specified)"
  )
  .setAction(
    async (args: DiamondFlattenTaskArgs, hre: HardhatRuntimeEnvironment) => {
      const startTime = Date.now();
      const validation = new TaskValidation(hre);

      try {
        // 1. Validate arguments
        if (args.flattenVerbose) {
          console.log(chalk.blue("🔍 Validating arguments..."));
        }

        const validationResult = validation.validateDiamondFlattenArgs(args);
        if (!validationResult.isValid) {
          TaskValidation.formatValidationResult(
            validationResult,
            args.flattenVerbose
          );
          throw new FlattenError(
            "Validation failed",
            "VALIDATION_FAILED",
            "See validation errors above"
          );
        }

        // Display validation warnings in yellow
        validationResult.warnings.forEach((w) =>
          console.log(chalk.yellow(`⚠ ${w}`))
        );

        // 2. Create flattener instance
        const flattener = new DiamondFlattener(hre, {
          diamondName: args.diamondName,
          outputPath: args.output || `./flattened/${args.diamondName}.sol`,
          networkName: args.targetNetwork || hre.network.name,
          chainId: hre.network.config.chainId || 31337,
          verbose: args.flattenVerbose || false,
        });

        // 3. Execute flatten
        if (args.flattenVerbose) {
          console.log(chalk.blue(`\n🔨 Flattening ${args.diamondName}...`));
        }

        const result = await flattener.flatten();

        // 4. Output handling
        if (args.output) {
          // Write to file
          const outputPath = resolve(hre.config.paths.root, args.output);
          mkdirSync(dirname(outputPath), { recursive: true });
          writeFileSync(outputPath, result.flattenedSource, "utf-8");
          console.log(chalk.green(`\n✅ Written to: ${outputPath}`));
        } else {
          // Output to stdout
          console.log(result.flattenedSource);
        }

        // 5. Summary display (verbose mode OR file output)
        if (args.flattenVerbose || args.output) {
          const executionTime = Date.now() - startTime;
          console.log(chalk.blue("\n📊 Summary:"));
          console.log(chalk.gray(`   Facets:     ${result.stats.totalFacets}`));
          console.log(
            chalk.gray(`   Selectors:  ${result.stats.totalSelectors}`)
          );
          console.log(
            chalk.gray(`   Contracts:  ${result.stats.totalContracts}`)
          );
          console.log(chalk.gray(`   Lines:      ${result.stats.totalLines}`));
          console.log(
            chalk.gray(`   Deduped:    ${result.stats.deduplicatedContracts}`)
          );
          console.log(chalk.gray(`   Time:       ${executionTime}ms`));
        }

        // 6. Display warnings
        if (result.warnings.length > 0) {
          console.log(
            chalk.yellow(`\n⚠ ${result.warnings.length} warning(s):`)
          );
          result.warnings.forEach((w) =>
            console.log(chalk.yellow(`   - ${w}`))
          );
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`\n❌ Failed: ${errorMessage}`));

        if (args.flattenVerbose && error instanceof Error && error.stack) {
          console.error(chalk.gray(error.stack));
        }
        process.exit(1);
      }
    }
  );
