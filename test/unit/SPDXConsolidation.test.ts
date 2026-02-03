import { expect } from "chai";
import path from "path";
import fs from "fs/promises";
import hre from "hardhat";
import { DiamondFlattener } from "../../src/lib/DiamondFlattener";

describe("DiamondFlattener - SPDX Consolidation", function () {
  this.timeout(60000); // Increase timeout for integration tests

  const outputPath = path.join(__dirname, "../test-output/test-flatten.sol");

  beforeEach(async function () {
    // Clean up any existing output file
    try {
      await fs.unlink(outputPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  after(async function () {
    // Clean up test output
    try {
      await fs.unlink(outputPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it("should have exactly ONE SPDX-License-Identifier at the top of the flattened file", async function () {
    // Create flattener
    const flattener = new DiamondFlattener(hre, {
      diamondName: "ExampleDiamond",
      outputPath,
      verbose: false,
    });

    // Execute flatten
    const result = await flattener.flatten();

    // Count SPDX identifiers in the output
    const spdxMatches = result.flattenedSource.match(
      /SPDX-License-Identifier:/g
    );
    const spdxCount = spdxMatches ? spdxMatches.length : 0;

    // Assert exactly one SPDX identifier
    expect(spdxCount).to.equal(
      1,
      `Expected exactly 1 SPDX identifier, found ${spdxCount}`
    );

    // Verify it's at the very start of the file
    const firstLine = result.flattenedSource.split("\n")[0];
    expect(firstLine).to.match(
      /^\/\/\s*SPDX-License-Identifier:/,
      "SPDX identifier should be on the first line"
    );
  });

  it("should have pragma directive immediately after SPDX", async function () {
    // Create flattener
    const flattener = new DiamondFlattener(hre, {
      diamondName: "ExampleDiamond",
      outputPath,
      verbose: false,
    });

    // Execute flatten
    const result = await flattener.flatten();

    // Get first few lines
    const lines = result.flattenedSource.split("\n");

    // First line should be SPDX
    expect(lines[0]).to.match(/^\/\/\s*SPDX-License-Identifier:/);

    // Second line should be pragma
    expect(lines[1]).to.match(/^pragma\s+solidity/);
  });

  it("should remove SPDX identifiers from all individual contract sources", async function () {
    // Create flattener
    const flattener = new DiamondFlattener(hre, {
      diamondName: "ExampleDiamond",
      outputPath,
      verbose: false,
    });

    // Execute flatten
    const result = await flattener.flatten();

    // Split into lines and skip the first line (which has the consolidated SPDX)
    const lines = result.flattenedSource.split("\n");
    const bodyLines = lines.slice(1); // Skip first line

    // Check that there are no more SPDX identifiers in the body
    const bodySpdxMatches = bodyLines
      .join("\n")
      .match(/SPDX-License-Identifier:/g);
    const bodySpdxCount = bodySpdxMatches ? bodySpdxMatches.length : 0;

    expect(bodySpdxCount).to.equal(
      0,
      `Found ${bodySpdxCount} SPDX identifier(s) in contract bodies (should be 0)`
    );
  });

  it("should extract SPDX from first source file", async function () {
    // Create flattener
    const flattener = new DiamondFlattener(hre, {
      diamondName: "ExampleDiamond",
      outputPath,
      verbose: false,
    });

    // Execute flatten
    const result = await flattener.flatten();

    // Get the first line
    const firstLine = result.flattenedSource.split("\n")[0];

    // Should have a valid SPDX license identifier (extracted from first source file)
    expect(firstLine).to.match(/^\/\/\s*SPDX-License-Identifier:\s*\S+/);
    // The license identifier should be one of the common ones
    expect(firstLine).to.match(
      /SPDX-License-Identifier:\s*(MIT|UNLICENSED|Apache-2\.0|GPL-3\.0|BSD-\d-Clause)/
    );
  });
});
