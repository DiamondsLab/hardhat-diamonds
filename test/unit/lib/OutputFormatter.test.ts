import { expect } from "chai";
import {
  OutputFormatter,
  SummaryHeaderOptions,
} from "../../../src/lib/OutputFormatter";
import type {
  DiscoveredFacet,
  SelectorInfo,
} from "../../../src/tasks/shared/TaskOptions";

describe("OutputFormatter", () => {
  let formatter: OutputFormatter;

  beforeEach(() => {
    formatter = new OutputFormatter();
  });

  describe("generateSelectorTable", () => {
    it("should handle empty selector map", () => {
      const emptyMap = new Map<string, SelectorInfo>();
      const result = formatter.generateSelectorTable(emptyMap);
      expect(result).to.include("No function selectors found");
      expect(result).to.match(/^\/\*/); // Starts with block comment
      expect(result).to.match(/\*\/$/); // Ends with block comment
    });

    it("should generate table with single selector", () => {
      const selectorMap = new Map<string, SelectorInfo>();
      selectorMap.set("0x12345678", {
        selector: "0x12345678",
        facetName: "ExampleFacet",
        signature: "example()",
      });

      const result = formatter.generateSelectorTable(selectorMap);
      expect(result).to.include("0x12345678");
      expect(result).to.include("ExampleFacet");
      expect(result).to.include("example()");
      expect(result).to.include("DIAMOND FUNCTION SELECTOR MAP");
      expect(result).to.match(/^\/\*/);
      expect(result).to.match(/\*\/$/);
    });

    it("should generate table with multiple selectors", () => {
      const selectorMap = new Map<string, SelectorInfo>();
      selectorMap.set("0x12345678", {
        selector: "0x12345678",
        facetName: "FacetA",
        signature: "funcA()",
      });
      selectorMap.set("0xabcdef00", {
        selector: "0xabcdef00",
        facetName: "FacetB",
        signature: "funcB(uint256)",
      });
      selectorMap.set("0x99887766", {
        selector: "0x99887766",
        facetName: "FacetC",
        signature: "funcC(address,bool)",
      });

      const result = formatter.generateSelectorTable(selectorMap);
      expect(result).to.include("0x12345678");
      expect(result).to.include("0xabcdef00");
      expect(result).to.include("0x99887766");
      expect(result).to.include("FacetA");
      expect(result).to.include("FacetB");
      expect(result).to.include("FacetC");
    });

    it("should sort selectors alphabetically", () => {
      const selectorMap = new Map<string, SelectorInfo>();
      selectorMap.set("0xffffffff", {
        selector: "0xffffffff",
        facetName: "FacetZ",
        signature: "last()",
      });
      selectorMap.set("0x00000000", {
        selector: "0x00000000",
        facetName: "FacetA",
        signature: "first()",
      });
      selectorMap.set("0x88888888", {
        selector: "0x88888888",
        facetName: "FacetM",
        signature: "middle()",
      });

      const result = formatter.generateSelectorTable(selectorMap);
      const lines = result.split("\n");

      // Find data rows (skip header rows)
      const dataRows = lines.filter((line) => line.includes("0x"));
      const firstDataRow = dataRows.find((line) => line.includes("first()"));
      const middleDataRow = dataRows.find((line) => line.includes("middle()"));
      const lastDataRow = dataRows.find((line) => line.includes("last()"));

      // Check order by comparing indices
      const firstIndex = lines.indexOf(firstDataRow!);
      const middleIndex = lines.indexOf(middleDataRow!);
      const lastIndex = lines.indexOf(lastDataRow!);

      expect(firstIndex).to.be.lessThan(middleIndex);
      expect(middleIndex).to.be.lessThan(lastIndex);
    });

    it("should truncate long function signatures", () => {
      const longSignature =
        "veryLongFunctionNameWithManyParameters(uint256,address,bool,string,bytes32,uint256[])";
      const selectorMap = new Map<string, SelectorInfo>();
      selectorMap.set("0x12345678", {
        selector: "0x12345678",
        facetName: "TestFacet",
        signature: longSignature,
      });

      const result = formatter.generateSelectorTable(selectorMap);
      expect(result).to.include("...");
      expect(result).to.not.include(longSignature);
    });

    it("should preserve short function signatures", () => {
      const shortSignature = "test()";
      const selectorMap = new Map<string, SelectorInfo>();
      selectorMap.set("0x12345678", {
        selector: "0x12345678",
        facetName: "TestFacet",
        signature: shortSignature,
      });

      const result = formatter.generateSelectorTable(selectorMap);
      expect(result).to.include(shortSignature);
      expect(result).to.not.include("...");
    });

    it("should have consistent border alignment", () => {
      const selectorMap = new Map<string, SelectorInfo>();
      selectorMap.set("0x12345678", {
        selector: "0x12345678",
        facetName: "TestFacet",
        signature: "test()",
      });

      const result = formatter.generateSelectorTable(selectorMap);
      const lines = result.split("\n");

      // Get table lines (between /* and */)
      const tableLines = lines.slice(1, -1).map((line) => {
        // Remove " * " prefix
        return line.substring(3);
      });

      // Filter out empty lines and check width consistency
      const nonEmptyLines = tableLines.filter((line) => line.length > 0);
      const widths = nonEmptyLines.map((line) => line.length);
      const uniqueWidths = [...new Set(widths)];

      // All non-empty table lines should have the same width
      expect(uniqueWidths.length).to.equal(1);
    });

    it("should wrap output in block comment", () => {
      const selectorMap = new Map<string, SelectorInfo>();
      selectorMap.set("0x12345678", {
        selector: "0x12345678",
        facetName: "TestFacet",
        signature: "test()",
      });

      const result = formatter.generateSelectorTable(selectorMap);
      expect(result).to.match(/^\/\*/);
      expect(result).to.match(/\*\/$/);

      const lines = result.split("\n");
      expect(lines[0]).to.equal("/*");
      expect(lines[lines.length - 1]).to.equal(" */");

      // Check that all middle lines start with " * "
      for (let i = 1; i < lines.length - 1; i++) {
        expect(lines[i]).to.match(/^ \* /);
      }
    });

    it("should use Unicode box-drawing characters", () => {
      const selectorMap = new Map<string, SelectorInfo>();
      selectorMap.set("0x12345678", {
        selector: "0x12345678",
        facetName: "TestFacet",
        signature: "test()",
      });

      const result = formatter.generateSelectorTable(selectorMap);

      // Check for Unicode box-drawing characters
      expect(result).to.include("═"); // Horizontal
      expect(result).to.include("║"); // Vertical
      expect(result).to.include("╔"); // Top left
      expect(result).to.include("╗"); // Top right
      expect(result).to.include("╚"); // Bottom left
      expect(result).to.include("╝"); // Bottom right
      expect(result).to.include("╠"); // Left T
      expect(result).to.include("╣"); // Right T
      expect(result).to.include("╦"); // Top T
      expect(result).to.include("╩"); // Bottom T
      expect(result).to.include("╬"); // Cross
    });
  });

  describe("generateFacetHeader", () => {
    it("should generate header with all metadata", () => {
      // TODO: Implement test
    });

    it("should handle missing priority", () => {
      // TODO: Implement test
    });

    it("should handle missing version", () => {
      // TODO: Implement test
    });

    it("should handle zero selectors", () => {
      // TODO: Implement test
    });

    it("should be exactly 80 characters wide", () => {
      // TODO: Implement test
    });
  });

  describe("generateInitHeader", () => {
    it("should generate init contract header", () => {
      // TODO: Implement test
    });

    it("should label as INIT CONTRACT", () => {
      // TODO: Implement test
    });

    it("should be exactly 80 characters wide", () => {
      // TODO: Implement test
    });
  });

  describe("generateDependenciesHeader", () => {
    it("should generate dependencies header", () => {
      // TODO: Implement test
    });

    it("should be exactly 80 characters wide", () => {
      // TODO: Implement test
    });
  });

  describe("generateDiamondHeader", () => {
    it("should generate diamond header with short name", () => {
      // TODO: Implement test
    });

    it("should handle long diamond names", () => {
      // TODO: Implement test
    });

    it("should be exactly 80 characters wide", () => {
      // TODO: Implement test
    });
  });

  describe("generateSummaryHeader", () => {
    it("should generate complete summary with all fields", () => {
      // TODO: Implement test
    });

    it("should generate summary without optional networkName", () => {
      // TODO: Implement test
    });

    it("should include timestamp in ISO format", () => {
      // TODO: Implement test
    });

    it("should include all statistics", () => {
      // TODO: Implement test
    });

    it("should include warning section", () => {
      // TODO: Implement test
    });

    it("should have aligned box-drawing borders", () => {
      // TODO: Implement test
    });

    it("should wrap in block comment", () => {
      // TODO: Implement test
    });
  });

  describe("cleanSource", () => {
    it("should remove SPDX identifier", () => {
      // TODO: Implement test
    });

    it("should remove pragma statement", () => {
      // TODO: Implement test
    });

    it("should remove import statements", () => {
      // TODO: Implement test
    });

    it("should remove excess blank lines", () => {
      // TODO: Implement test
    });

    it("should preserve comments", () => {
      // TODO: Implement test
    });

    it("should preserve contract definitions", () => {
      // TODO: Implement test
    });

    it("should perform complete cleaning", () => {
      // TODO: Implement test
    });
  });

  describe("extractSPDX", () => {
    it("should extract MIT license", () => {
      // TODO: Implement test
    });

    it("should extract UNLICENSED", () => {
      // TODO: Implement test
    });

    it("should return null if missing", () => {
      // TODO: Implement test
    });

    it("should handle multiple SPDX lines", () => {
      // TODO: Implement test
    });
  });

  describe("extractPragma", () => {
    it("should extract pragma with caret", () => {
      // TODO: Implement test
    });

    it("should extract pragma with comparison", () => {
      // TODO: Implement test
    });

    it("should extract exact version pragma", () => {
      // TODO: Implement test
    });

    it("should return null if missing", () => {
      // TODO: Implement test
    });
  });
});
