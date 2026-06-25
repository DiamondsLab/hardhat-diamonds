/**
 * OutputFormatter - Utility class for generating formatted output for flattened Diamond contracts.
 *
 * This class provides methods to generate:
 * - Function selector tables with Unicode box-drawing characters
 * - Section headers for facets, init contracts, dependencies, and diamond
 * - Summary headers with metadata and statistics
 * - Source cleaning utilities (SPDX, pragma, import removal)
 *
 * All formatting is hardcoded per specification with consistent widths and visual style.
 */

import type {
  DiscoveredFacet,
  SelectorInfo,
} from "../tasks/shared/TaskOptions";

/**
 * Options for generating the summary header
 */
export interface SummaryHeaderOptions {
  /** Name of the Diamond contract */
  diamondName: string;
  /** Total number of contracts in the flattened output */
  totalContracts: number;
  /** Total number of facets */
  totalFacets: number;
  /** Total number of function selectors */
  totalSelectors: number;
  /** Total number of dependency contracts */
  totalDependencies: number;
  /** Version of the hardhat-diamonds generator */
  generatorVersion: string;
  /** Optional network name where Diamond is deployed */
  networkName?: string;
}

/**
 * OutputFormatter class - stateless utility for generating formatted Diamond contract output.
 *
 * This class uses Unicode box-drawing characters for tables and consistent 80-character
 * width headers for visual clarity and professional appearance.
 */
export class OutputFormatter {
  // Unicode box-drawing characters
  private readonly HORIZONTAL = "═";
  private readonly VERTICAL = "║";
  private readonly TOP_LEFT = "╔";
  private readonly TOP_RIGHT = "╗";
  private readonly BOTTOM_LEFT = "╚";
  private readonly BOTTOM_RIGHT = "╝";
  private readonly LEFT_T = "╠";
  private readonly RIGHT_T = "╣";
  private readonly TOP_T = "╦";
  private readonly BOTTOM_T = "╩";
  private readonly CROSS = "╬";

  // Table column widths
  private readonly SELECTOR_WIDTH = 12;
  private readonly FACET_WIDTH = 22;
  private readonly FUNCTION_WIDTH = 50;
  private readonly TOTAL_WIDTH =
    this.SELECTOR_WIDTH + this.FACET_WIDTH + this.FUNCTION_WIDTH + 4;

  // Header width
  private readonly HEADER_WIDTH = 80;

