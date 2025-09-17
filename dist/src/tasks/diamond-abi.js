"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const DiamondAbiGenerator_1 = require("../lib/DiamondAbiGenerator");
const TaskValidation_1 = require("./shared/TaskValidation");
const TaskHelpers_1 = require("./shared/TaskHelpers");
/**
 * Diamond ABI Generation Task
 *
 * This task generates a combined ABI for a Diamond Proxy contract by analyzing
 * all facets registered in the diamond configuration. The generated ABI includes
 * all functions, events, and errors from all facets with proper deduplication
 * and validation.
 */
(0, config_1.task)("diamond:generate-abi", "Generate Diamond ABI from configuration or deployment data")
    .addParam("diamondName", "Name of the diamond to generate ABI for", undefined, undefined, false)
    .addOptionalParam("outputDir", "Output directory for generated ABI files", "./diamond-abi")
    .addFlag("enableVerbose", "Enable verbose logging")
    .addFlag("validateSelectors", "Validate function selector uniqueness")
    .addFlag("includeSourceInfo", "Include compilation metadata in ABI")
    .addOptionalParam("targetNetwork", "Target network (uses current network if not specified)")
    .setAction(async (args, hre) => {
    const timer = TaskHelpers_1.TaskHelpers.createTimer();
    timer.start();
    const helpers = new TaskHelpers_1.TaskHelpers(hre);
    const validation = new TaskValidation_1.TaskValidation(hre);
    // Log task start
    helpers.logTaskStart("diamond:generate-abi", args);
    let progressIndicator = null;
    try {
        // Normalize arguments with defaults
        const normalizedArgs = helpers.normalizeTaskArgs(args);
        if (normalizedArgs.verbose) {
            helpers.logVerbose("Normalized arguments", normalizedArgs);
        }
        // Validate task arguments
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('🔍 Validating task arguments...'));
        }
        const argsValidation = validation.validateDiamondAbiArgs(normalizedArgs);
        if (!argsValidation.isValid) {
            TaskValidation_1.TaskValidation.formatValidationResult(argsValidation, normalizedArgs.verbose);
            throw new Error('Task argument validation failed');
        }
        // Show warnings if any
        if (argsValidation.warnings.length > 0 && normalizedArgs.verbose) {
            TaskValidation_1.TaskValidation.formatValidationResult(argsValidation, normalizedArgs.verbose);
        }
        // Validate diamond configuration
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('🔍 Validating diamond configuration...'));
        }
        const configValidation = validation.validateDiamondConfiguration(normalizedArgs.diamondName);
        if (!configValidation.isValid) {
            TaskValidation_1.TaskValidation.formatValidationResult(configValidation, normalizedArgs.verbose);
            throw new Error('Diamond configuration validation failed');
        }
        // Show configuration warnings
        if (configValidation.warnings.length > 0 && normalizedArgs.verbose) {
            configValidation.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`⚠️  ${warning}`));
            });
        }
        // Validate system requirements
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('🔍 Validating system requirements...'));
        }
        const systemValidation = validation.validateSystemRequirements();
        if (!systemValidation.isValid) {
            TaskValidation_1.TaskValidation.formatValidationResult(systemValidation, normalizedArgs.verbose);
            throw new Error('System requirements validation failed');
        }
        // Show system warnings
        if (systemValidation.warnings.length > 0 && normalizedArgs.verbose) {
            systemValidation.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`⚠️  ${warning}`));
            });
        }
        // Start progress indicator for non-verbose mode
        if (!normalizedArgs.verbose) {
            progressIndicator = new TaskHelpers_1.ProgressIndicator(`Generating Diamond ABI for ${normalizedArgs.diamondName}...`);
            progressIndicator.start();
        }
        // Display network information
        const networkInfo = helpers.getNetworkInfo();
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('🌐 Network information:'));
            console.log(chalk_1.default.cyan(`   Name: ${networkInfo.name}`));
            console.log(chalk_1.default.cyan(`   Chain ID: ${networkInfo.chainId || 'unknown'}`));
            console.log(chalk_1.default.cyan(`   Is Local: ${networkInfo.isLocal ? 'yes' : 'no'}`));
            if (networkInfo.url) {
                console.log(chalk_1.default.cyan(`   URL: ${networkInfo.url}`));
            }
        }
        // Convert to generation options
        const options = helpers.convertToGenerationOptions(normalizedArgs);
        if (normalizedArgs.verbose) {
            helpers.logVerbose("Generation options", options);
        }
        // Generate the Diamond ABI
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('🔧 Generating Diamond ABI...'));
        }
        else if (progressIndicator) {
            progressIndicator.updateMessage('Analyzing diamond configuration...');
        }
        const result = await (0, DiamondAbiGenerator_1.generateDiamondAbi)(hre, options);
        // Stop progress indicator
        if (progressIndicator) {
            progressIndicator.stop();
        }
        // Display results
        const duration = timer.stop();
        console.log(chalk_1.default.green(`✅ Diamond ABI generated successfully!`));
        console.log(chalk_1.default.blue(`   Output file: ${result.outputPath}`));
        console.log(chalk_1.default.blue(`   Functions: ${result.stats.totalFunctions}`));
        console.log(chalk_1.default.blue(`   Events: ${result.stats.totalEvents}`));
        console.log(chalk_1.default.blue(`   Errors: ${result.stats.totalErrors}`));
        console.log(chalk_1.default.blue(`   Facets: ${result.stats.facetCount}`));
        if (result.stats.duplicateSelectorsSkipped > 0) {
            console.log(chalk_1.default.yellow(`   Duplicates skipped: ${result.stats.duplicateSelectorsSkipped}`));
        }
        // Show file size if available
        if (result.outputPath && (0, fs_1.existsSync)(result.outputPath)) {
            try {
                const stats = (0, fs_1.statSync)(result.outputPath);
                console.log(chalk_1.default.blue(`   File size: ${TaskHelpers_1.TaskHelpers.formatFileSize(stats.size)}`));
            }
            catch {
                // Ignore file size errors
            }
        }
        // Display selector map in verbose mode
        if (normalizedArgs.verbose && Object.keys(result.selectorMap).length > 0) {
            console.log(chalk_1.default.blue('🔍 Function selector mapping:'));
            Object.entries(result.selectorMap).forEach(([selector, facet]) => {
                console.log(chalk_1.default.cyan(`   ${selector} → ${facet}`));
            });
        }
        // Display generation statistics
        helpers.logTaskCompletion("diamond:generate-abi", duration, true);
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('📊 Generation statistics:'));
            console.log(chalk_1.default.cyan(`   Total processing time: ${TaskHelpers_1.TaskHelpers.formatDuration(duration)}`));
            console.log(chalk_1.default.cyan(`   Average time per facet: ${TaskHelpers_1.TaskHelpers.formatDuration(Math.round(duration / Math.max(result.stats.facetCount, 1)))}`));
        }
        // Success message with next steps
        console.log(chalk_1.default.green('\n🎉 Diamond ABI generation complete!'));
        console.log(chalk_1.default.cyan('💡 Next steps:'));
        console.log(chalk_1.default.cyan('   - Use the generated ABI in your dApp frontend'));
        console.log(chalk_1.default.cyan('   - Generate TypeScript types with: npx hardhat diamond:generate-abi-typechain'));
        console.log(chalk_1.default.cyan('   - Import the ABI artifact in your tests and scripts'));
        return result;
    }
    catch (error) {
        // Stop progress indicator on error
        if (progressIndicator) {
            progressIndicator.stop();
        }
        const duration = timer.stop();
        helpers.logTaskCompletion("diamond:generate-abi", duration, false);
        console.error(chalk_1.default.red('\n❌ Diamond ABI generation failed:'));
        if (error instanceof Error) {
            console.error(chalk_1.default.red(`   ${error.message}`));
            if (args.verbose && error.stack) {
                console.error(chalk_1.default.gray('\nStack trace:'));
                console.error(chalk_1.default.gray(error.stack));
            }
        }
        else {
            console.error(chalk_1.default.red(`   ${String(error)}`));
        }
        // Provide helpful suggestions
        console.log(chalk_1.default.cyan('\n💡 Troubleshooting tips:'));
        console.log(chalk_1.default.cyan('   - Verify diamond configuration exists in hardhat.config.ts'));
        console.log(chalk_1.default.cyan('   - Check that diamond name is spelled correctly'));
        console.log(chalk_1.default.cyan('   - Ensure contract artifacts are compiled (run: npx hardhat compile)'));
        console.log(chalk_1.default.cyan('   - Run with --verbose flag for detailed error information'));
        // Check for common issues
        const availableDiamonds = helpers.getAvailableDiamonds();
        if (availableDiamonds.length > 0) {
            console.log(chalk_1.default.cyan(`   - Available diamonds: ${availableDiamonds.join(', ')}`));
        }
        else {
            console.log(chalk_1.default.cyan('   - No diamond configurations found, add them to hardhat.config.ts'));
        }
        throw error;
    }
});
