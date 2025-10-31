"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardhatTypeChainIntegration = void 0;
exports.generateTypeChainTypes = generateTypeChainTypes;
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
/**
 * TypeChain integration for hardhat-diamonds plugin
 *
 * This class provides TypeChain integration for generating TypeScript types
 * from Diamond ABI files. It integrates with the Hardhat runtime environment
 * and provides comprehensive error handling and validation.
 */
class HardhatTypeChainIntegration {
    hre;
    /**
     * Create a new HardhatTypeChainIntegration instance
     *
     * @param hre - Hardhat runtime environment
     */
    constructor(hre) {
        this.hre = hre;
    }
    /**
     * Generate TypeChain types from a Diamond ABI file
     *
     * @param options - TypeChain generation options
     * @returns Promise resolving to generation result
     */
    async generateTypes(options) {
        const { abiPath, target = "ethers-v6", outputDir = (0, path_1.join)(this.hre.config.paths.root, "diamond-typechain-types"), verbose = false, } = options;
        if (verbose) {
            console.log(chalk_1.default.blue(`🔧 Generating TypeChain types from ${abiPath}...`));
        }
        try {
            // Validate input file exists
            if (!(0, fs_1.existsSync)(abiPath)) {
                throw new Error(`ABI file not found: ${abiPath}`);
            }
            // Ensure output directory exists
            if (!(0, fs_1.existsSync)(outputDir)) {
                (0, fs_1.mkdirSync)(outputDir, { recursive: true });
            }
            // Validate TypeChain target
            const validTargets = ["ethers-v6", "ethers-v5", "web3-v1", "truffle-v5"];
            if (!validTargets.includes(target)) {
                throw new Error(`Invalid TypeChain target: ${target}. Valid targets: ${validTargets.join(", ")}`);
            }
            if (verbose) {
                console.log(chalk_1.default.cyan(`   Target: ${target}`));
                console.log(chalk_1.default.cyan(`   Output: ${outputDir}`));
            }
            // Generate types using TypeChain CLI
            await this.runTypeChain(abiPath, target, outputDir, verbose);
            // Get list of generated files
            const generatedFiles = this.getGeneratedFiles(outputDir);
            if (verbose) {
                console.log(chalk_1.default.green(`✅ TypeChain types generated successfully!`));
                console.log(chalk_1.default.blue(`   Generated ${generatedFiles.length} files`));
                if (generatedFiles.length > 0) {
                    console.log(chalk_1.default.blue(`   Files: ${generatedFiles.slice(0, 5).join(", ")}${generatedFiles.length > 5 ? "..." : ""}`));
                }
            }
            return {
                outputDir,
                generatedFiles,
                success: true,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (verbose) {
                console.error(chalk_1.default.red(`❌ TypeChain generation failed: ${errorMessage}`));
            }
            return {
                outputDir,
                generatedFiles: [],
                success: false,
                error: errorMessage,
            };
        }
    }
    /**
     * Run TypeChain CLI command
     *
     * @param abiPath - Path to ABI file
     * @param target - TypeChain target
     * @param outputDir - Output directory
     * @param verbose - Whether to show verbose output
     */
    async runTypeChain(abiPath, target, outputDir, verbose) {
        return new Promise((resolve, reject) => {
            const args = [
                "typechain",
                "--target",
                target,
                "--out-dir",
                outputDir,
                abiPath,
            ];
            if (verbose) {
                console.log(chalk_1.default.cyan(`   Running: npx ${args.join(" ")}`));
            }
            const child = (0, child_process_1.spawn)("npx", args, {
                stdio: verbose ? "inherit" : "pipe",
                cwd: this.hre.config.paths.root,
            });
            let stdout = "";
            let stderr = "";
            if (!verbose && child.stdout) {
                child.stdout.on("data", (data) => {
                    stdout += data.toString();
                });
            }
            if (!verbose && child.stderr) {
                child.stderr.on("data", (data) => {
                    stderr += data.toString();
                });
            }
            child.on("close", (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    const errorOutput = stderr || stdout || `TypeChain process exited with code ${code}`;
                    reject(new Error(`TypeChain generation failed: ${errorOutput}`));
                }
            });
            child.on("error", (error) => {
                reject(new Error(`Failed to spawn TypeChain process: ${error.message}`));
            });
        });
    }
    /**
     * Get list of generated TypeScript files in the output directory
     *
     * @param outputDir - Output directory to scan
     * @returns Array of generated file paths
     */
    getGeneratedFiles(outputDir) {
        if (!(0, fs_1.existsSync)(outputDir)) {
            return [];
        }
        const files = [];
        const scanDirectory = (dir, relativePath = "") => {
            try {
                const entries = (0, fs_1.readdirSync)(dir);
                for (const entry of entries) {
                    const fullPath = (0, path_1.join)(dir, entry);
                    const relativeFilePath = (0, path_1.join)(relativePath, entry);
                    try {
                        const stat = (0, fs_1.statSync)(fullPath);
                        if (stat.isDirectory()) {
                            scanDirectory(fullPath, relativeFilePath);
                        }
                        else if (stat.isFile() && entry.endsWith(".ts")) {
                            files.push(relativeFilePath);
                        }
                    }
                    catch {
                        // Ignore files that can't be accessed
                    }
                }
            }
            catch {
                // Ignore directories that can't be read
            }
        };
        scanDirectory(outputDir);
        return files.sort();
    }
    /**
     * Validate TypeChain installation and configuration
     *
     * @param verbose - Whether to show verbose output
     * @returns Promise resolving to validation result
     */
    async validateTypeChainSetup(verbose = false) {
        const issues = [];
        const suggestions = [];
        if (verbose) {
            console.log(chalk_1.default.blue("🔍 Validating TypeChain setup..."));
        }
        try {
            // Check if TypeChain is available using --help instead of --version
            await this.runCommand("npx", ["typechain", "--help"], { stdio: "pipe" });
            if (verbose) {
                console.log(chalk_1.default.green("   ✅ TypeChain CLI is available"));
            }
        }
        catch {
            issues.push("TypeChain CLI is not available");
            suggestions.push("Install TypeChain: npm install --save-dev typechain @typechain/ethers-v6");
        }
        try {
            // Check if ethers is available (required for ethers-v6 target)
            await this.runCommand("node", ["-e", 'require("ethers")'], {
                stdio: "pipe",
            });
            if (verbose) {
                console.log(chalk_1.default.green("   ✅ Ethers.js is available"));
            }
        }
        catch {
            issues.push("Ethers.js is not available");
            suggestions.push("Install Ethers.js: npm install --save-dev ethers");
        }
        // Check package.json for TypeChain dependencies
        try {
            const packageJsonPath = (0, path_1.join)(this.hre.config.paths.root, "package.json");
            if ((0, fs_1.existsSync)(packageJsonPath)) {
                const packageJson = require(packageJsonPath);
                const deps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies,
                };
                if (!deps.typechain) {
                    issues.push("TypeChain not found in package.json dependencies");
                    suggestions.push("Add TypeChain to your dependencies");
                }
                if (!deps["@typechain/ethers-v6"] && !deps["@typechain/ethers-v5"]) {
                    issues.push("TypeChain ethers target not found in dependencies");
                    suggestions.push("Add @typechain/ethers-v6 to your dependencies");
                }
            }
        }
        catch {
            // Package.json validation is optional
        }
        const isValid = issues.length === 0;
        if (verbose) {
            if (isValid) {
                console.log(chalk_1.default.green("✅ TypeChain setup is valid"));
            }
            else {
                console.log(chalk_1.default.yellow(`⚠️  Found ${issues.length} issue(s) with TypeChain setup`));
                issues.forEach((issue) => console.log(chalk_1.default.red(`   - ${issue}`)));
                suggestions.forEach((suggestion) => console.log(chalk_1.default.cyan(`   💡 ${suggestion}`)));
            }
        }
        return { isValid, issues, suggestions };
    }
    /**
     * Run a command and return a promise
     *
     * @param command - Command to run
     * @param args - Command arguments
     * @param options - Spawn options
     * @returns Promise that resolves when command completes successfully
     */
    runCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(command, args, {
                stdio: "pipe",
                cwd: this.hre.config.paths.root,
                ...options,
            });
            let stdout = "";
            let stderr = "";
            if (child.stdout) {
                child.stdout.on("data", (data) => {
                    stdout += data.toString();
                });
            }
            if (child.stderr) {
                child.stderr.on("data", (data) => {
                    stderr += data.toString();
                });
            }
            child.on("close", (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
                }
            });
            child.on("error", (error) => {
                reject(error);
            });
        });
    }
}
exports.HardhatTypeChainIntegration = HardhatTypeChainIntegration;
/**
 * Convenience function to generate TypeChain types using Hardhat runtime environment
 *
 * @param hre - Hardhat runtime environment
 * @param options - TypeChain generation options
 * @returns Promise resolving to generation result
 */
async function generateTypeChainTypes(hre, options) {
    const integration = new HardhatTypeChainIntegration(hre);
    return integration.generateTypes(options);
}
