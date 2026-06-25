# Diamond Flatten API Documentation

## Overview

The Diamond Flatten feature provides both CLI and programmatic interfaces for flattening ERC-2535 Diamond proxy contracts into single Solidity files. This is useful for contract verification on block explorers, auditing, and understanding the complete contract structure.

## Table of Contents

- [CLI Usage](#cli-usage)
- [Programmatic API](#programmatic-api)
- [Error Handling](#error-handling)
- [Configuration](#configuration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## CLI Usage

### Basic Command

```bash
npx hardhat diamond:flatten --diamond-name <DiamondName>
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `--diamond-name` | string | ✅ Yes | - | Name of the Diamond to flatten |
| `--output` | string | ❌ No | stdout | Path to save flattened source file |
| `--flatten-verbose` | boolean | ❌ No | `false` | Enable verbose logging and show summary |
| `--target-network` | string | ❌ No | Current network | Target network for Diamond deployment |

### Examples

#### 1. Output to stdout (default)

```bash
npx hardhat diamond:flatten --diamond-name ExampleDiamond
```

**Output:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ... flattened source code ...
```

#### 2. Save to file

```bash
npx hardhat diamond:flatten --diamond-name ExampleDiamond --output ./flattened/ExampleDiamond.sol
```

**Output:**
```
Flattened source written to: /path/to/project/flattened/ExampleDiamond.sol

=================================
Flattening Summary
=================================
Facets:               5
Selectors:            42
Contracts:            18
Lines:                2,456
Deduplicated:         3
Execution Time:       1.234s
=================================
```

#### 3. Verbose mode with stdout

```bash
npx hardhat diamond:flatten --diamond-name ExampleDiamond --flatten-verbose
```

**Output:**
```
Initializing DiamondFlattener for ExampleDiamond
✓ Diamond configuration loaded for ExampleDiamond
Discovering facets for ExampleDiamond...
  ✓ Discovered DiamondCutFacet (priority: 10, init: false)
  ✓ Discovered DiamondLoupeFacet (priority: 20, init: false)
  ... more facets ...
✓ Discovered 5 facets
Building selector map for 5 facets...
  Processing facet: DiamondCutFacet
    ✓ Found 5 selectors
  ... more facets ...
✓ Built selector map with 42 selectors

// ... flattened source code ...

=================================
Flattening Summary
=================================
Facets:               5
Selectors:            42
Contracts:            18
Lines:                2,456
Deduplicated:         3
Execution Time:       1.234s
=================================

⚠ Warnings:
   - Some external dependencies could not be resolved
   - Using fallback import resolution for @openzeppelin/contracts
```

#### 4. Specify target network

```bash
npx hardhat diamond:flatten --diamond-name ExampleDiamond --target-network sepolia --output ./verified/sepolia-diamond.sol
```

## Programmatic API

### Function: `flattenDiamond()`

Flatten a Diamond contract programmatically from your scripts or other Hardhat tasks.

#### Import

```typescript
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";
```

#### Signature

```typescript
async function flattenDiamond(
  hre: HardhatRuntimeEnvironment,
  options: Partial<DiamondFlattenOptions>
): Promise<DiamondFlattenResult>
```

#### Parameters

##### `hre` (Required)
The Hardhat Runtime Environment object. Pass `hre` from your task or script.

```typescript
import hre from "hardhat";
const result = await flattenDiamond(hre, { ... });
```

##### `options` (Required)
Configuration options for flattening. All fields except `diamondName` are optional and will use defaults from HRE config.

```typescript
interface DiamondFlattenOptions {
  diamondName: string;          // Required: Name of Diamond to flatten
  outputPath?: string;          // Optional: File path to write output
  networkName?: string;         // Optional: Target network (defaults to current)
  chainId?: number;            // Optional: Chain ID (defaults to current network)
  verbose?: boolean;           // Optional: Enable verbose logging (default: false)
}
```

#### Return Value

```typescript
interface DiamondFlattenResult {
  flattenedSource: string;                      // Complete flattened Solidity source
  facets: Array<{                               // Array of discovered facets
    name: string;
    priority: number;
    init: boolean;
    sourcePath?: string;
  }>;
  selectorMap: Record<string, SelectorInfo>;   // Mapping of selector => function info
  warnings: string[];                           // Non-critical warnings
  stats: FlattenStats;                         // Execution statistics
}

interface FlattenStats {
  totalFacets: number;              // Number of facets processed
  totalSelectors: number;           // Total function selectors extracted
  totalContracts: number;           // Total contracts included in flattened output
  totalLines: number;               // Total lines in flattened output
  deduplicatedContracts: number;    // Number of duplicate contracts removed
  executionTimeMs: number;          // Execution time in milliseconds
}
```

### Usage Examples

#### Example 1: Basic Programmatic Flattening

```typescript
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";
import hre from "hardhat";

async function flattenMyDiamond() {
  try {
    const result = await flattenDiamond(hre, {
      diamondName: "ExampleDiamond"
    });

    console.log(`Flattened ${result.stats.totalFacets} facets`);
    console.log(`Total selectors: ${result.stats.totalSelectors}`);
    console.log(`Output length: ${result.flattenedSource.length} characters`);
    
    // Use the flattened source
    console.log(result.flattenedSource);
    
  } catch (error) {
    console.error("Flattening failed:", error.message);
  }
}
```

#### Example 2: Save to File with Custom Path

```typescript
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

async function flattenAndSave() {
  const result = await flattenDiamond(hre, {
    diamondName: "MyDiamond",
    verbose: true
  });

  // Save to custom location
  const outputPath = path.join(__dirname, "../verified", "MyDiamond-flat.sol");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.flattenedSource, "utf-8");

  console.log(`Saved flattened source to: ${outputPath}`);
  console.log(`Execution time: ${result.stats.executionTimeMs}ms`);
}
```

#### Example 3: Handle Warnings

```typescript
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";
import hre from "hardhat";

async function flattenWithWarnings() {
  const result = await flattenDiamond(hre, {
    diamondName: "ExampleDiamond",
    verbose: true
  });

  // Check for warnings
  if (result.warnings.length > 0) {
    console.warn(`⚠ Flattening completed with ${result.warnings.length} warnings:`);
    result.warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  } else {
    console.log("✓ Flattening completed without warnings");
  }

  return result;
}
```

#### Example 4: Inspect Facets and Selectors

```typescript
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";
import hre from "hardhat";

async function analyzeDiamond() {
  const result = await flattenDiamond(hre, {
    diamondName: "ExampleDiamond"
  });

  console.log("=== Diamond Analysis ===");
  
  // List all facets
  console.log("\nFacets:");
  result.facets.forEach(facet => {
    console.log(`  - ${facet.name} (priority: ${facet.priority}, init: ${facet.init})`);
  });

  // List all selectors
  console.log("\nSelectors:");
  Object.entries(result.selectorMap).forEach(([selector, info]) => {
    console.log(`  ${selector}: ${info.signature}`);
  });

  // Show deduplication savings
  const deduped = result.stats.deduplicatedContracts;
  if (deduped > 0) {
    console.log(`\n✓ Removed ${deduped} duplicate contracts`);
  }
}
```

#### Example 5: Multi-Network Flattening

```typescript
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

async function flattenForAllNetworks() {
  const networks = ["mainnet", "sepolia", "polygon"];
  const diamondName = "MyDiamond";

  for (const network of networks) {
    console.log(`Flattening for ${network}...`);
    
    const result = await flattenDiamond(hre, {
      diamondName,
      networkName: network
    });

    const outputPath = path.join(__dirname, "../flattened", `${diamondName}-${network}.sol`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, result.flattenedSource, "utf-8");

    console.log(`  ✓ Saved to: ${outputPath}`);
    console.log(`  Facets: ${result.stats.totalFacets}, Selectors: ${result.stats.totalSelectors}`);
  }
}
```

## Error Handling

### Error Types

The Diamond Flatten feature uses a custom `FlattenError` class that extends the standard JavaScript `Error` with additional context.

#### FlattenError Structure

```typescript
class FlattenError extends Error {
  code: string;                      // Error code (see below)
  suggestion?: string;               // Helpful suggestion to fix the error
  context?: Record<string, any>;     // Additional error context
  stack?: string;                    // Stack trace
}
```

### Error Codes

| Error Code | Description | Common Causes | Suggested Fixes |
|------------|-------------|---------------|-----------------|
| `DIAMOND_NOT_FOUND` | Diamond configuration not found | Typo in diamond name, missing config | Check `hardhat.config.ts`, verify diamond name |
| `FACET_SOURCE_NOT_FOUND` | Facet source file not found | Facet not compiled, incorrect path | Run `npx hardhat compile`, check facet paths |
| `DEPENDENCY_RESOLUTION_FAILED` | Failed to resolve contract dependencies | Missing imports, incorrect paths | Verify import paths, check node_modules |
| `CIRCULAR_DEPENDENCY` | Circular dependency detected | Contracts import each other circularly | Refactor contract structure |
| `FILE_WRITE_FAILED` | Failed to write output file | Permission denied, disk full | Check file permissions, disk space |
| `VALIDATION_FAILED` | Input validation failed | Invalid parameters | Check parameter values and types |

### Error Handling Examples

#### Example 1: Catch and Handle Errors

```typescript
import { flattenDiamond, FlattenError } from "@diamondslab/hardhat-diamonds";
import hre from "hardhat";

async function safelyFlattenDiamond() {
  try {
    const result = await flattenDiamond(hre, {
      diamondName: "ExampleDiamond"
    });
    return result;
    
  } catch (error) {
    if (error instanceof FlattenError) {
      console.error(`Flattening Error [${error.code}]: ${error.message}`);
      
      if (error.suggestion) {
        console.error(`Suggestion: ${error.suggestion}`);
      }
      
      if (error.context) {
        console.error("Context:", error.context);
      }
    } else {
      console.error("Unexpected error:", error);
    }
    
    throw error;
  }
}
```

#### Example 2: Error Code Specific Handling

```typescript
import { flattenDiamond, FlattenError, FlattenErrorCode } from "@diamondslab/hardhat-diamonds";
import hre from "hardhat";

async function flattenWithRetry() {
  try {
    return await flattenDiamond(hre, {
      diamondName: "ExampleDiamond"
    });
    
  } catch (error) {
    if (error instanceof FlattenError) {
      switch (error.code) {
        case FlattenErrorCode.DIAMOND_NOT_FOUND:
          console.error("Diamond not found. Available diamonds:");
          // List available diamonds from config
          Object.keys(hre.config.diamonds?.paths || {}).forEach(name => {
            console.error(`  - ${name}`);
          });
          break;
          
        case FlattenErrorCode.FACET_SOURCE_NOT_FOUND:
          console.error("Facet source not found. Running compilation...");
          await hre.run("compile");
          // Retry after compilation
          return await flattenDiamond(hre, { diamondName: "ExampleDiamond" });
          
        case FlattenErrorCode.FILE_WRITE_FAILED:
          console.error("Cannot write file. Trying alternative path...");
          // Retry with different output path
          return await flattenDiamond(hre, {
            diamondName: "ExampleDiamond",
            outputPath: "/tmp/diamond-flat.sol"
          });
          
        default:
          console.error(`Error [${error.code}]: ${error.message}`);
      }
    }
    
    throw error;
  }
}
```

## Configuration

### Hardhat Config

Configure Diamond paths in `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@diamondslab/hardhat-diamonds";

const config: HardhatUserConfig = {
  diamonds: {
    paths: {
      ExampleDiamond: {
        deploymentsPath: "diamonds",
        contractsPath: "contracts/examplediamond",
      },
      MyDiamond: {
        deploymentsPath: "deployments/diamonds",
        contractsPath: "contracts/mydiamond",
      },
    },
  },
};

export default config;
```

### Diamond Configuration File

Each Diamond has a configuration file at `<deploymentsPath>/<DiamondName>/<diamondname>.config.json`:

```json
{
  "facets": [
    {
      "name": "DiamondCutFacet",
      "priority": 10,
      "init": false
    },
    {
      "name": "DiamondLoupeFacet",
      "priority": 20,
      "init": false
    },
    {
      "name": "OwnershipFacet",
      "priority": 30,
      "init": false
    },
    {
      "name": "InitFacet",
      "priority": 40,
      "init": true
    }
  ]
}
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Diamond configuration for 'X' not found"

**Cause:** Diamond name typo or not configured in `hardhat.config.ts`

**Solution:**
1. Check diamond name spelling (case-sensitive)
2. Verify `hardhat.config.ts` has the Diamond configured:
   ```typescript
   diamonds: {
     paths: {
       YourDiamondName: {
         deploymentsPath: "diamonds",
         contractsPath: "contracts/yourdiamond",
       },
     },
   }
   ```
3. List available diamonds:
   ```bash
   # In your code:
   console.log(Object.keys(hre.config.diamonds?.paths || {}));
   ```

#### Issue: "Facet source file not found"

**Cause:** Contracts not compiled or facet path incorrect

**Solution:**
1. Compile contracts first:
   ```bash
   npx hardhat compile
   ```
2. Check facet is in the configured `contractsPath`
3. Verify facet name matches the contract file name exactly

#### Issue: "Cannot find package 'contracts' imported from..."

**Cause:** Import path resolution failure for dependencies

**Solution:**
1. Install missing dependencies:
   ```bash
   npm install @openzeppelin/contracts
   ```
2. Verify `node_modules` exists and is populated
3. Check import paths in facet contracts match installed packages

#### Issue: "File write failed: ENOENT: no such file or directory"

**Cause:** Parent directory doesn't exist

**Solution:**
The tool automatically creates parent directories, but if you're using the programmatic API and writing manually:
```typescript
import * as fs from "fs";
import * as path from "path";

const outputPath = "./deep/nested/path/output.sol";
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, result.flattenedSource);
```

#### Issue: Circular dependency errors

**Cause:** Contracts import each other in a circular pattern (A imports B, B imports A)

**Solution:**
1. Refactor contract structure to break circular dependencies
2. Use interfaces to break circular references
3. Move shared code to a separate library contract

#### Issue: Slow execution time

**Cause:** Large Diamond with many facets and dependencies

**Solution:**
1. Check execution time in stats:
   ```typescript
   console.log(`Execution time: ${result.stats.executionTimeMs}ms`);
   ```
2. Enable verbose mode to see which step is slow
3. Consider optimizing contract dependency structure

#### Issue: Output file very large

**Cause:** Many dependencies or duplicated code

**Solution:**
1. Check deduplication savings:
   ```typescript
   console.log(`Deduplicated ${result.stats.deduplicatedContracts} contracts`);
   ```
2. Consider using libraries or interfaces to reduce duplication
3. Review which contracts are being included:
   ```typescript
   console.log(`Total contracts: ${result.stats.totalContracts}`);
   console.log(`Total lines: ${result.stats.totalLines}`);
   ```

### Getting Help

If you encounter issues not covered here:

1. **Enable verbose mode** to see detailed execution logs:
   ```bash
   npx hardhat diamond:flatten --diamond-name YourDiamond --flatten-verbose
   ```

2. **Check the warnings** - they often contain helpful hints:
   ```typescript
   result.warnings.forEach(warning => console.warn(warning));
   ```

3. **Review error suggestions** - FlattenError includes suggestions:
   ```typescript
   catch (error) {
     if (error.suggestion) {
       console.log("Suggested fix:", error.suggestion);
     }
   }
   ```

4. **Open an issue** on GitHub with:
   - Diamond configuration
   - Error message and stack trace
   - Hardhat version and environment details

## Advanced Usage

### Integration with CI/CD

```yaml
# GitHub Actions example
- name: Flatten Diamond for Verification
  run: |
    npx hardhat diamond:flatten \
      --diamond-name MainDiamond \
      --output ./verified/MainDiamond-flat.sol \
      --flatten-verbose
    
- name: Upload flattened contract
  uses: actions/upload-artifact@v3
  with:
    name: flattened-contracts
    path: verified/*.sol
```

### Scripted Multi-Diamond Flattening

```typescript
// scripts/flatten-all-diamonds.ts
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

async function flattenAllDiamonds() {
  const diamondNames = Object.keys(hre.config.diamonds?.paths || {});
  
  for (const diamondName of diamondNames) {
    console.log(`Flattening ${diamondName}...`);
    
    try {
      const result = await flattenDiamond(hre, {
        diamondName,
        verbose: true
      });

      const outputPath = path.join(
        __dirname,
        "../flattened",
        `${diamondName}-flat.sol`
      );
      
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, result.flattenedSource, "utf-8");

      console.log(`  ✓ Success: ${result.stats.totalFacets} facets, ${result.stats.totalSelectors} selectors`);
      console.log(`  ✓ Saved to: ${outputPath}\n`);
      
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}\n`);
    }
  }
}

flattenAllDiamonds()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### Custom Post-Processing

```typescript
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";
import hre from "hardhat";

async function flattenWithCustomProcessing() {
  const result = await flattenDiamond(hre, {
    diamondName: "ExampleDiamond"
  });

  // Custom post-processing
  let processed = result.flattenedSource;

  // Add custom header
  const header = `/**
   * Flattened Diamond: ExampleDiamond
   * Generated: ${new Date().toISOString()}
   * Facets: ${result.stats.totalFacets}
   * Selectors: ${result.stats.totalSelectors}
   */\n\n`;
  
  processed = header + processed;

  // Remove comments (example)
  processed = processed.replace(/\/\/.*$/gm, "");
  processed = processed.replace(/\/\*[\s\S]*?\*\//g, "");

  // Save processed version
  fs.writeFileSync("./flattened-processed.sol", processed);
}
```

## API Reference Summary

### Functions

- [`flattenDiamond(hre, options)`](#function-flattenDiamond) - Flatten a Diamond contract programmatically

### Types

- [`DiamondFlattenOptions`](#parameters) - Options for flattening
- [`DiamondFlattenResult`](#return-value) - Result of flattening operation
- [`FlattenStats`](#return-value) - Execution statistics
- [`FlattenError`](#error-types) - Custom error class
- [`FlattenErrorCode`](#error-codes) - Error code constants

### Error Codes

- `DIAMOND_NOT_FOUND` - Diamond configuration not found
- `FACET_SOURCE_NOT_FOUND` - Facet source file not found
- `DEPENDENCY_RESOLUTION_FAILED` - Failed to resolve dependencies
- `CIRCULAR_DEPENDENCY` - Circular dependency detected
- `FILE_WRITE_FAILED` - Failed to write output file
- `VALIDATION_FAILED` - Input validation failed

---

*For more information, see the [Hardhat Diamonds README](../README.md) and [Project Overview](../docs/PROJECT_OVERVIEW.md).*
