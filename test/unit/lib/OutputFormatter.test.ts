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
        functionName: "example",
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
        functionName: "funcA",
        signature: "funcA()",
      });
      selectorMap.set("0xabcdef00", {
        selector: "0xabcdef00",
        facetName: "FacetB",
        functionName: "funcB",
        signature: "funcB(uint256)",
      });
      selectorMap.set("0x99887766", {
        selector: "0x99887766",
        facetName: "FacetC",
        functionName: "funcC",
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
        functionName: "last",
        signature: "last()",
      });
      selectorMap.set("0x00000000", {
        selector: "0x00000000",
        facetName: "FacetA",
        functionName: "first",
        signature: "first()",
      });
      selectorMap.set("0x88888888", {
        selector: "0x88888888",
        facetName: "FacetM",
        functionName: "middle",
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
        functionName: "veryLongFunctionNameWithManyParameters",
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
        functionName: "test",
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
        functionName: "test",
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
        functionName: "test",
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
        functionName: "test",
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
      const facet: DiscoveredFacet = {
        name: "ExampleFacet",
        contractPath: "/path/to/ExampleFacet.sol",
        selectors: ["0x12345678", "0x87654321", "0xabcdef00"],
        isInit: false,
        priority: 10,
        version: "1.2.3",
      };

      const result = formatter.generateFacetHeader(facet);
      const lines = result.split("\n");

      // Should be wrapped in block comment
      expect(lines[0]).to.equal("/*");
      expect(lines[lines.length - 1]).to.equal(" */");

      // Extract content lines (without /* and */)
      const contentLines = lines
        .slice(1, -1)
        .map((line) => line.replace(/^ \* /, ""));

      // Check structure
      expect(contentLines[0]).to.match(/^={80}$/); // Top border
      expect(contentLines[1]).to.include("FACET: ExampleFacet");
      expect(contentLines[2]).to.match(/^={80}$/); // Separator
      expect(contentLines[3]).to.include("Priority:");
      expect(contentLines[3]).to.include("10");
      expect(contentLines[4]).to.include("Version:");
      expect(contentLines[4]).to.include("1.2.3");
      expect(contentLines[5]).to.include("Selectors:");
      expect(contentLines[5]).to.include("3");
      expect(contentLines[6]).to.match(/^={80}$/); // Bottom border

      // Verify all content lines are exactly 80 characters
      contentLines.forEach((line, idx) => {
        expect(
          line.length,
          `Line ${idx} should be 80 chars: "${line}"`
        ).to.equal(80);
      });
    });

    it("should handle missing priority", () => {
      const facet: DiscoveredFacet = {
        name: "TestFacet",
        contractPath: "/path/to/TestFacet.sol",
        selectors: [],
        isInit: false,
        version: "1.0.0",
      };

      const result = formatter.generateFacetHeader(facet);
      expect(result).to.include("Priority:");
      expect(result).to.include("N/A");
    });

    it("should handle missing version", () => {
      const facet: DiscoveredFacet = {
        name: "TestFacet",
        contractPath: "/path/to/TestFacet.sol",
        selectors: [],
        isInit: false,
        priority: 5,
      };

      const result = formatter.generateFacetHeader(facet);
      expect(result).to.include("Version:");
      expect(result).to.include("N/A");
    });

    it("should handle zero selectors", () => {
      const facet: DiscoveredFacet = {
        name: "EmptyFacet",
        contractPath: "/path/to/EmptyFacet.sol",
        selectors: [],
        isInit: false,
        priority: 1,
        version: "1.0.0",
      };

      const result = formatter.generateFacetHeader(facet);
      expect(result).to.include("Selectors:");
      expect(result).to.include("0");
    });

    it("should be exactly 80 characters wide", () => {
      const facet: DiscoveredFacet = {
        name: "VeryLongFacetNameThatMightCauseIssues",
        contractPath: "/path/to/file.sol",
        selectors: ["0x11111111"],
        isInit: false,
        priority: 999,
        version: "10.20.30",
      };

      const result = formatter.generateFacetHeader(facet);
      const lines = result.split("\n");
      const contentLines = lines
        .slice(1, -1)
        .map((line) => line.replace(/^ \* /, ""));

      contentLines.forEach((line, idx) => {
        expect(
          line.length,
          `Line ${idx} should be 80 chars: "${line}"`
        ).to.equal(80);
      });
    });
  });

  describe("generateInitHeader", () => {
    it("should generate init contract header", () => {
      const initContract: DiscoveredFacet = {
        name: "DiamondInit",
        contractPath: "/path/to/DiamondInit.sol",
        selectors: [],
        isInit: true,
        priority: 1,
        version: "1.0.0",
      };

      const result = formatter.generateInitHeader(initContract);
      const lines = result.split("\n");

      // Should be wrapped in block comment
      expect(lines[0]).to.equal("/*");
      expect(lines[lines.length - 1]).to.equal(" */");

      // Extract content lines
      const contentLines = lines
        .slice(1, -1)
        .map((line) => line.replace(/^ \* /, ""));

      // Check structure
      expect(contentLines[0]).to.match(/^={80}$/); // Top border
      expect(contentLines[1]).to.include("INIT CONTRACT: DiamondInit");
      expect(contentLines[2]).to.match(/^={80}$/); // Separator
      expect(contentLines[3]).to.include("Priority:");
      expect(contentLines[3]).to.include("1");
      expect(contentLines[4]).to.include("Version:");
      expect(contentLines[4]).to.include("1.0.0");
      expect(contentLines[5]).to.match(/^={80}$/); // Bottom border

      // Verify all content lines are exactly 80 characters
      contentLines.forEach((line, idx) => {
        expect(
          line.length,
          `Line ${idx} should be 80 chars: "${line}"`
        ).to.equal(80);
      });
    });

    it("should label as INIT CONTRACT", () => {
      const initContract: DiscoveredFacet = {
        name: "InitContract",
        contractPath: "/path/to/InitContract.sol",
        selectors: [],
        isInit: true,
      };

      const result = formatter.generateInitHeader(initContract);
      expect(result).to.include("INIT CONTRACT:");
      expect(result).to.include("InitContract");
    });

    it("should be exactly 80 characters wide", () => {
      const initContract: DiscoveredFacet = {
        name: "VeryLongInitContractName",
        contractPath: "/path/to/file.sol",
        selectors: [],
        isInit: true,
        priority: 100,
        version: "2.0.0",
      };

      const result = formatter.generateInitHeader(initContract);
      const lines = result.split("\n");
      const contentLines = lines
        .slice(1, -1)
        .map((line) => line.replace(/^ \* /, ""));

      contentLines.forEach((line, idx) => {
        expect(
          line.length,
          `Line ${idx} should be 80 chars: "${line}"`
        ).to.equal(80);
      });
    });
  });

  describe("generateDependenciesHeader", () => {
    it("should generate dependencies header", () => {
      const result = formatter.generateDependenciesHeader();
      const lines = result.split("\n");

      // Should be wrapped in block comment
      expect(lines[0]).to.equal("/*");
      expect(lines[lines.length - 1]).to.equal(" */");

      // Extract content lines
      const contentLines = lines
        .slice(1, -1)
        .map((line) => line.replace(/^ \* /, ""));

      // Check structure: top border, title, bottom border
      expect(contentLines[0]).to.match(/^={80}$/); // Top border
      expect(contentLines[1]).to.include("SHARED DEPENDENCIES");
      expect(contentLines[2]).to.match(/^={80}$/); // Bottom border

      // Verify centered title
      const titleLine = contentLines[1];
      const title = "SHARED DEPENDENCIES";
      const expectedPadding = Math.floor((80 - title.length) / 2);
      expect(titleLine.indexOf(title)).to.equal(expectedPadding);
    });

    it("should be exactly 80 characters wide", () => {
      const result = formatter.generateDependenciesHeader();
      const lines = result.split("\n");
      const contentLines = lines
        .slice(1, -1)
        .map((line) => line.replace(/^ \* /, ""));

      contentLines.forEach((line, idx) => {
        expect(
          line.length,
          `Line ${idx} should be 80 chars: "${line}"`
        ).to.equal(80);
      });
    });
  });

  describe("generateDiamondHeader", () => {
    it("should generate diamond header with short name", () => {
      const result = formatter.generateDiamondHeader("MyDiamond");
      const lines = result.split("\n");

      // Should be wrapped in block comment
      expect(lines[0]).to.equal("/*");
      expect(lines[lines.length - 1]).to.equal(" */");

      // Extract content lines
      const contentLines = lines
        .slice(1, -1)
        .map((line) => line.replace(/^ \* /, ""));

      // Check structure: top border, title, bottom border
      expect(contentLines[0]).to.match(/^={80}$/); // Top border
      expect(contentLines[1]).to.include("DIAMOND: MyDiamond");
      expect(contentLines[2]).to.match(/^={80}$/); // Bottom border

      // Verify centered title
      const titleLine = contentLines[1];
      const title = "DIAMOND: MyDiamond";
      const expectedPadding = Math.floor((80 - title.length) / 2);
      expect(titleLine.indexOf(title)).to.equal(expectedPadding);
    });

    it("should handle long diamond names", () => {
      const longName = "VeryLongDiamondNameThatIsQuiteLong";
      const result = formatter.generateDiamondHeader(longName);
      const lines = result.split("\n");
      const contentLines = lines
        .slice(1, -1)
        .map((line) => line.replace(/^ \* /, ""));

      // Should still be 80 characters wide
      contentLines.forEach((line, idx) => {
        expect(
          line.length,
          `Line ${idx} should be 80 chars: "${line}"`
        ).to.equal(80);
      });

      expect(result).to.include(`DIAMOND: ${longName}`);
    });

    it("should be exactly 80 characters wide", () => {
      const result = formatter.generateDiamondHeader("TestDiamond");
      const lines = result.split("\n");
      const contentLines = lines
        .slice(1, -1)
        .map((line) => line.replace(/^ \* /, ""));

      contentLines.forEach((line, idx) => {
        expect(
          line.length,
          `Line ${idx} should be 80 chars: "${line}"`
        ).to.equal(80);
      });
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
