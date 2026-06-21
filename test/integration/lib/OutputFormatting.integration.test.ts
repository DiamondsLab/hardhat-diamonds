import { expect } from "chai";
import { OutputFormatter } from "../../../src/lib/OutputFormatter";
import type {
  SelectorInfo,
  DiscoveredFacet,
} from "../../../src/tasks/shared/TaskOptions";

describe("Output Formatting Integration", () => {
  let formatter: OutputFormatter;

  beforeEach(() => {
    formatter = new OutputFormatter();
  });

  describe("Complete formatted output generation", () => {
    it("should generate complete formatted output for minimal diamond", () => {
      // Create minimal test data
      const selectorMap = new Map<string, SelectorInfo>([
        [
          "0x12345678",
          { facetName: "TestFacet", signature: "test()", functionName: "test" },
        ],
        [
          "0x87654321",
          {
            facetName: "TestFacet",
            signature: "getValue() returns (uint256)",
            functionName: "getValue",
          },
        ],
        [
          "0xabcdef12",
          {
            facetName: "TestFacet",
            signature: "setValue(uint256)",
            functionName: "setValue",
          },
        ],
      ]);

      const facet: DiscoveredFacet = {
        name: "TestFacet",
        contractPath: "contracts/facets/TestFacet.sol",
        priority: 100,
        version: "1.0.0",
        selectors: ["0x12345678", "0x87654321", "0xabcdef12"],
        isInit: false,
      };

      const summaryOptions = {
        diamondName: "TestDiamond",
        totalContracts: 3,
        totalFacets: 1,
        totalSelectors: 3,
        totalDependencies: 0,
        generatorVersion: "1.1.15",
        networkName: "localhost",
      };

      // Generate all components
      const summaryHeader = formatter.generateSummaryHeader(summaryOptions);
      const selectorTable = formatter.generateSelectorTable(selectorMap);
      const facetHeader = formatter.generateFacetHeader(facet);
      const diamondHeader = formatter.generateDiamondHeader("TestDiamond");

      // Verify all components are generated
      expect(summaryHeader).to.include("FLATTENED DIAMOND CONTRACT");
      expect(summaryHeader).to.include("TestDiamond");
      expect(summaryHeader).to.include("Statistics:");
      expect(summaryHeader).to.include("Total Contracts: 3");
      expect(summaryHeader).to.include("AUTO-GENERATED FILE");

      expect(selectorTable).to.include("DIAMOND FUNCTION SELECTOR MAP");
      expect(selectorTable).to.include("0x12345678");
      expect(selectorTable).to.include("TestFacet");
      expect(selectorTable).to.include("test()");

      expect(facetHeader).to.include("FACET: TestFacet");
      expect(facetHeader).to.include("Priority:  100");
      expect(facetHeader).to.include("Version:  1.0.0");
      expect(facetHeader).to.include("Selectors:  3");

      expect(diamondHeader).to.include("DIAMOND: TestDiamond");
    });

    it("should generate formatted output for complex diamond with multiple facets", () => {
      // Create complex test data with multiple facets
      const selectorMap = new Map<string, SelectorInfo>();

      // Add selectors for multiple facets
      for (let i = 0; i < 50; i++) {
        const selector = `0x${i.toString(16).padStart(8, "0")}`;
        const facetName = i < 20 ? "Facet1" : i < 35 ? "Facet2" : "Facet3";
        const functionName = `function${i}`;
        selectorMap.set(selector, {
          facetName,
          signature: `${functionName}(uint256,address) returns (bool)`,
          functionName,
        });
      }

      const facets: DiscoveredFacet[] = [
        {
          name: "Facet1",
          contractPath: "contracts/facets/Facet1.sol",
          priority: 100,
          version: "1.0.0",
          selectors: Array.from(selectorMap.keys()).slice(0, 20),
          isInit: false,
        },
        {
          name: "Facet2",
          contractPath: "contracts/facets/Facet2.sol",
          priority: 200,
          version: "2.0.0",
          selectors: Array.from(selectorMap.keys()).slice(20, 35),
          isInit: false,
        },
        {
          name: "Facet3",
          contractPath: "contracts/facets/Facet3.sol",
          priority: 300,
          version: "3.0.0",
          selectors: Array.from(selectorMap.keys()).slice(35, 50),
          isInit: false,
        },
      ];

      const summaryOptions = {
        diamondName: "ComplexDiamond",
        totalContracts: 13,
        totalFacets: 3,
        totalSelectors: 50,
        totalDependencies: 10,
        generatorVersion: "1.1.15",
      };

      // Generate components
      const summaryHeader = formatter.generateSummaryHeader(summaryOptions);
      const selectorTable = formatter.generateSelectorTable(selectorMap);
      const facetHeaders = facets.map((f) => formatter.generateFacetHeader(f));

      // Verify summary shows correct stats
      expect(summaryHeader).to.include("Total Contracts: 13");
      expect(summaryHeader).to.include("Facets: 3");
      expect(summaryHeader).to.include("Function Selectors: 50");
      expect(summaryHeader).to.include("Dependencies: 10");

      // Verify all selectors in table (check first and last)
      expect(selectorTable).to.include("0x00000000");
      expect(selectorTable).to.include("0x00000031"); // 49 in hex

      // Verify all facet headers
      expect(facetHeaders[0]).to.include("FACET: Facet1");
      expect(facetHeaders[0]).to.include("Selectors:  20");
      expect(facetHeaders[1]).to.include("FACET: Facet2");
      expect(facetHeaders[1]).to.include("Selectors:  15");
      expect(facetHeaders[2]).to.include("FACET: Facet3");
      expect(facetHeaders[2]).to.include("Selectors:  15");
    });

    it("should handle init contract with special labeling", () => {
      const initContract: DiscoveredFacet = {
        name: "DiamondInit",
        contractPath: "contracts/init/DiamondInit.sol",
        priority: 1,
        version: "1.0.0",
        selectors: [],
        isInit: true,
      };

      const initHeader = formatter.generateInitHeader(initContract);

      // Verify init contract uses special label
      expect(initHeader).to.include("INIT CONTRACT: DiamondInit");
      expect(initHeader).to.not.include("FACET:");
      expect(initHeader).to.include("Priority:  1");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle empty selector map", () => {
      const emptyMap = new Map<string, SelectorInfo>();
      const result = formatter.generateSelectorTable(emptyMap);

      expect(result).to.include("No function selectors found");
      expect(result).to.include("/*");
      expect(result).to.include("*/");
    });

    it("should handle facet with missing optional fields", () => {
      const facet: DiscoveredFacet = {
        name: "MinimalFacet",
        contractPath: "contracts/facets/MinimalFacet.sol",
        selectors: ["0x12345678"],
        isInit: false,
      };

      const header = formatter.generateFacetHeader(facet);

      expect(header).to.include("MinimalFacet");
      expect(header).to.include("Priority:  N/A");
      expect(header).to.include("Version:  N/A");
    });

    it("should handle very long function signatures with truncation", () => {
      const longSignature =
        "veryLongFunctionNameThatExceedsMaximumWidth(uint256,address,bytes32,string,bool,uint256[],address[]) returns (uint256,address,bytes32)";
      const selectorMap = new Map<string, SelectorInfo>([
        [
          "0x12345678",
          {
            facetName: "TestFacet",
            signature: longSignature,
            functionName: "veryLongFunctionNameThatExceedsMaximumWidth",
          },
        ],
      ]);

      const table = formatter.generateSelectorTable(selectorMap);

      // Should truncate with ...
      expect(table).to.include("...");

      // Verify table still has proper structure
      expect(table).to.include("╔");
      expect(table).to.include("╝");
    });

    it("should handle very long diamond name", () => {
      const longName =
        "VeryLongDiamondNameThatMightExceedNormalLengthExpectations";
      const header = formatter.generateDiamondHeader(longName);

      expect(header).to.include(longName);

      // Verify still wrapped in comment
      expect(header).to.include("/*");
      expect(header).to.include("*/");
    });

    it("should handle summary without optional network name", () => {
      const options = {
        diamondName: "TestDiamond",
        totalContracts: 5,
        totalFacets: 2,
        totalSelectors: 10,
        totalDependencies: 3,
        generatorVersion: "1.1.15",
        // networkName is omitted
      };

      const summary = formatter.generateSummaryHeader(options);

      // Should not include network line
      expect(summary).to.not.include("Network:");

      // Should still include all other content
      expect(summary).to.include("TestDiamond");
      expect(summary).to.include("Generated:");
      expect(summary).to.include("Statistics:");
    });
  });

  describe("Source cleaning integration", () => {
    it("should clean complete Solidity source file", () => {
      const source = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BaseContract.sol";
import {SomeLib} from "./libraries/SomeLib.sol";


// This is a regular comment
contract TestContract is BaseContract {
    uint256 public value;
    
    /* Multi-line
       comment block */
    function setValue(uint256 _value) public {
        value = _value;
    }
}`;

      const cleaned = formatter.cleanSource(source);

      // Verify removals
      expect(cleaned).to.not.include("SPDX-License-Identifier");
      expect(cleaned).to.not.include("pragma solidity");
      expect(cleaned).to.not.include("import");

      // Verify preservation
      expect(cleaned).to.include("// This is a regular comment");
      expect(cleaned).to.include("/* Multi-line");
      expect(cleaned).to.include("contract TestContract");
      expect(cleaned).to.include("function setValue");
    });

    it("should extract SPDX and pragma from source", () => {
      const source = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Test {}`;

      const spdx = formatter.extractSPDX(source);
      const pragma = formatter.extractPragma(source);

      expect(spdx).to.equal("MIT");
      expect(pragma).to.equal("pragma solidity ^0.8.19;");
    });

    it("should handle missing SPDX and pragma gracefully", () => {
      const source = `contract Test {
    function test() public {}
}`;

      const spdx = formatter.extractSPDX(source);
      const pragma = formatter.extractPragma(source);

      expect(spdx).to.be.null;
      expect(pragma).to.be.null;
    });
  });

  describe("Output structure and formatting", () => {
    it("should maintain consistent 80-character width for headers", () => {
      const facet: DiscoveredFacet = {
        name: "TestFacet",
        contractPath: "contracts/facets/TestFacet.sol",
        priority: 100,
        version: "1.0.0",
        selectors: ["0x12345678"],
        isInit: false,
      };

      const facetHeader = formatter.generateFacetHeader(facet);
      const diamondHeader = formatter.generateDiamondHeader("TestDiamond");
      const depsHeader = formatter.generateDependenciesHeader();

      // Extract lines from each header (remove comment markers)
      const extractLines = (text: string) => {
        return text
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => line.replace(/^\/\*|^ \* | \*\/$/, "").trim());
      };

      const facetLines = extractLines(facetHeader);
      const diamondLines = extractLines(diamondHeader);
      const depsLines = extractLines(depsHeader);

      // Check that separator lines are 80 chars
      facetLines.forEach((line) => {
        if (line.startsWith("====")) {
          expect(line.length).to.equal(80);
        }
      });
    });

    it("should use Unicode box-drawing characters consistently", () => {
      const selectorMap = new Map<string, SelectorInfo>([
        [
          "0x12345678",
          { facetName: "TestFacet", signature: "test()", functionName: "test" },
        ],
      ]);

      const summaryOptions = {
        diamondName: "TestDiamond",
        totalContracts: 1,
        totalFacets: 1,
        totalSelectors: 1,
        totalDependencies: 0,
        generatorVersion: "1.1.15",
      };

      const selectorTable = formatter.generateSelectorTable(selectorMap);
      const summary = formatter.generateSummaryHeader(summaryOptions);

      // Check for specific Unicode box-drawing characters
      const boxChars = ["╔", "╗", "╚", "╝", "║", "═", "╠", "╣", "╦", "╩", "╬"];

      boxChars.forEach((char) => {
        expect(selectorTable).to.include(char);
      });

      // Summary uses same style
      expect(summary).to.include("╔");
      expect(summary).to.include("╝");
      expect(summary).to.include("║");
    });

    it("should wrap all output in block comments", () => {
      const selectorMap = new Map<string, SelectorInfo>([
        [
          "0x12345678",
          { facetName: "TestFacet", signature: "test()", functionName: "test" },
        ],
      ]);

      const table = formatter.generateSelectorTable(selectorMap);
      const facetHeader = formatter.generateFacetHeader({
        name: "TestFacet",
        contractPath: "contracts/facets/TestFacet.sol",
        selectors: ["0x12345678"],
        isInit: false,
      });

      // All outputs should be wrapped in /* */
      [table, facetHeader].forEach((output) => {
        const lines = output.split("\n");
        expect(lines[0]).to.equal("/*");
        expect(lines[lines.length - 1]).to.equal(" */");

        // Middle lines should start with " * "
        for (let i = 1; i < lines.length - 1; i++) {
          expect(lines[i]).to.match(/^ \* /);
        }
      });
    });
  });

  describe("Alphabetical sorting", () => {
    it("should sort selectors alphabetically in table", () => {
      const selectorMap = new Map<string, SelectorInfo>([
        [
          "0xffffffff",
          {
            facetName: "TestFacet",
            signature: "zzzLast()",
            functionName: "zzzLast",
          },
        ],
        [
          "0x00000000",
          {
            facetName: "TestFacet",
            signature: "aaaFirst()",
            functionName: "aaaFirst",
          },
        ],
        [
          "0x12345678",
          {
            facetName: "TestFacet",
            signature: "midFunction()",
            functionName: "midFunction",
          },
        ],
      ]);

      const table = formatter.generateSelectorTable(selectorMap);

      // Find positions of selectors in output
      const pos0 = table.indexOf("0x00000000");
      const pos1 = table.indexOf("0x12345678");
      const posF = table.indexOf("0xffffffff");

      // Verify they appear in alphabetical order
      expect(pos0).to.be.lessThan(pos1);
      expect(pos1).to.be.lessThan(posF);
    });
  });
});