  /**
   * Generate a formatted function selector table with box-drawing borders.
   *
   * Creates a table showing the mapping of function selectors to facets and function signatures.
   * The table is sorted alphabetically by selector and wrapped in a block comment.
   *
   * @param selectorMap - Map of selectors (4-byte hex) to their corresponding facet and function info
   * @returns Formatted selector table wrapped in block comment, or empty table message if no selectors
   */
  public generateSelectorTable(selectorMap: Map<string, SelectorInfo>): string {
    // Handle empty map
    if (selectorMap.size === 0) {
      const emptyMessage = [
        this.TOP_LEFT +
          this.HORIZONTAL.repeat(this.TOTAL_WIDTH - 2) +
          this.TOP_RIGHT,
        this.VERTICAL +
          this.padCell(
            "No function selectors found",
            this.TOTAL_WIDTH - 2,
            "center"
          ) +
          this.VERTICAL,
        this.BOTTOM_LEFT +
          this.HORIZONTAL.repeat(this.TOTAL_WIDTH - 2) +
          this.BOTTOM_RIGHT,
      ].join("\n");
      return this.wrapInBlockComment(emptyMessage);
    }

    const parts: string[] = [];

    // Top border
    parts.push(
      this.TOP_LEFT +
        this.HORIZONTAL.repeat(this.TOTAL_WIDTH - 2) +
        this.TOP_RIGHT
    );

    // Title row
    parts.push(
      this.VERTICAL +
        this.padCell(
          "DIAMOND FUNCTION SELECTOR MAP",
          this.TOTAL_WIDTH - 2,
          "center"
        ) +
        this.VERTICAL
    );

    // Column separator
    parts.push(
      this.LEFT_T +
        this.HORIZONTAL.repeat(this.SELECTOR_WIDTH) +
        this.TOP_T +
        this.HORIZONTAL.repeat(this.FACET_WIDTH) +
        this.TOP_T +
        this.HORIZONTAL.repeat(this.FUNCTION_WIDTH) +
        this.RIGHT_T
    );

    // Column headers
    parts.push(
      this.VERTICAL +
        this.padCell("Selector", this.SELECTOR_WIDTH, "center") +
        this.VERTICAL +
        this.padCell("Facet", this.FACET_WIDTH, "center") +
        this.VERTICAL +
        this.padCell("Function", this.FUNCTION_WIDTH, "center") +
        this.VERTICAL
    );

    // Data separator
    parts.push(
      this.LEFT_T +
        this.HORIZONTAL.repeat(this.SELECTOR_WIDTH) +
        this.CROSS +
        this.HORIZONTAL.repeat(this.FACET_WIDTH) +
        this.CROSS +
        this.HORIZONTAL.repeat(this.FUNCTION_WIDTH) +
        this.RIGHT_T
    );

    // Sort entries by selector
    const sortedEntries = Array.from(selectorMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    // Data rows
    for (const [selector, info] of sortedEntries) {
      const truncatedSig = this.truncateSignature(
        info.signature,
        this.FUNCTION_WIDTH - 2
      );
      parts.push(
        this.VERTICAL +
          this.padCell(selector, this.SELECTOR_WIDTH, "left") +
          this.VERTICAL +
          this.padCell(info.facetName, this.FACET_WIDTH, "left") +
          this.VERTICAL +
          this.padCell(truncatedSig, this.FUNCTION_WIDTH, "left") +
          this.VERTICAL
      );
    }

    // Bottom border
    parts.push(
      this.BOTTOM_LEFT +
        this.HORIZONTAL.repeat(this.SELECTOR_WIDTH) +
        this.BOTTOM_T +
        this.HORIZONTAL.repeat(this.FACET_WIDTH) +
        this.BOTTOM_T +
        this.HORIZONTAL.repeat(this.FUNCTION_WIDTH) +
        this.BOTTOM_RIGHT
    );

    return this.wrapInBlockComment(parts.join("\n"));
  }

  /**
   * Generate a section header for a facet contract.
   *
   * Creates an 80-character wide header with facet name, priority, version, and selector count.
   *
   * @param facet - The discovered facet to generate a header for
   * @returns Formatted facet header (80 characters wide per line)
   */
  public generateFacetHeader(facet: DiscoveredFacet): string {
    const parts: string[] = [];
    parts.push("=".repeat(this.HEADER_WIDTH));
    const titleLine = this.padCell(
      `FACET: ${facet.name}`,
      this.HEADER_WIDTH,
      "center"
    );
    parts.push(titleLine);
    parts.push("=".repeat(this.HEADER_WIDTH));
    const priority = facet.priority ?? "N/A";
    const version = facet.version ?? "N/A";
    const selectorCount = facet.selectors?.length ?? 0;
    parts.push(
      this.formatStatLine("Priority", priority.toString()),
      this.formatStatLine("Version", version.toString()),
      this.formatStatLine("Selectors", selectorCount.toString())
    );
    parts.push("=".repeat(this.HEADER_WIDTH));
    return this.wrapInBlockComment(parts.join("\n"));
  }

  /**
   * Generate a section header for an init contract.
   *
   * Creates an 80-character wide header similar to facet headers but labeled as "INIT CONTRACT".
   *
   * @param initContract - The init contract (DiscoveredFacet with isInit=true)
   * @returns Formatted init contract header (80 characters wide per line)
   */
  public generateInitHeader(initContract: DiscoveredFacet): string {
    const parts: string[] = [];
    parts.push("=".repeat(this.HEADER_WIDTH));
    const titleLine = this.padCell(
      `INIT CONTRACT: ${initContract.name}`,
      this.HEADER_WIDTH,
      "center"
    );
    parts.push(titleLine);
    parts.push("=".repeat(this.HEADER_WIDTH));
    const priority = initContract.priority ?? "N/A";
    const version = initContract.version ?? "N/A";
    parts.push(
      this.formatStatLine("Priority", priority.toString()),
      this.formatStatLine("Version", version.toString())
    );
    parts.push("=".repeat(this.HEADER_WIDTH));
    return this.wrapInBlockComment(parts.join("\n"));
  }

  /**
   * Generate a section header for shared dependencies.
   *
   * Creates a simple 80-character wide header for the dependencies section.
   *
   * @returns Formatted dependencies header (80 characters wide per line)
   */
  public generateDependenciesHeader(): string {
    const parts: string[] = [];
    parts.push("=".repeat(this.HEADER_WIDTH));
    const titleLine = this.padCell(
      "SHARED DEPENDENCIES",
      this.HEADER_WIDTH,
      "center"
    );
    parts.push(titleLine);
    parts.push("=".repeat(this.HEADER_WIDTH));
    return this.wrapInBlockComment(parts.join("\n"));
  }

  /**
   * Generate a section header for the Diamond contract itself.
   *
   * Creates an 80-character wide header with the Diamond contract name.
   *
   * @param diamondName - Name of the Diamond contract
   * @returns Formatted diamond header (80 characters wide per line)
   */
  public generateDiamondHeader(diamondName: string): string {
    const parts: string[] = [];
    parts.push("=".repeat(this.HEADER_WIDTH));
    const titleLine = this.padCell(
      `DIAMOND: ${diamondName}`,
      this.HEADER_WIDTH,
      "center"
    );
    parts.push(titleLine);
    parts.push("=".repeat(this.HEADER_WIDTH));
    return this.wrapInBlockComment(parts.join("\n"));
  }

  /**
   * Generate a summary header with metadata, statistics, and warnings.
   *
   * Creates a comprehensive header wrapped in a block comment with box-drawing borders,
   * including generation timestamp, tool version, network info, contract statistics,
   * and auto-generation warning.
   *
   * @param options - Summary header configuration options
   * @returns Formatted summary header wrapped in block comment
   */
  public generateSummaryHeader(options: SummaryHeaderOptions): string {
    const parts: string[] = [];

    // Top border
    parts.push(this.TOP_LEFT + this.HORIZONTAL.repeat(78) + this.TOP_RIGHT);

    // Title lines (centered)
    parts.push(
      this.VERTICAL +
        this.padCell("FLATTENED DIAMOND CONTRACT", 78, "center") +
        this.VERTICAL
    );
    parts.push(
      this.VERTICAL +
        this.padCell(options.diamondName, 78, "center") +
        this.VERTICAL
    );

    // Separator
    parts.push(this.LEFT_T + this.HORIZONTAL.repeat(78) + this.RIGHT_T);

    // Generation metadata
    const timestamp = new Date().toISOString();
    parts.push(
      this.VERTICAL +
        this.padCell(`Generated: ${timestamp}`, 78, "left") +
        this.VERTICAL
    );
    parts.push(
      this.VERTICAL +
        this.padCell(
          `Generator: hardhat-diamonds v${options.generatorVersion}`,
          78,
          "left"
        ) +
        this.VERTICAL
    );

    // Optional network line
    if (options.networkName) {
      parts.push(
        this.VERTICAL +
          this.padCell(`Network: ${options.networkName}`, 78, "left") +
          this.VERTICAL
      );
    }

    // Statistics separator
    parts.push(this.LEFT_T + this.HORIZONTAL.repeat(78) + this.RIGHT_T);

    // Statistics section
    parts.push(
      this.VERTICAL + this.padCell("Statistics:", 78, "left") + this.VERTICAL
    );
    parts.push(
      this.VERTICAL +
        this.padCell(
          `  • Total Contracts: ${options.totalContracts}`,
          78,
          "left"
        ) +
        this.VERTICAL
    );
    parts.push(
      this.VERTICAL +
        this.padCell(`  • Facets: ${options.totalFacets}`, 78, "left") +
        this.VERTICAL
    );
    parts.push(
      this.VERTICAL +
        this.padCell(
          `  • Function Selectors: ${options.totalSelectors}`,
          78,
          "left"
        ) +
        this.VERTICAL
    );
    parts.push(
      this.VERTICAL +
        this.padCell(
          `  • Dependencies: ${options.totalDependencies}`,
          78,
          "left"
        ) +
        this.VERTICAL
    );

    // Warning separator
    parts.push(this.LEFT_T + this.HORIZONTAL.repeat(78) + this.RIGHT_T);

    // Warning section
    parts.push(
      this.VERTICAL +
        this.padCell(
          "⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY",
          78,
          "left"
        ) +
        this.VERTICAL
    );
    parts.push(
      this.VERTICAL +
        this.padCell(
          "This file was automatically generated by hardhat-diamonds.",
          78,
          "left"
        ) +
        this.VERTICAL
    );
    parts.push(
      this.VERTICAL +
        this.padCell(
          "Any manual changes will be lost on the next regeneration.",
          78,
          "left"
        ) +
        this.VERTICAL
    );

    // Bottom border
    parts.push(
      this.BOTTOM_LEFT + this.HORIZONTAL.repeat(78) + this.BOTTOM_RIGHT
    );

    return this.wrapInBlockComment(parts.join("\n"));
  }

  /**
   * Clean a Solidity source file by removing SPDX, pragma, and imports.
   *
   * This method prepares source code for inclusion in the flattened output by:
   * - Removing SPDX license identifiers
   * - Removing pragma statements
   * - Removing import statements
   * - Removing excess blank lines (3+ consecutive newlines)
   *
   * @param content - The Solidity source code to clean
   * @returns Cleaned source code ready for assembly
   */
  public cleanSource(content: string): string {
    let cleaned = content;

    // Remove SPDX license identifier (single-line and multi-line comments)
    cleaned = cleaned.replace(/\/\/\s*SPDX-License-Identifier:.*$/gm, "");
    cleaned = cleaned.replace(/\/\*\s*SPDX-License-Identifier:.*?\*\//gs, "");

    // Remove pragma statements
    cleaned = cleaned.replace(/pragma\s+solidity\s+[^;]+;\s*/g, "");

    // Remove import statements
    cleaned = cleaned.replace(/import\s+.*?;\s*/g, "");

    // Remove excess blank lines (3 or more consecutive newlines -> 2 newlines)
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    // Trim leading and trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Extract the pragma statement from a Solidity source file.
   *
   * Searches for and returns the pragma solidity statement, or null if not found.
   *
   * @param content - The Solidity source code
   * @returns The pragma statement (e.g., "pragma solidity ^0.8.0;") or null
   */
  public extractPragma(content: string): string | null {
    // Match pragma solidity statements
    // Supports various version patterns: ^0.8.0, >=0.8.0 <0.9.0, 0.8.19, etc.
    const pragmaPattern = /pragma\s+solidity\s+([^;]+);/;
    const match = content.match(pragmaPattern);
    return match ? `pragma solidity ${match[1]};` : null;
  }

  /**
   * Extract the SPDX license identifier from a Solidity source file.
   *
   * Searches for and returns the SPDX license identifier, or null if not found.
   *
   * @param content - The Solidity source code
   * @returns The license identifier (e.g., "MIT", "UNLICENSED") or null
   */
  public extractSPDX(content: string): string | null {
    // Match SPDX-License-Identifier patterns
    // Supports both comment styles: // and /* */
    const spdxPattern = /SPDX-License-Identifier:\s*([^\s*\/]+)/;
    const match = content.match(spdxPattern);
    return match ? match[1].trim() : null;
  }

  /**
   * Pad a cell content to a specified width with alignment.
   *
   * @param content - The text content to pad
   * @param width - Target width in characters
   * @param align - Alignment: 'left' (default), 'center', or 'right'
   * @returns Padded string of exact width
   */
  private padCell(
    content: string,
    width: number,
    align: "left" | "center" | "right" = "left"
  ): string {
    // If content is already longer than width, return as-is
    if (content.length >= width) {
      return content;
    }

    const padding = width - content.length;

    if (align === "left") {
      return content + " ".repeat(padding);
    } else if (align === "right") {
      return " ".repeat(padding) + content;
    } else {
      // center
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return " ".repeat(leftPad) + content + " ".repeat(rightPad);
    }
  }

  /**
   * Wrap content in a Solidity block comment.
   *
   * Adds /* at the start, prefixes each line with " * ", and adds *\/ at the end.
   *
   * @param content - The content to wrap
   * @returns Content wrapped in block comment
   */
  private wrapInBlockComment(content: string): string {
    if (!content) {
      return "/*\n */";
    }

    const lines = content.split("\n");
    const wrappedLines = lines.map((line) => " * " + line);
    return "/*\n" + wrappedLines.join("\n") + "\n */";
  }

  /**
   * Truncate a function signature if it exceeds the maximum length.
   *
   * @param signature - The function signature to potentially truncate
   * @param maxLength - Maximum allowed length
   * @returns Truncated signature with "..." if too long, or original if within limit
   */
  private truncateSignature(signature: string, maxLength: number): string {
    if (signature.length <= maxLength) {
      return signature;
    }
    return signature.substring(0, maxLength - 3) + "...";
  }

  /**
   * Format a statistic line for the summary header.
   *
   * @param label - The statistic label
   * @param value - The statistic value
   * @returns Formatted line with proper padding and borders
   */
  private formatStatLine(label: string, value: string | number): string {
    const labelPart = `${label}:`;
    const padding = " ".repeat(2);
    return this.padCell(
      `${labelPart}${padding}${value}`,
      this.HEADER_WIDTH,
      "left"
    );
  }
}
