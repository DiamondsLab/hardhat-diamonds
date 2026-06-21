# Diamond Flatten Troubleshooting Guide

This guide helps you diagnose and fix common issues when using the Diamond Flatten feature.

## Table of Contents

- [Configuration Issues](#configuration-issues)
- [Contract Resolution Issues](#contract-resolution-issues)
- [Dependency Issues](#dependency-issues)
- [Output Issues](#output-issues)
- [Performance Issues](#performance-issues)
- [Network Issues](#network-issues)

---

## Configuration Issues

### Issue: "Diamond configuration not found"

**Error Message:**
```
Error: Diamond configuration not found: ExampleDiamond
```

**Cause:**
The flatten tool cannot find the Diamond configuration file.

**Solutions:**

1. **Verify file exists:**
   ```bash
   ls diamonds/ExampleDiamond/examplediamond.config.json
   ```

2. **Check configuration path in hardhat.config.ts:**
   ```typescript
   diamonds: {
     paths: {
       ExampleDiamond: {
         deploymentsPath: 'diamonds',  // Should point to diamonds/
         contractsPath: 'contracts/examplediamond',
       },
     },
   }
   ```

3. **Verify naming convention:**
   - Configuration file name should be lowercase: `examplediamond.config.json`
   - Diamond name parameter should match: `--diamond-name ExampleDiamond`

4. **Use absolute paths if relative paths fail:**
   ```typescript
   import path from "path";
   
   diamonds: {
     paths: {
       ExampleDiamond: {
         deploymentsPath: path.join(__dirname, 'diamonds'),
         contractsPath: path.join(__dirname, 'contracts/examplediamond'),
       },
     },
   }
   ```

---

### Issue: "Invalid Diamond configuration format"

**Error Message:**
```
Error: Invalid Diamond configuration: missing required field 'DiamondName'
```

**Cause:**
The configuration file is missing required fields or has incorrect format.

**Solutions:**

1. **Verify JSON syntax:**
   ```bash
   npx jsonlint diamonds/ExampleDiamond/examplediamond.config.json
   ```

2. **Check required fields:**
   ```json
   {
     "DiamondName": "ExampleDiamond",  // Required
     "Facets": [                        // Required
       {
         "name": "FacetA",              // Required
         "priority": 1                   // Required
       }
     ]
   }
   ```

3. **Complete example configuration:**
   ```json
   {
     "DiamondName": "ExampleDiamond",
     "DeploymentRecord": "examplediamond-deployment",
     "Facets": [
       {
         "name": "FacetA",
         "priority": 1,
         "version": "1.0.0"
       }
     ]
   }
   ```

4. **Validate with schema:**
   ```bash
   # Create a validation script
   node -e "
   const config = require('./diamonds/ExampleDiamond/examplediamond.config.json');
   console.assert(config.DiamondName, 'Missing DiamondName');
   console.assert(Array.isArray(config.Facets), 'Facets must be array');
   console.log('✓ Configuration is valid');
   "
   ```

---

### Issue: "Facet priority conflicts"

**Error Message:**
```
Warning: Multiple facets with same priority
```

**Cause:**
Two or more facets have the same priority value.

**Solutions:**

1. **Assign unique priorities:**
   ```json
   {
     "Facets": [
       { "name": "FacetA", "priority": 1 },
       { "name": "FacetB", "priority": 2 },  // Not 1
       { "name": "FacetC", "priority": 3 }   // Not 1 or 2
     ]
   }
   ```

2. **Use priority ranges:**
   ```json
   {
     "Facets": [
       { "name": "CoreFacet", "priority": 10 },
       { "name": "SecurityFacet", "priority": 20 },
       { "name": "BusinessFacet", "priority": 30 }
     ]
   }
   ```
   This allows inserting new facets between existing ones.

---

## Contract Resolution Issues

### Issue: "Facet contract not found"

**Error Message:**
```
Error: Facet contract not found: FacetA
```

**Cause:**
The flatten tool cannot locate the facet contract file.

**Solutions:**

1. **Verify contract file exists:**
   ```bash
   find contracts -name "FacetA.sol"
   ```

2. **Check contracts path:**
   ```typescript
   // hardhat.config.ts
   diamonds: {
     paths: {
       ExampleDiamond: {
         contractsPath: 'contracts/examplediamond',  // Must contain facets/
       },
     },
   }
   ```

3. **Verify directory structure:**
   ```
   contracts/examplediamond/
   ├── ExampleDiamond.sol
   └── facets/
       ├── FacetA.sol  ← Must exist here
       ├── FacetB.sol
       └── FacetC.sol
   ```

4. **Check facet naming:**
   - Configuration: `"name": "FacetA"`
   - File name: `FacetA.sol` (must match exactly, case-sensitive)
   - Contract name: `contract FacetA` (should match file name)

5. **Compile contracts first:**
   ```bash
   npx hardhat clean
   npx hardhat compile
   npx hardhat diamond:flatten --diamond-name ExampleDiamond
   ```

---

### Issue: "Source file not found"

**Error Message:**
```
Error: Source file not found: contracts/libraries/LibAppStorage.sol
```

**Cause:**
A referenced source file is missing or the path is incorrect.

**Solutions:**

1. **Verify file exists:**
   ```bash
   ls contracts/libraries/LibAppStorage.sol
   ```

2. **Check import statements:**
   ```solidity
   // In FacetA.sol
   import "../libraries/LibAppStorage.sol";  // Check path is correct
   ```

3. **Use absolute imports:**
   ```solidity
   // Instead of:
   import "../../contracts/libraries/LibAppStorage.sol";
   
   // Use:
   import "contracts/libraries/LibAppStorage.sol";
   ```

4. **Configure import remappings in hardhat.config.ts:**
   ```typescript
   import "@nomiclabs/hardhat-solc";
   
   const config: HardhatUserConfig = {
     solidity: {
       version: "0.8.19",
       settings: {
         remappings: [
           "@openzeppelin/=node_modules/@openzeppelin/",
           "contracts/=contracts/"
         ]
       }
     }
   };
   ```

---

### Issue: "Artifacts not found"

**Error Message:**
```
Error: Artifacts not found. Run 'npx hardhat compile' first.
```

**Cause:**
Contracts haven't been compiled, so artifacts don't exist.

**Solutions:**

1. **Compile contracts:**
   ```bash
   npx hardhat compile
   ```

2. **Clean and recompile if corrupted:**
   ```bash
   npx hardhat clean
   rm -rf artifacts cache
   npx hardhat compile
   ```

3. **Check artifacts directory:**
   ```bash
   ls artifacts/contracts/
   ```

4. **Verify Hardhat version:**
   ```bash
   npx hardhat --version  # Should be >=2.12.0
   ```

---

## Dependency Issues

### Issue: "Circular dependency detected"

**Error Message:**
```
Error: Circular dependency detected: A.sol -> B.sol -> C.sol -> A.sol
```

**Cause:**
Contracts have circular import dependencies.

**Solutions:**

1. **Use verbose mode to identify the cycle:**
   ```bash
   npx hardhat diamond:flatten --diamond-name ExampleDiamond --verbose
   ```

2. **Break the circular dependency:**
   
   **Before (circular):**
   ```solidity
   // A.sol
   import "./B.sol";
   
   // B.sol
   import "./C.sol";
   
   // C.sol
   import "./A.sol";  // ← Circular!
   ```
   
   **After (fixed):**
   ```solidity
   // Extract shared code to a new file
   // Common.sol
   contract Common {
     // Shared functionality
   }
   
   // A.sol
   import "./Common.sol";
   
   // B.sol
   import "./Common.sol";
   
   // C.sol
   import "./Common.sol";  // No circular dependency
   ```

3. **Use interfaces instead of imports:**
   ```solidity
   // Instead of importing the full contract:
   import "./ContractA.sol";
   
   // Use an interface:
   interface IContractA {
     function someFunction() external returns (uint256);
   }
   ```

4. **Refactor to use libraries:**
   ```solidity
   // SharedLib.sol
   library SharedLib {
     function sharedLogic() internal pure returns (uint256) {
       // ...
     }
   }
   
   // A.sol
   import "./SharedLib.sol";
   contract A {
     using SharedLib for *;
   }
   
   // B.sol
   import "./SharedLib.sol";
   contract B {
     using SharedLib for *;
   }
   ```

---

### Issue: "Cannot resolve OpenZeppelin import"

**Error Message:**
```
Error: Cannot resolve import: @openzeppelin/contracts/access/Ownable.sol
```

**Cause:**
OpenZeppelin contracts are not installed or import path is incorrect.

**Solutions:**

1. **Install OpenZeppelin:**
   ```bash
   yarn add @openzeppelin/contracts
   # or
   npm install @openzeppelin/contracts
   ```

2. **Verify installation:**
   ```bash
   ls node_modules/@openzeppelin/contracts/access/Ownable.sol
   ```

3. **Check package.json:**
   ```json
   {
     "dependencies": {
       "@openzeppelin/contracts": "^4.9.0"
     }
   }
   ```

4. **Verify import statement:**
   ```solidity
   // Correct:
   import "@openzeppelin/contracts/access/Ownable.sol";
   
   // Incorrect:
   import "openzeppelin/contracts/access/Ownable.sol";  // Missing @
   ```

5. **Configure Hardhat for OpenZeppelin:**
   ```typescript
   // hardhat.config.ts
   const config: HardhatUserConfig = {
     solidity: {
       version: "0.8.19",
       settings: {
         optimizer: {
           enabled: true,
           runs: 200
         }
       }
     },
     paths: {
       sources: "./contracts",
       artifacts: "./artifacts",
       cache: "./cache"
     }
   };
   ```

---

### Issue: "Duplicate dependency in output"

**Error Message:**
```
Warning: Duplicate source detected: contracts/libraries/SafeMath.sol
```

**Cause:**
The same library or contract is imported multiple times.

**Solutions:**

This is actually **not an error** - the flatten tool automatically deduplicates sources. However, if you want to verify:

1. **Check the flattened output:**
   ```bash
   grep -n "contract SafeMath" flat/ExampleDiamond-flat.sol
   ```
   Should only appear once.

2. **Verify deduplication with verbose mode:**
   ```bash
   npx hardhat diamond:flatten --diamond-name ExampleDiamond --verbose
   ```
   Look for messages like:
   ```
   [DependencyGraph] Skipping duplicate: contracts/libraries/SafeMath.sol
   ```

---

## Output Issues

### Issue: "Empty output file generated"

**Error Message:**
```
Error: Generated flattened output is empty
```

**Cause:**
No facets were discovered or processing failed silently.

**Solutions:**

1. **Check facet configuration:**
   ```json
   {
     "DiamondName": "ExampleDiamond",
     "Facets": [  // Must not be empty
       { "name": "FacetA", "priority": 1 }
     ]
   }
   ```

2. **Use verbose mode:**
   ```bash
   npx hardhat diamond:flatten --diamond-name ExampleDiamond --verbose
   ```

3. **Verify facets exist:**
   ```bash
   ls contracts/examplediamond/facets/
   ```

4. **Check for compilation errors:**
   ```bash
   npx hardhat compile
   ```

---

### Issue: "Function selector table is empty"

**Cause:**
No public/external functions were found in facets.

**Solutions:**

1. **Verify facets have external functions:**
   ```solidity
   contract FacetA {
     // This won't appear (internal)
     function internalFunc() internal pure returns (uint256) { }
     
     // This will appear (external)
     function externalFunc() external pure returns (uint256) { }
   }
   ```

2. **Check function visibility:**
   ```solidity
   // Selector table includes:
   - external functions
   - public functions
   
   // Selector table excludes:
   - internal functions
   - private functions
   - constructor
   ```

3. **Use verbose mode to see discovered functions:**
   ```bash
   npx hardhat diamond:flatten --diamond-name ExampleDiamond --verbose
   ```

---

### Issue: "SPDX license conflicts"

**Error Message:**
```
Warning: Multiple SPDX licenses found: MIT, GPL-3.0
```

**Cause:**
Different contracts use different SPDX licenses.

**Solutions:**

1. **Standardize on one license:**
   ```solidity
   // All contracts should use the same license
   // SPDX-License-Identifier: MIT
   ```

2. **Use the most permissive license:**
   If mixing licenses, use the most restrictive one that's compatible:
   ```
   MIT → Apache-2.0 → GPL-3.0
   (most permissive)  (most restrictive)
   ```

3. **Document mixed licenses:**
   ```solidity
   /*
    * This contract includes code from multiple sources:
    * - MIT: FacetA, FacetB
    * - Apache-2.0: OpenZeppelin contracts
    * - GPL-3.0: ThirdPartyLibrary
    * 
    * Overall license: GPL-3.0 (most restrictive)
    */
   // SPDX-License-Identifier: GPL-3.0
   ```

---

### Issue: "Pragma version conflicts"

**Error Message:**
```
Warning: Multiple pragma versions: ^0.8.19, ^0.8.17
```

**Cause:**
Different contracts use different Solidity versions.

**Solutions:**

1. **Standardize pragma version:**
   ```solidity
   // All contracts should use the same version
   pragma solidity ^0.8.19;
   ```

2. **Use a compatible range:**
   ```solidity
   // If contracts must differ, use a compatible range
   pragma solidity >=0.8.17 <0.9.0;
   ```

3. **Update dependency versions:**
   ```bash
   # Update OpenZeppelin to latest compatible version
   yarn upgrade @openzeppelin/contracts@^4.9.0
   ```

---

## Performance Issues

### Issue: "Flattening takes too long"

**Symptoms:**
Flatten operation takes more than 30 seconds.

**Solutions:**

1. **Enable caching:**
   The SourceResolver automatically caches sources, but ensure artifacts are not being regenerated:
   ```bash
   # Don't clean unnecessarily
   npx hardhat compile  # Only if needed
   npx hardhat diamond:flatten --diamond-name ExampleDiamond
   ```

2. **Reduce dependency tree:**
   - Remove unused imports
   - Consolidate libraries
   - Use interfaces instead of full contract imports

3. **Check for unnecessary recompilation:**
   ```bash
   # Check if artifacts are up to date
   ls -la artifacts/contracts/
   ```

4. **Profile the operation:**
   ```bash
   time npx hardhat diamond:flatten --diamond-name ExampleDiamond --verbose
   ```

5. **Optimize contract structure:**
   ```
   contracts/
   ├── core/         # Core contracts (rarely change)
   ├── facets/       # Facets (change often)
   └── libraries/    # Shared libraries (rarely change)
   ```

---

### Issue: "Out of memory error"

**Error Message:**
```
JavaScript heap out of memory
```

**Cause:**
Very large Diamond with many dependencies exhausts Node.js memory.

**Solutions:**

1. **Increase Node.js memory:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npx hardhat diamond:flatten --diamond-name ExampleDiamond
   ```

2. **Add to package.json scripts:**
   ```json
   {
     "scripts": {
       "flatten": "NODE_OPTIONS='--max-old-space-size=4096' hardhat diamond:flatten"
     }
   }
   ```

3. **Reduce Diamond size:**
   - Split into multiple smaller Diamonds
   - Remove unused dependencies
   - Use libraries more efficiently

---

## Network Issues

### Issue: "Network not configured"

**Error Message:**
```
Error: Network 'mainnet' not found in configuration
```

**Cause:**
The specified network is not defined in hardhat.config.ts.

**Solutions:**

1. **Add network to configuration:**
   ```typescript
   // hardhat.config.ts
   const config: HardhatUserConfig = {
     networks: {
       mainnet: {
         url: process.env.MAINNET_RPC_URL,
         accounts: [process.env.PRIVATE_KEY!]
       },
       sepolia: {
         url: process.env.SEPOLIA_RPC_URL,
         accounts: [process.env.PRIVATE_KEY!]
       }
     }
   };
   ```

2. **Use default network:**
   ```bash
   # Omit --network flag to use default (hardhat)
   npx hardhat diamond:flatten --diamond-name ExampleDiamond
   ```

3. **Check available networks:**
   ```bash
   npx hardhat network
   ```

---

### Issue: "RPC connection timeout"

**Error Message:**
```
Error: timeout of 20000ms exceeded
```

**Cause:**
Network RPC endpoint is slow or unavailable (only affects network-specific operations).

**Solutions:**

1. **Use local network:**
   ```bash
   # Flattening doesn't require network connection
   npx hardhat diamond:flatten --diamond-name ExampleDiamond --network hardhat
   ```

2. **Increase timeout:**
   ```typescript
   // hardhat.config.ts
   const config: HardhatUserConfig = {
     networks: {
       mainnet: {
         url: process.env.MAINNET_RPC_URL,
         timeout: 60000  // 60 seconds
       }
     }
   };
   ```

3. **Use alternative RPC provider:**
   ```bash
   export MAINNET_RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"
   ```

---

## Advanced Troubleshooting

### Enable Debug Logging

Create a custom script with debug logging:

```typescript
// scripts/debug-flatten.ts
import { DiamondFlattener } from "@diamondslab/hardhat-diamonds/dist/lib/DiamondFlattener";
import hre from "hardhat";

async function main() {
  console.log("=== Debug Flatten ===\n");
  
  const diamondName = "ExampleDiamond";
  const config = hre.config.diamonds.paths[diamondName];
  
  console.log("Configuration:");
  console.log(JSON.stringify(config, null, 2));
  
  try {
    const flattener = new DiamondFlattener(
      hre,
      diamondName,
      config.contractsPath,
      true  // verbose = true
    );
    
    console.log("\n1. Discovering facets...");
    await flattener.discoverFacets();
    
    const facets = flattener.getFacetContracts();
    console.log(`   Found ${facets.length} facets:`);
    facets.forEach(f => console.log(`   - ${f.name}: ${f.sourceName}`));
    
    console.log("\n2. Building selector map...");
    const selectorMap = await flattener.buildSelectorMap();
    console.log(`   Found ${selectorMap.size} selectors`);
    
    console.log("\n✓ Debug complete");
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error(error.stack);
  }
}

main();
```

Run:
```bash
npx hardhat run scripts/debug-flatten.ts
```

---

### Validate Configuration

Script to validate Diamond configuration:

```typescript
// scripts/validate-config.ts
import * as fs from "fs";
import * as path from "path";

function validateConfig(diamondName: string) {
  const configPath = path.join(
    "diamonds",
    diamondName,
    `${diamondName.toLowerCase()}.config.json`
  );
  
  console.log(`Validating: ${configPath}\n`);
  
  // Check file exists
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }
  console.log("✓ File exists");
  
  // Check valid JSON
  let config;
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    config = JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
  console.log("✓ Valid JSON");
  
  // Check required fields
  if (!config.DiamondName) {
    throw new Error("Missing required field: DiamondName");
  }
  console.log(`✓ DiamondName: ${config.DiamondName}`);
  
  if (!Array.isArray(config.Facets)) {
    throw new Error("Facets must be an array");
  }
  console.log(`✓ Facets: ${config.Facets.length} facets configured`);
  
  // Check each facet
  config.Facets.forEach((facet: any, index: number) => {
    if (!facet.name) {
      throw new Error(`Facet ${index} missing name`);
    }
    if (typeof facet.priority !== "number") {
      throw new Error(`Facet ${facet.name} missing priority`);
    }
    console.log(`  ✓ ${facet.name} (priority: ${facet.priority})`);
  });
  
  // Check for duplicate priorities
  const priorities = config.Facets.map((f: any) => f.priority);
  const duplicates = priorities.filter(
    (p: number, i: number) => priorities.indexOf(p) !== i
  );
  if (duplicates.length > 0) {
    console.warn(`  ⚠ Duplicate priorities: ${duplicates.join(", ")}`);
  }
  
  console.log("\n✓ Configuration is valid");
}

validateConfig("ExampleDiamond");
```

---

## Getting Help

If you've tried the solutions above and still have issues:

1. **Check GitHub Issues:**
   - Search existing issues: https://github.com/DiamondsLab/hardhat-diamonds/issues
   - Create a new issue with:
     - Error message
     - Output from verbose mode
     - Your configuration files
     - Hardhat version: `npx hardhat --version`
     - Node version: `node --version`

2. **Enable verbose mode and share output:**
   ```bash
   npx hardhat diamond:flatten --diamond-name YourDiamond --verbose > flatten-debug.log 2>&1
   ```

3. **Create a minimal reproduction:**
   ```bash
   mkdir flatten-bug-report
   cd flatten-bug-report
   # Copy only necessary files
   cp -r contracts/ flatten-bug-report/
   cp -r diamonds/ flatten-bug-report/
   cp hardhat.config.ts flatten-bug-report/
   cp package.json flatten-bug-report/
   ```

4. **Join our Discord community:**
   Get real-time help from the community and maintainers.

---

## See Also

- [FLATTEN.md](FLATTEN.md) - User guide
- [API.md](API.md) - API reference
- [EXAMPLES.md](EXAMPLES.md) - Usage examples
