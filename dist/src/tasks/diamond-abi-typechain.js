"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const DiamondAbiGenerator_1 = require("../lib/DiamondAbiGenerator");
const TypeChainIntegration_1 = require("../lib/TypeChainIntegration");
const TaskValidation_1 = require("./shared/TaskValidation");
const TaskHelpers_1 = require("./shared/TaskHelpers");
/**
 * Diamond ABI Generation with TypeChain Task
 *
 * This task extends the basic Diamond ABI generation to also generate TypeScript
 * type definitions using TypeChain. It first generates the Diamond ABI and then
 * automatically creates TypeScript types for use in frontend applications and tests.
 */
(0, config_1.task)("diamond:generate-abi-typechain", "Generate Diamond ABI and TypeScript types using TypeChain")
    .addParam("diamondName", "Name of the diamond to generate ABI and types for", undefined, undefined, false)
    .addOptionalParam("outputDir", "Output directory for generated ABI files", "./diamond-abi")
    .addOptionalParam("typechainTarget", "TypeChain target (ethers-v6, ethers-v5, web3-v1, truffle-v5)", "ethers-v6")
    .addOptionalParam("typechainOutDir", "TypeChain output directory", "./diamond-typechain-types")
    .addFlag("enableVerbose", "Enable verbose logging")
    .addFlag("validateSelectors", "Validate function selector uniqueness")
    .addFlag("includeSourceInfo", "Include compilation metadata in ABI")
    .addOptionalParam("targetNetwork", "Target network (uses current network if not specified)")
    .setAction(async (args, hre) => {
    const timer = TaskHelpers_1.TaskHelpers.createTimer();
    timer.start();
    const helpers = new TaskHelpers_1.TaskHelpers(hre);
    const validation = new TaskValidation_1.TaskValidation(hre);
    const typechainIntegration = new TypeChainIntegration_1.HardhatTypeChainIntegration(hre);
    // Log task start
    helpers.logTaskStart("diamond:generate-abi-typechain", args);
    let progressIndicator = null;
    try {
        // Normalize arguments with defaults
        const normalizedArgs = helpers.normalizeTaskArgs(args);
        if (normalizedArgs.verbose) {
            helpers.logVerbose("Normalized arguments", normalizedArgs);
        }
        // Validate task arguments (including TypeChain-specific ones)
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('🔍 Validating task arguments...'));
        }
        const argsValidation = validation.validateDiamondAbiTypechainArgs(normalizedArgs);
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
        // Validate system requirements (including TypeChain)
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('🔍 Validating system requirements...'));
        }
        const systemValidation = validation.validateSystemRequirements(true);
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
        // Validate TypeChain setup
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('🔍 Validating TypeChain setup...'));
        }
        const typechainValidation = await typechainIntegration.validateTypeChainSetup(normalizedArgs.verbose);
        if (!typechainValidation.isValid) {
            console.error(chalk_1.default.red('❌ TypeChain setup validation failed:'));
            typechainValidation.issues.forEach(issue => {
                console.error(chalk_1.default.red(`   - ${issue}`));
            });
            console.log(chalk_1.default.cyan('💡 Suggestions:'));
            typechainValidation.suggestions.forEach(suggestion => {
                console.log(chalk_1.default.cyan(`   - ${suggestion}`));
            });
            throw new Error('TypeChain setup validation failed');
        }
        // Start progress indicator for non-verbose mode
        if (!normalizedArgs.verbose) {
            progressIndicator = new TaskHelpers_1.ProgressIndicator(`Generating Diamond ABI and TypeScript types for ${normalizedArgs.diamondName}...`);
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
        // PHASE 1: Generate the Diamond ABI
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('\n📋 Phase 1: Generating Diamond ABI...'));
        }
        else if (progressIndicator) {
            progressIndicator.updateMessage('Phase 1/2: Generating Diamond ABI...');
        }
        const abiResult = await (0, DiamondAbiGenerator_1.generateDiamondAbi)(hre, options);
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.green('✅ Diamond ABI generated successfully'));
            console.log(chalk_1.default.cyan(`   Output file: ${abiResult.outputPath}`));
            console.log(chalk_1.default.cyan(`   Functions: ${abiResult.stats.totalFunctions}`));
            console.log(chalk_1.default.cyan(`   Events: ${abiResult.stats.totalEvents}`));
            console.log(chalk_1.default.cyan(`   Errors: ${abiResult.stats.totalErrors}`));
            console.log(chalk_1.default.cyan(`   Facets: ${abiResult.stats.facetCount}`));
        }
        // PHASE 2: Generate TypeScript types using TypeChain
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('\n🔧 Phase 2: Generating TypeScript types with TypeChain...'));
        }
        else if (progressIndicator) {
            progressIndicator.updateMessage('Phase 2/2: Generating TypeScript types...');
        }
        if (!abiResult.outputPath) {
            throw new Error('ABI generation did not produce an output file');
        }
        const typechainOptions = {
            abiPath: abiResult.outputPath,
            target: normalizedArgs.typechainTarget,
            outputDir: normalizedArgs.typechainOutDir,
            verbose: normalizedArgs.verbose,
        };
        if (normalizedArgs.verbose) {
            helpers.logVerbose("TypeChain options", typechainOptions);
        }
        const typechainResult = await typechainIntegration.generateTypes(typechainOptions);
        // Stop progress indicator
        if (progressIndicator) {
            progressIndicator.stop();
        }
        if (!typechainResult.success) {
            throw new Error(`TypeChain generation failed: ${typechainResult.error}`);
        }
        // Display results
        const duration = timer.stop();
        console.log(chalk_1.default.green(`\n✅ Diamond ABI and TypeScript types generated successfully!`));
        // ABI Results
        console.log(chalk_1.default.blue('\n📋 ABI Generation Results:'));
        console.log(chalk_1.default.cyan(`   Output file: ${abiResult.outputPath}`));
        console.log(chalk_1.default.cyan(`   Functions: ${abiResult.stats.totalFunctions}`));
        console.log(chalk_1.default.cyan(`   Events: ${abiResult.stats.totalEvents}`));
        console.log(chalk_1.default.cyan(`   Errors: ${abiResult.stats.totalErrors}`));
        console.log(chalk_1.default.cyan(`   Facets: ${abiResult.stats.facetCount}`));
        if (abiResult.stats.duplicateSelectorsSkipped > 0) {
            console.log(chalk_1.default.yellow(`   Duplicates skipped: ${abiResult.stats.duplicateSelectorsSkipped}`));
        }
        // Show ABI file size
        if ((0, fs_1.existsSync)(abiResult.outputPath)) {
            try {
                const abiStats = (0, fs_1.statSync)(abiResult.outputPath);
                console.log(chalk_1.default.cyan(`   ABI file size: ${TaskHelpers_1.TaskHelpers.formatFileSize(abiStats.size)}`));
            }
            catch {
                // Ignore file size errors
            }
        }
        // TypeChain Results
        console.log(chalk_1.default.blue('\n🔧 TypeChain Generation Results:'));
        console.log(chalk_1.default.cyan(`   Output directory: ${typechainResult.outputDir}`));
        console.log(chalk_1.default.cyan(`   Generated files: ${typechainResult.generatedFiles.length}`));
        console.log(chalk_1.default.cyan(`   Target: ${normalizedArgs.typechainTarget}`));
        // Show TypeChain directory size
        if ((0, fs_1.existsSync)(typechainResult.outputDir)) {
            try {
                const files = (0, fs_1.readdirSync)(typechainResult.outputDir, { recursive: true });
                const totalFiles = Array.isArray(files) ? files.length : 0;
                console.log(chalk_1.default.cyan(`   Total files in output: ${totalFiles}`));
            }
            catch {
                // Ignore counting errors
            }
        }
        // Display selector map in verbose mode
        if (normalizedArgs.verbose && Object.keys(abiResult.selectorMap).length > 0) {
            console.log(chalk_1.default.blue('\n🔍 Function selector mapping:'));
            Object.entries(abiResult.selectorMap).forEach(([selector, facet]) => {
                console.log(chalk_1.default.cyan(`   ${selector} → ${facet}`));
            });
        }
        // Display generated TypeScript files in verbose mode
        if (normalizedArgs.verbose && typechainResult.generatedFiles.length > 0) {
            console.log(chalk_1.default.blue('\n📁 Generated TypeScript files:'));
            typechainResult.generatedFiles.slice(0, 10).forEach(file => {
                console.log(chalk_1.default.cyan(`   ${file}`));
            });
            if (typechainResult.generatedFiles.length > 10) {
                console.log(chalk_1.default.cyan(`   ... and ${typechainResult.generatedFiles.length - 10} more files`));
            }
        }
        // Display generation statistics
        helpers.logTaskCompletion("diamond:generate-abi-typechain", duration, true);
        if (normalizedArgs.verbose) {
            console.log(chalk_1.default.blue('\n📊 Generation statistics:'));
            console.log(chalk_1.default.cyan(`   Total processing time: ${TaskHelpers_1.TaskHelpers.formatDuration(duration)}`));
            console.log(chalk_1.default.cyan(`   Average time per facet: ${TaskHelpers_1.TaskHelpers.formatDuration(Math.round(duration / Math.max(abiResult.stats.facetCount, 1)))}`));
            console.log(chalk_1.default.cyan(`   TypeChain files per second: ${Math.round(typechainResult.generatedFiles.length / (duration / 1000))}`));
        }
        // Success message with next steps
        console.log(chalk_1.default.green('\n🎉 Diamond ABI and TypeScript generation complete!'));
        console.log(chalk_1.default.cyan('\n💡 Next steps:'));
        console.log(chalk_1.default.cyan('   - Import the generated TypeScript types in your frontend code'));
        console.log(chalk_1.default.cyan('   - Use the types for type-safe contract interactions'));
        console.log(chalk_1.default.cyan('   - Check the generated factory classes for contract deployment'));
        console.log(chalk_1.default.cyan(`   - Example: import { ${normalizedArgs.diamondName}__factory } from "${typechainResult.outputDir}"`));
        return {
            abi: abiResult,
            typechain: typechainResult,
            success: true,
        };
    }
    catch (error) {
        // Stop progress indicator on error
        if (progressIndicator) {
            progressIndicator.stop();
        }
        const duration = timer.stop();
        helpers.logTaskCompletion("diamond:generate-abi-typechain", duration, false);
        console.error(chalk_1.default.red('\n❌ Diamond ABI and TypeScript generation failed:'));
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
        console.log(chalk_1.default.cyan('   - Verify TypeChain dependencies are installed'));
        console.log(chalk_1.default.cyan('   - Run with --verbose flag for detailed error information'));
        // Check for common issues
        const availableDiamonds = helpers.getAvailableDiamonds();
        if (availableDiamonds.length > 0) {
            console.log(chalk_1.default.cyan(`   - Available diamonds: ${availableDiamonds.join(', ')}`));
        }
        else {
            console.log(chalk_1.default.cyan('   - No diamond configurations found, add them to hardhat.config.ts'));
        }
        // TypeChain-specific suggestions
        console.log(chalk_1.default.cyan('\n🔧 TypeChain-specific tips:'));
        console.log(chalk_1.default.cyan('   - Install TypeChain: npm install --save-dev typechain @typechain/ethers-v6'));
        console.log(chalk_1.default.cyan('   - Check TypeChain target compatibility with your project'));
        console.log(chalk_1.default.cyan('   - Ensure ethers.js is installed for ethers-v6 target'));
        throw error;
    }
});
