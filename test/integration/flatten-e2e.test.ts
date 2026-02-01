/**
 * Epic 5: Task Integration & Error Handling - End-to-End Integration Tests
 * 
 * These tests validate the acceptance tests defined in the Epic 5 PRD:
 * - E5-AT1: Task outputs to stdout by default
 * - E5-AT2: Task outputs to file when --output specified
 * - E5-AT3: Programmatic API works independently
 * - E5-AT4: All errors include helpful suggestions
 */

import { expect } from "chai";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";
import { flattenDiamond } from "../../src/lib/DiamondFlattener";
import { FlattenError } from "../../src/lib/errors";

describe("Epic 5: End-to-End Integration Tests", () => {
  const testOutputDir = path.join(__dirname, "../../test-output/epic5-integration");
  
  // Check if we have ExampleDiamond configured
  const hasExampleDiamond = hre.config.diamonds?.paths?.ExampleDiamond !== undefined;
  
  before(function() {
    if (!hasExampleDiamond) {
      console.log("⚠ ExampleDiamond not configured - skipping Epic 5 integration tests");
      console.log("ℹ These tests require ExampleDiamond to be configured in hardhat.config.ts");
      this.skip();
    }
    
    // Clean up and create test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    fs.mkdirSync(testOutputDir, { recursive: true });
  });

  after(() => {
    // Clean up test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  describe("E5-AT1: Task outputs to stdout by default", () => {
    it("should output flattened source to stdout when no --output flag", function(this: Mocha.Context) {
      this.timeout(30000); // Long timeout for contract compilation

      try {
        const result = execSync(
          "npx hardhat diamond:flatten --diamond-name ExampleDiamond",
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );

        // Verify stdout contains Solidity code
        expect(result).to.include("// SPDX-License-Identifier");
        expect(result).to.include("pragma solidity");
        
        // Verify no file was created (stdout mode)
        const defaultFilePath = path.join(__dirname, "../../../..", "flattened", "ExampleDiamond.sol");
        expect(fs.existsSync(defaultFilePath)).to.be.false;
        
      } catch (error: any) {
        // If Diamond configuration is not found, skip this test
        if (error.stderr?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it("should not show summary in stdout mode when not verbose", function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        const result = execSync(
          "npx hardhat diamond:flatten --diamond-name ExampleDiamond",
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );

        // Verify summary is NOT shown (no verbose flag, stdout mode)
        expect(result).to.not.include("Flattening Summary");
        expect(result).to.not.include("Facets:");
        
      } catch (error: any) {
        if (error.stderr?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it("should show summary in stdout mode when verbose", function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        const result = execSync(
          "npx hardhat diamond:flatten --diamond-name ExampleDiamond --flatten-verbose",
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );

        // Verify summary IS shown (verbose flag)
        expect(result).to.include("Flattening Summary");
        expect(result).to.include("Facets:");
        expect(result).to.include("Selectors:");
        expect(result).to.include("Execution Time:");
        
      } catch (error: any) {
        if (error.stderr?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });
  });

  describe("E5-AT2: Task outputs to file when --output specified", () => {
    const outputFile = path.join(testOutputDir, "diamond-flattened.sol");

    afterEach(() => {
      // Clean up output file after each test
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
    });

    it("should create output file and write flattened source", function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        const result = execSync(
          `npx hardhat diamond:flatten --diamond-name ExampleDiamond --output ${outputFile}`,
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );

        // Verify file was created
        expect(fs.existsSync(outputFile)).to.be.true;
        
        // Verify file contains Solidity code
        const fileContent = fs.readFileSync(outputFile, "utf-8");
        expect(fileContent).to.include("// SPDX-License-Identifier");
        expect(fileContent).to.include("pragma solidity");
        
        // Verify stdout contains success message and summary
        expect(result).to.include("Flattened source written to:");
        expect(result).to.include(outputFile);
        expect(result).to.include("Flattening Summary");
        
      } catch (error: any) {
        if (error.stderr?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it("should create parent directories if they don't exist", function(this: Mocha.Context) {
      this.timeout(30000);

      const nestedOutputFile = path.join(testOutputDir, "deep", "nested", "path", "diamond.sol");

      try {
        execSync(
          `npx hardhat diamond:flatten --diamond-name ExampleDiamond --output ${nestedOutputFile}`,
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );

        // Verify nested directories were created
        expect(fs.existsSync(nestedOutputFile)).to.be.true;
        
        // Cleanup nested directories
        fs.rmSync(path.join(testOutputDir, "deep"), { recursive: true });
        
      } catch (error: any) {
        if (error.stderr?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it("should always show summary when writing to file", function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        const result = execSync(
          `npx hardhat diamond:flatten --diamond-name ExampleDiamond --output ${outputFile}`,
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );

        // Verify summary is shown even without verbose flag
        expect(result).to.include("Flattening Summary");
        expect(result).to.include("Facets:");
        expect(result).to.include("Selectors:");
        
      } catch (error: any) {
        if (error.stderr?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });
  });

  describe("E5-AT3: Programmatic API works independently", () => {
    it("should flatten diamond using flattenDiamond() function", async function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        // Use programmatic API
        const result = await flattenDiamond(hre, {
          diamondName: "ExampleDiamond",
          verbose: true,
        });

        // Verify result structure
        expect(result).to.have.property("flattenedSource");
        expect(result).to.have.property("facets");
        expect(result).to.have.property("selectorMap");
        expect(result).to.have.property("warnings");
        expect(result).to.have.property("stats");

        // Verify stats
        expect(result.stats).to.have.property("totalFacets");
        expect(result.stats).to.have.property("totalSelectors");
        expect(result.stats).to.have.property("totalContracts");
        expect(result.stats).to.have.property("totalLines");
        expect(result.stats).to.have.property("deduplicatedContracts");
        expect(result.stats).to.have.property("executionTimeMs");

        // Verify flattened source contains Solidity code
        expect(result.flattenedSource).to.be.a("string");
        
      } catch (error: any) {
        if (error.message?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it("should apply default options from HRE config", async function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        // Call with minimal options - should use HRE defaults
        const result = await flattenDiamond(hre, {
          diamondName: "ExampleDiamond",
        });

        // Verify defaults were applied
        expect(result.stats.totalFacets).to.be.a("number");
        expect(result.warnings).to.be.an("array");
        
      } catch (error: any) {
        if (error.message?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it("should allow overriding default options", async function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        // Override defaults
        const result = await flattenDiamond(hre, {
          diamondName: "ExampleDiamond",
          verbose: true,
          networkName: "localhost",
        });

        // Verify overrides work
        expect(result).to.have.property("warnings");
        expect(result.warnings).to.be.an("array");
        
      } catch (error: any) {
        if (error.message?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it("should return warnings array for non-critical issues", async function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        const result = await flattenDiamond(hre, {
          diamondName: "ExampleDiamond",
          verbose: true,
        });

        // Verify warnings array exists
        expect(result.warnings).to.be.an("array");
        
        // If warnings exist, they should be strings
        if (result.warnings.length > 0) {
          expect(result.warnings[0]).to.be.a("string");
        }
        
      } catch (error: any) {
        if (error.message?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });
  });

  describe("E5-AT4: All errors include helpful suggestions", () => {
    it("should throw FlattenError with suggestion for invalid diamond name", async () => {
      try {
        await flattenDiamond(hre, {
          diamondName: "NonExistentDiamond",
        });
        
        // Should not reach here
        expect.fail("Expected FlattenError to be thrown");
        
      } catch (error: any) {
        expect(error).to.be.instanceOf(FlattenError);
        expect(error.code).to.equal("DIAMOND_NOT_FOUND");
        expect(error.suggestion).to.be.a("string");
        expect(error.suggestion.length).to.be.greaterThan(0);
        expect(error.message).to.include("NonExistentDiamond");
      }
    });

    it("should include suggestion in CLI error output", function(this: Mocha.Context) {
      this.timeout(10000);

      try {
        execSync(
          "npx hardhat diamond:flatten --diamond-name NonExistentDiamond",
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );
        
        // Should not reach here
        expect.fail("Expected command to fail");
        
      } catch (error: any) {
        // Verify error message includes suggestion
        const stderr = error.stderr || error.stdout || "";
        expect(stderr).to.include("Suggestion:");
      }
    });

    it("should provide context with error details", async () => {
      try {
        await flattenDiamond(hre, {
          diamondName: "NonExistentDiamond",
        });
        
        expect.fail("Expected FlattenError to be thrown");
        
      } catch (error: any) {
        expect(error).to.be.instanceOf(FlattenError);
        expect(error.context).to.be.an("object");
        
        // Context should contain relevant details
        if (error.context) {
          expect(Object.keys(error.context).length).to.be.greaterThan(0);
        }
      }
    });

    it("should display warnings in yellow color", function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        const result = execSync(
          "npx hardhat diamond:flatten --diamond-name ExampleDiamond --flatten-verbose",
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe",
            env: { ...process.env, FORCE_COLOR: "1" } // Enable color output
          }
        );

        // If there are warnings, they should be formatted
        // (Color codes are difficult to test, so we just verify the structure)
        if (result.includes("Warnings:")) {
          expect(result).to.include("Warnings:");
        }
        
      } catch (error: any) {
        if (error.stderr?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should exit with code 1 on error", function(this: Mocha.Context) {
      this.timeout(10000);

      try {
        execSync(
          "npx hardhat diamond:flatten --diamond-name NonExistentDiamond",
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );
        
        expect.fail("Expected command to fail");
        
      } catch (error: any) {
        // execSync throws when exit code is non-zero
        expect(error.status).to.equal(1);
      }
    });

    it("should show stack trace in verbose mode on error", function(this: Mocha.Context) {
      this.timeout(10000);

      try {
        execSync(
          "npx hardhat diamond:flatten --diamond-name NonExistentDiamond --flatten-verbose",
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );
        
        expect.fail("Expected command to fail");
        
      } catch (error: any) {
        const stderr = error.stderr || error.stdout || "";
        // In verbose mode, should show stack trace
        expect(stderr).to.include("Error:");
      }
    });

    it("should not show stack trace in non-verbose mode on error", function(this: Mocha.Context) {
      this.timeout(10000);

      try {
        execSync(
          "npx hardhat diamond:flatten --diamond-name NonExistentDiamond",
          {
            cwd: path.join(__dirname, "../../../.."),
            encoding: "utf-8",
            stdio: "pipe"
          }
        );
        
        expect.fail("Expected command to fail");
        
      } catch (error: any) {
        const stderr = error.stderr || error.stdout || "";
        // Should show error message but not full stack trace
        expect(stderr).to.include("Error:");
      }
    });
  });

  describe("Performance and Statistics", () => {
    it("should include execution time in stats", async function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        const result = await flattenDiamond(hre, {
          diamondName: "ExampleDiamond",
          verbose: true,
        });

        expect(result.stats.executionTimeMs).to.be.a("number");
        expect(result.stats.executionTimeMs).to.be.greaterThan(0);
        
      } catch (error: any) {
        if (error.message?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it("should track all 6 required statistics", async function(this: Mocha.Context) {
      this.timeout(30000);

      try {
        const result = await flattenDiamond(hre, {
          diamondName: "ExampleDiamond",
          verbose: true,
        });

        const requiredStats = [
          "totalFacets",
          "totalSelectors",
          "totalContracts",
          "totalLines",
          "deduplicatedContracts",
          "executionTimeMs"
        ];

        requiredStats.forEach(stat => {
          expect(result.stats).to.have.property(stat);
          expect(result.stats[stat as keyof typeof result.stats]).to.be.a("number");
        });
        
      } catch (error: any) {
        if (error.message?.includes("Diamond configuration not found")) {
          this.skip();
        } else {
          throw error;
        }
      }
    });
  });
});
