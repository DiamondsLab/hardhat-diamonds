import { spawn } from "child_process";
import { join } from "path";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import chalk from "chalk";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  TypeChainGenerationOptions,
  TypeChainGenerationResult,
} from "../tasks/shared/TaskOptions";

/**
 * TypeChain integration for hardhat-diamonds plugin
 *
 * This class provides TypeChain integration for generating TypeScript types
 * from Diamond ABI files. It integrates with the Hardhat runtime environment
 * and provides comprehensive error handling and validation.
 */
export class HardhatTypeChainIntegration {
  private hre: HardhatRuntimeEnvironment;

  /**
   * Create a new HardhatTypeChainIntegration instance
   *
   * @param hre - Hardhat runtime environment
   */
  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre;
  }

  /**
   * Generate TypeChain types from a Diamond ABI file
   *
   * @param options - TypeChain generation options
   * @returns Promise resolving to generation result
   */
  async generateTypes(
    options: TypeChainGenerationOptions
  ): Promise<TypeChainGenerationResult> {
    const {
      abiPath,
      target = "ethers-v6",
      outputDir = join(this.hre.config.paths.root, "diamond-typechain-types"),
      verbose = false,
    } = options;

    if (verbose) {
      console.log(
        chalk.blue(`🔧 Generating TypeChain types from ${abiPath}...`)
      );
    }

    try {
      // Validate input file exists
      if (!existsSync(abiPath)) {
        throw new Error(`ABI file not found: ${abiPath}`);
      }

      // Ensure output directory exists
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // Validate TypeChain target
      const validTargets = ["ethers-v6", "ethers-v5", "web3-v1", "truffle-v5"];
      if (!validTargets.includes(target)) {
        throw new Error(
          `Invalid TypeChain target: ${target}. Valid targets: ${validTargets.join(", ")}`
        );
      }

      if (verbose) {
        console.log(chalk.cyan(`   Target: ${target}`));
        console.log(chalk.cyan(`   Output: ${outputDir}`));
      }

      // Generate types using TypeChain CLI
      await this.runTypeChain(abiPath, target, outputDir, verbose);

      // Get list of generated files
      const generatedFiles = this.getGeneratedFiles(outputDir);

      if (verbose) {
        console.log(chalk.green(`✅ TypeChain types generated successfully!`));
        console.log(chalk.blue(`   Generated ${generatedFiles.length} files`));
        if (generatedFiles.length > 0) {
          console.log(
            chalk.blue(
              `   Files: ${generatedFiles.slice(0, 5).join(", ")}${generatedFiles.length > 5 ? "..." : ""}`
            )
          );
        }
      }

      return {
        outputDir,
        generatedFiles,
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (verbose) {
        console.error(
          chalk.red(`❌ TypeChain generation failed: ${errorMessage}`)
        );
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
  private async runTypeChain(
    abiPath: string,
    target: string,
    outputDir: string,
    verbose: boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Resolve TypeChain CLI from the consuming project's node_modules
      let typechainCliPath: string;
      try {
        const typechainPath = require.resolve("typechain", {
          paths: [this.hre.config.paths.root, process.cwd()],
        });
        // Navigate from typechain module to CLI
        typechainCliPath = join(
          typechainPath.substring(0, typechainPath.indexOf("typechain") + "typechain".length),
          "dist",
          "cli",
          "cli.js"
        );
      } catch {
        reject(new Error("TypeChain module not found. Install it with: npm install --save-dev typechain"));
        return;
      }

      const args = [
        typechainCliPath,
        "--target",
        target,
        "--out-dir",
        outputDir,
        abiPath,
      ];

      if (verbose) {
        console.log(chalk.cyan(`   Running: node ${args.join(" ")}`));
      }

      const child = spawn("node", args, {
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
        } else {
          const errorOutput =
            stderr || stdout || `TypeChain process exited with code ${code}`;
          reject(new Error(`TypeChain generation failed: ${errorOutput}`));
        }
      });

      child.on("error", (error) => {
        reject(
          new Error(`Failed to spawn TypeChain process: ${error.message}`)
        );
      });
    });
  }

  /**
   * Get list of generated TypeScript files in the output directory
   *
   * @param outputDir - Output directory to scan
   * @returns Array of generated file paths
   */
  private getGeneratedFiles(outputDir: string): string[] {
    if (!existsSync(outputDir)) {
      return [];
    }

    const files: string[] = [];

    const scanDirectory = (dir: string, relativePath = "") => {
      try {
        const entries = readdirSync(dir);

        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const relativeFilePath = join(relativePath, entry);

          try {
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
              scanDirectory(fullPath, relativeFilePath);
            } else if (stat.isFile() && entry.endsWith(".ts")) {
              files.push(relativeFilePath);
            }
          } catch {
            // Ignore files that can't be accessed
          }
        }
      } catch {
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
  async validateTypeChainSetup(verbose = false): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (verbose) {
      console.log(chalk.blue("🔍 Validating TypeChain setup..."));
    }

    try {
      // Check if TypeChain is available by resolving from project context
      const projectRoot = this.hre.config.paths.root;
      const typechainPath = require.resolve("typechain", {
        paths: [projectRoot, process.cwd()],
      });

      // Verify CLI exists
      const typechainCliPath = join(
        typechainPath.substring(0, typechainPath.indexOf("typechain") + "typechain".length),
        "dist",
        "cli",
        "cli.js"
      );

      if (!existsSync(typechainCliPath)) {
        issues.push("TypeChain CLI is not available");
        suggestions.push(
          "Install TypeChain: npm install --save-dev typechain @typechain/ethers-v6"
        );
      } else if (verbose) {
        console.log(chalk.green("   ✅ TypeChain CLI is available"));
      }
    } catch {
      issues.push("TypeChain CLI is not available");
      suggestions.push(
        "Install TypeChain: npm install --save-dev typechain @typechain/ethers-v6"
      );
    }

    try {
      // Check if ethers is available (required for ethers-v6 target)
      const projectRoot = this.hre.config.paths.root;
      require.resolve("ethers", {
        paths: [projectRoot, process.cwd()],
      });

      if (verbose) {
        console.log(chalk.green("   ✅ Ethers.js is available"));
      }
    } catch {
      issues.push("Ethers.js is not available");
      suggestions.push("Install Ethers.js: npm install --save-dev ethers");
    }

    // Check package.json for TypeChain dependencies
    try {
      const packageJsonPath = join(this.hre.config.paths.root, "package.json");
      if (existsSync(packageJsonPath)) {
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
    } catch {
      // Package.json validation is optional
    }

    const isValid = issues.length === 0;

    if (verbose) {
      if (isValid) {
        console.log(chalk.green("✅ TypeChain setup is valid"));
      } else {
        console.log(
          chalk.yellow(
            `⚠️  Found ${issues.length} issue(s) with TypeChain setup`
          )
        );
        issues.forEach((issue) => console.log(chalk.red(`   - ${issue}`)));
        suggestions.forEach((suggestion) =>
          console.log(chalk.cyan(`   💡 ${suggestion}`))
        );
      }
    }

    return { isValid, issues, suggestions };
  }
}

/**
 * Convenience function to generate TypeChain types using Hardhat runtime environment
 *
 * @param hre - Hardhat runtime environment
 * @param options - TypeChain generation options
 * @returns Promise resolving to generation result
 */
export async function generateTypeChainTypes(
  hre: HardhatRuntimeEnvironment,
  options: TypeChainGenerationOptions
): Promise<TypeChainGenerationResult> {
  const integration = new HardhatTypeChainIntegration(hre);
  return integration.generateTypes(options);
}
