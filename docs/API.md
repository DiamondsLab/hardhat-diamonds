# Diamond Flatten API Reference

## Overview

This document provides detailed API documentation for the Diamond Flatten feature in `@diamondslab/hardhat-diamonds`.

## Table of Contents

- [Classes](#classes)
  - [DiamondFlattener](#diamondflattener)
  - [SourceResolver](#sourceresolver)
  - [DependencyGraph](#dependencygraph)
  - [OutputFormatter](#outputformatter)
- [Interfaces](#interfaces)
- [Types](#types)
- [Hardhat Task](#hardhat-task)
- [Error Handling](#error-handling)

## Classes

### DiamondFlattener

The main class for discovering facets and building selector maps.

#### Constructor

```typescript
constructor(
  hre: HardhatRuntimeEnvironment,
  diamondName: string,
  contractsPath: string,
  verbose?: boolean
)
```

**Parameters:**
- `hre` - Hardhat Runtime Environment instance
- `diamondName` - Name of the Diamond contract
- `contractsPath` - Path to contracts directory
- `verbose` - Enable verbose logging (default: `false`)

**Example:**
```typescript
import { DiamondFlattener } from "@diamondslab/hardhat-diamonds/dist/lib/DiamondFlattener";
import hre from "hardhat";

const flattener = new DiamondFlattener(
  hre,
  "ExampleDiamond",
  "contracts/examplediamond",
  true
);
```

#### Methods

##### discoverFacets()

Discovers all facets from the Diamond configuration.

```typescript
async discoverFacets(): Promise<void>
```

**Returns:** Promise that resolves when facet discovery is complete

**Throws:** 
- `Error` if Diamond configuration is not found
- `Error` if facet contracts cannot be resolved

**Example:**
```typescript
await flattener.discoverFacets();
const facets = flattener.getFacetContracts();
console.log(`Discovered ${facets.length} facets`);
```

##### buildSelectorMap()

Builds a mapping of function selectors to their implementations.

```typescript
async buildSelectorMap(): Promise<Map<string, SelectorInfo>>
```

**Returns:** Map of selectors (hex string) to selector information

**Example:**
```typescript
const selectorMap = await flattener.buildSelectorMap();

for (const [selector, info] of selectorMap.entries()) {
  console.log(`${selector} => ${info.signature} (${info.facetName})`);
}
```

##### getFacetContracts()

Returns the list of discovered facet contracts.

```typescript
getFacetContracts(): FacetContract[]
```

**Returns:** Array of facet contract information

**Example:**
```typescript
const facets = flattener.getFacetContracts();
facets.forEach(facet => {
  console.log(`${facet.name}: ${facet.sourceName}`);
});
```

---

### SourceResolver

Handles loading and parsing of Solidity source files.

#### Constructor

```typescript
constructor(
  artifacts: Artifacts,
  verbose?: boolean
)
```

**Parameters:**
- `artifacts` - Hardhat Artifacts instance
- `verbose` - Enable verbose logging (default: `false`)

**Example:**
```typescript
import { SourceResolver } from "@diamondslab/hardhat-diamonds/dist/lib/SourceResolver";
import hre from "hardhat";

const resolver = new SourceResolver(hre.artifacts, true);
```

#### Methods

##### loadSource()

Loads the source code for a contract.

```typescript
async loadSource(sourceName: string): Promise<string>
```

**Parameters:**
- `sourceName` - Fully qualified source name (e.g., `"contracts/Facet.sol"`)

**Returns:** Source code as string

**Throws:** 
- `Error` if source file cannot be found or read

**Example:**
```typescript
const source = await resolver.loadSource("contracts/facets/FacetA.sol");
console.log(`Loaded ${source.length} characters`);
```

##### parseImports()

Parses import statements from source code.

```typescript
parseImports(source: string, currentFile: string): string[]
```

**Parameters:**
- `source` - Source code to parse
- `currentFile` - Path of the current file (for relative import resolution)

**Returns:** Array of resolved import paths

**Example:**
```typescript
const source = await resolver.loadSource("contracts/Facet.sol");
const imports = resolver.parseImports(source, "contracts/Facet.sol");

console.log("Dependencies:");
imports.forEach(imp => console.log(`  - ${imp}`));
```

##### clearCache()

Clears the internal source cache.

```typescript
clearCache(): void
```

**Example:**
```typescript
resolver.clearCache();
console.log("Source cache cleared");
```

---

### DependencyGraph

Manages contract dependencies and topological sorting.

#### Constructor

```typescript
constructor(
  resolver: SourceResolver,
  verbose?: boolean
)
```

**Parameters:**
- `resolver` - SourceResolver instance for loading sources
- `verbose` - Enable verbose logging (default: `false`)

**Example:**
```typescript
import { DependencyGraph } from "@diamondslab/hardhat-diamonds/dist/lib/DependencyGraph";

const graph = new DependencyGraph(resolver, true);
```

#### Methods

##### addRoot()

Adds a root contract to the dependency graph.

```typescript
async addRoot(sourceName: string): Promise<void>
```

**Parameters:**
- `sourceName` - Fully qualified source name

**Throws:**
- `Error` if source cannot be loaded

**Example:**
```typescript
await graph.addRoot("contracts/Diamond.sol");
await graph.addRoot("contracts/facets/FacetA.sol");
await graph.addRoot("contracts/facets/FacetB.sol");
```

##### resolveDependencies()

Resolves all dependencies for added root contracts.

```typescript
async resolveDependencies(): Promise<void>
```

**Throws:**
- `Error` if circular dependencies are detected

**Example:**
```typescript
try {
  await graph.resolveDependencies();
  console.log("✓ All dependencies resolved");
} catch (error) {
  console.error("Circular dependency detected:", error.message);
}
```

##### getSortedForFlattening()

Returns contracts sorted in dependency order for flattening.

```typescript
getSortedForFlattening(): string[]
```

**Returns:** Array of source names in topological order (dependencies first)

**Example:**
```typescript
const sortedFiles = graph.getSortedForFlattening();
console.log("Flattening order:");
sortedFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});
```

##### detectCircularDependencies()

Checks for circular dependencies in the graph.

```typescript
detectCircularDependencies(): string[] | null
```

**Returns:** Array of files in the circular dependency cycle, or `null` if none found

**Example:**
```typescript
const cycle = graph.detectCircularDependencies();
if (cycle) {
  console.error("Circular dependency detected:");
  console.error(cycle.join(" -> "));
}
```

---

### OutputFormatter

Formats and generates the final flattened output.

#### Constructor

```typescript
constructor(verbose?: boolean)
```

**Parameters:**
- `verbose` - Enable verbose logging (default: `false`)

**Example:**
```typescript
import { OutputFormatter } from "@diamondslab/hardhat-diamonds/dist/lib/OutputFormatter";

const formatter = new OutputFormatter(true);
```

#### Methods

##### generateFlattenedOutput()

Generates the complete flattened Solidity output.

```typescript
async generateFlattenedOutput(
  sortedFiles: string[],
  resolver: SourceResolver,
  selectorMap: Map<string, SelectorInfo>
): Promise<string>
```

**Parameters:**
- `sortedFiles` - Array of source names in dependency order
- `resolver` - SourceResolver instance for loading sources
- `selectorMap` - Map of function selectors to their information

**Returns:** Complete flattened source code

**Example:**
```typescript
const flattenedSource = await formatter.generateFlattenedOutput(
  sortedFiles,
  resolver,
  selectorMap
);

fs.writeFileSync("output.sol", flattenedSource);
console.log(`✓ Generated ${flattenedSource.length} characters`);
```

##### generateSelectorTable()

Generates a formatted function selector table.

```typescript
generateSelectorTable(selectorMap: Map<string, SelectorInfo>): string
```

**Parameters:**
- `selectorMap` - Map of selectors to their information

**Returns:** Formatted selector table as a multi-line comment

**Example:**
```typescript
const table = formatter.generateSelectorTable(selectorMap);
console.log(table);
```

Output:
```solidity
/*
 * Diamond Function Selector Table
 * Generated: 2026-02-02 10:30:45 UTC
 * 
 * Total Functions: 15
 * Total Facets: 3
 * 
 * FacetA:
 *   0x12345678 => setValue(uint256)
 *   0x23456789 => getValue() view returns (uint256)
 */
```

##### generateFacetHeader()

Generates a header comment for a facet section.

```typescript
generateFacetHeader(
  facetName: string,
  version?: string,
  priority?: number
): string
```

**Parameters:**
- `facetName` - Name of the facet
- `version` - Version string (optional)
- `priority` - Priority number (optional)

**Returns:** Formatted header comment

**Example:**
```typescript
const header = formatter.generateFacetHeader("FacetA", "1.0.0", 1);
console.log(header);
```

Output:
```solidity
// ============================================================
// FACET: FacetA
// Version: 1.0.0
// Priority: 1
// ============================================================
```

##### cleanSource()

Removes SPDX and pragma directives from source code.

```typescript
cleanSource(source: string): string
```

**Parameters:**
- `source` - Source code to clean

**Returns:** Cleaned source code (without SPDX/pragma)

**Example:**
```typescript
const cleaned = formatter.cleanSource(sourceCode);
// SPDX and pragma lines removed, only contract code remains
```

##### extractSPDX()

Extracts the SPDX license identifier from source code.

```typescript
extractSPDX(source: string): string | null
```

**Parameters:**
- `source` - Source code to extract from

**Returns:** SPDX identifier or `null` if not found

**Example:**
```typescript
const spdx = formatter.extractSPDX(sourceCode);
console.log(`License: ${spdx}`); // "MIT"
```

##### extractPragma()

Extracts pragma directives from source code.

```typescript
extractPragma(source: string): string[]
```

**Parameters:**
- `source` - Source code to extract from

**Returns:** Array of pragma statements

**Example:**
```typescript
const pragmas = formatter.extractPragma(sourceCode);
pragmas.forEach(p => console.log(p));
// Output: "pragma solidity ^0.8.19;"
```

---

## Interfaces

### FacetContract

Represents a facet contract in the Diamond.

```typescript
interface FacetContract {
  name: string;           // Facet contract name (e.g., "FacetA")
  sourceName: string;     // Full source path (e.g., "contracts/facets/FacetA.sol")
  priority: number;       // Facet priority for ordering
  version?: string;       // Semantic version (e.g., "1.0.0")
}
```

**Example:**
```typescript
const facet: FacetContract = {
  name: "OwnershipFacet",
  sourceName: "contracts/facets/OwnershipFacet.sol",
  priority: 1,
  version: "1.0.0"
};
```

### SelectorInfo

Information about a function selector.

```typescript
interface SelectorInfo {
  selector: string;       // 4-byte selector (hex string with 0x prefix)
  signature: string;      // Function signature (e.g., "setValue(uint256)")
  facetName: string;      // Name of the facet containing this function
  visibility?: string;    // Function visibility (external, public, etc.)
  stateMutability?: string; // State mutability (view, pure, payable, etc.)
}
```

**Example:**
```typescript
const info: SelectorInfo = {
  selector: "0x12345678",
  signature: "setValue(uint256)",
  facetName: "FacetA",
  visibility: "external",
  stateMutability: "nonpayable"
};
```

### DiamondConfig

Diamond configuration structure.

```typescript
interface DiamondConfig {
  DiamondName: string;
  DeploymentRecord?: string;
  Facets: FacetConfigEntry[];
}

interface FacetConfigEntry {
  name: string;
  priority: number;
  version?: string;
  args?: any[];
}
```

**Example:**
```typescript
const config: DiamondConfig = {
  DiamondName: "ExampleDiamond",
  DeploymentRecord: "examplediamond-deployment",
  Facets: [
    { name: "FacetA", priority: 1, version: "1.0.0" },
    { name: "FacetB", priority: 2, version: "1.0.0" }
  ]
};
```

---

## Types

### FlattenOptions

Options for the flatten operation.

```typescript
type FlattenOptions = {
  diamondName: string;    // Required: Name of Diamond to flatten
  output?: string;        // Optional: Output file path
  verbose?: boolean;      // Optional: Enable verbose logging
  network?: string;       // Optional: Network name
};
```

**Example:**
```typescript
const options: FlattenOptions = {
  diamondName: "ExampleDiamond",
  output: "flat/ExampleDiamond-flat.sol",
  verbose: true,
  network: "mainnet"
};
```

---

## Hardhat Task

### diamond:flatten

Hardhat task for flattening Diamond contracts.

#### Task Definition

```typescript
task("diamond:flatten", "Flatten a Diamond contract")
  .addParam("diamondName", "Name of the Diamond")
  .addOptionalParam("output", "Output file path")
  .addFlag("verbose", "Enable verbose logging")
  .addOptionalParam("network", "Network to use")
  .setAction(async (taskArgs, hre) => {
    // Task implementation
  });
```

#### Programmatic Usage

```typescript
import hre from "hardhat";

// Run the task
await hre.run("diamond:flatten", {
  diamondName: "ExampleDiamond",
  output: "flat/output.sol",
  verbose: true,
  network: "hardhat"
});
```

#### Task Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `diamondName` | string | Yes | Name of the Diamond to flatten |
| `output` | string | No | Output file path (default: `flat/{name}-flat.sol`) |
| `verbose` | boolean | No | Enable verbose logging (default: `false`) |
| `network` | string | No | Network name (default: `hardhat`) |

---

## Error Handling

### Error Types

The flatten feature throws specific error types for different failure scenarios:

#### Configuration Errors

```typescript
// Diamond configuration not found
throw new Error(`Diamond configuration not found: ${diamondName}`);

// Invalid configuration format
throw new Error(`Invalid Diamond configuration: ${configPath}`);

// Missing required fields
throw new Error(`Diamond configuration missing required field: ${field}`);
```

#### Contract Resolution Errors

```typescript
// Facet contract not found
throw new Error(`Facet contract not found: ${facetName}`);

// Source file not found
throw new Error(`Source file not found: ${sourceName}`);

// Artifacts not compiled
throw new Error(`Artifacts not found. Run 'npx hardhat compile' first.`);
```

#### Dependency Errors

```typescript
// Circular dependency detected
throw new Error(`Circular dependency detected: ${cycle.join(" -> ")}`);

// Unresolved import
throw new Error(`Cannot resolve import: ${importPath}`);
```

### Error Handling Examples

#### Basic Try-Catch

```typescript
try {
  await hre.run("diamond:flatten", {
    diamondName: "ExampleDiamond"
  });
} catch (error) {
  if (error.message.includes("not found")) {
    console.error("Configuration or contract not found");
    console.error("Make sure your Diamond is properly configured");
  } else if (error.message.includes("Circular dependency")) {
    console.error("Fix circular dependencies in your contracts");
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

#### Verbose Error Debugging

```typescript
try {
  const flattener = new DiamondFlattener(
    hre,
    "ExampleDiamond",
    "contracts/examplediamond",
    true // Enable verbose mode
  );
  
  await flattener.discoverFacets();
  // Verbose mode provides detailed logging
} catch (error) {
  console.error("Error during facet discovery:");
  console.error(error.stack);
}
```

#### Validation Before Flattening

```typescript
import * as fs from "fs";
import * as path from "path";

async function validateAndFlatten(diamondName: string) {
  // Validate configuration exists
  const configPath = path.join(
    "diamonds",
    diamondName,
    `${diamondName.toLowerCase()}.config.json`
  );
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration not found: ${configPath}`);
  }
  
  // Validate configuration format
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  if (!config.DiamondName || !config.Facets) {
    throw new Error("Invalid configuration format");
  }
  
  // Proceed with flattening
  await hre.run("diamond:flatten", { diamondName });
}
```

---

## Complete Usage Example

```typescript
import { DiamondFlattener } from "@diamondslab/hardhat-diamonds/dist/lib/DiamondFlattener";
import { SourceResolver } from "@diamondslab/hardhat-diamonds/dist/lib/SourceResolver";
import { DependencyGraph } from "@diamondslab/hardhat-diamonds/dist/lib/DependencyGraph";
import { OutputFormatter } from "@diamondslab/hardhat-diamonds/dist/lib/OutputFormatter";
import hre from "hardhat";
import * as fs from "fs";

async function flattenDiamondComplete(
  diamondName: string,
  outputPath: string,
  verbose: boolean = false
): Promise<void> {
  try {
    // Step 1: Initialize flattener
    const config = hre.config.diamonds.paths[diamondName];
    const flattener = new DiamondFlattener(
      hre,
      diamondName,
      config.contractsPath,
      verbose
    );
    
    // Step 2: Discover facets and build selector map
    await flattener.discoverFacets();
    const selectorMap = await flattener.buildSelectorMap();
    
    if (verbose) {
      console.log(`Discovered ${selectorMap.size} function selectors`);
    }
    
    // Step 3: Resolve dependencies
    const resolver = new SourceResolver(hre.artifacts, verbose);
    const graph = new DependencyGraph(resolver, verbose);
    
    const facetContracts = flattener.getFacetContracts();
    for (const facet of facetContracts) {
      await graph.addRoot(facet.sourceName);
    }
    
    await graph.resolveDependencies();
    
    // Step 4: Check for circular dependencies
    const cycle = graph.detectCircularDependencies();
    if (cycle) {
      throw new Error(`Circular dependency: ${cycle.join(" -> ")}`);
    }
    
    const sortedFiles = graph.getSortedForFlattening();
    
    if (verbose) {
      console.log(`Resolved ${sortedFiles.length} files`);
    }
    
    // Step 5: Generate flattened output
    const formatter = new OutputFormatter(verbose);
    const flattenedSource = await formatter.generateFlattenedOutput(
      sortedFiles,
      resolver,
      selectorMap
    );
    
    // Step 6: Write to file
    fs.writeFileSync(outputPath, flattenedSource);
    
    console.log(`✓ Flattened Diamond written to: ${outputPath}`);
    console.log(`  Total size: ${flattenedSource.length} characters`);
    console.log(`  Total functions: ${selectorMap.size}`);
    console.log(`  Total files: ${sortedFiles.length}`);
    
  } catch (error) {
    console.error(`Failed to flatten ${diamondName}:`, error.message);
    if (verbose) {
      console.error(error.stack);
    }
    throw error;
  }
}

// Usage
flattenDiamondComplete(
  "ExampleDiamond",
  "flat/ExampleDiamond-flat.sol",
  true
);
```

---

## Version History

- **v1.0.0** - Initial release with flatten functionality
  - DiamondFlattener class
  - SourceResolver with caching
  - DependencyGraph with circular dependency detection
  - OutputFormatter with selector table generation

---

## See Also

- [FLATTEN.md](FLATTEN.md) - User guide and examples
- [EXAMPLES.md](EXAMPLES.md) - Complete usage examples
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
