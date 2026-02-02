# Diamond Flatten Usage Examples

This document provides complete, real-world examples of using the Diamond Flatten feature.

## Table of Contents

- [Basic Examples](#basic-examples)
- [Advanced Examples](#advanced-examples)
- [Integration Examples](#integration-examples)
- [Real-World Scenarios](#real-world-scenarios)

## Basic Examples

### Example 1: Simple Diamond Flatten

Flatten a basic Diamond with three facets.

**Directory Structure:**
```
contracts/examplediamond/
├── ExampleDiamond.sol
└── facets/
    ├── FacetA.sol
    ├── FacetB.sol
    └── FacetC.sol

diamonds/ExampleDiamond/
└── examplediamond.config.json
```

**Configuration (examplediamond.config.json):**
```json
{
  "DiamondName": "ExampleDiamond",
  "DeploymentRecord": "examplediamond-deployment",
  "Facets": [
    {
      "name": "FacetA",
      "priority": 1,
      "version": "1.0.0"
    },
    {
      "name": "FacetB",
      "priority": 2,
      "version": "1.0.0"
    },
    {
      "name": "FacetC",
      "priority": 3,
      "version": "1.0.0"
    }
  ]
}
```

**Command:**
```bash
npx hardhat diamond:flatten --diamond-name ExampleDiamond
```

**Expected Output:**
```
Flattening Diamond: ExampleDiamond
✓ Discovered 3 facets
✓ Resolved 8 source files
✓ Generated selector table with 11 functions
✓ Flattened Diamond written to: flat/ExampleDiamond-flat.sol
```

---

### Example 2: Custom Output Path

Flatten with a custom output directory for verification.

**Command:**
```bash
npx hardhat diamond:flatten \
  --diamond-name ExampleDiamond \
  --output verification/ExampleDiamond-v1.0.0.sol
```

**Script:**
```typescript
// scripts/flatten-for-verification.ts
import hre from "hardhat";
import * as path from "path";

async function main() {
  const diamondName = "ExampleDiamond";
  const version = "1.0.0";
  const outputPath = path.join(
    "verification",
    `${diamondName}-v${version}.sol`
  );
  
  await hre.run("diamond:flatten", {
    diamondName,
    output: outputPath,
  });
  
  console.log(`✓ Flattened for verification: ${outputPath}`);
}

main().catch(console.error);
```

**Run:**
```bash
npx hardhat run scripts/flatten-for-verification.ts
```

---

### Example 3: Verbose Mode for Debugging

Use verbose mode to see detailed processing steps.

**Command:**
```bash
npx hardhat diamond:flatten --diamond-name ExampleDiamond --verbose
```

**Expected Verbose Output:**
```
Flattening Diamond: ExampleDiamond
[DiamondFlattener] Loading configuration from: diamonds/ExampleDiamond/examplediamond.config.json
[DiamondFlattener] Found 3 facets in configuration
[DiamondFlattener] Discovering facet: FacetA (priority: 1)
[DiamondFlattener] Resolved: contracts/examplediamond/facets/FacetA.sol
[DiamondFlattener] Discovering facet: FacetB (priority: 2)
[DiamondFlattener] Resolved: contracts/examplediamond/facets/FacetB.sol
[DiamondFlattener] Discovering facet: FacetC (priority: 3)
[DiamondFlattener] Resolved: contracts/examplediamond/facets/FacetC.sol
✓ Discovered 3 facets

[DiamondFlattener] Building selector map for 3 facets
[DiamondFlattener] FacetA: Found 4 functions
[DiamondFlattener] FacetB: Found 3 functions
[DiamondFlattener] FacetC: Found 4 functions
✓ Built selector map with 11 functions

[DependencyGraph] Adding root: contracts/examplediamond/facets/FacetA.sol
[DependencyGraph] Adding root: contracts/examplediamond/facets/FacetB.sol
[DependencyGraph] Adding root: contracts/examplediamond/facets/FacetC.sol
[DependencyGraph] Resolving dependencies...
[DependencyGraph] Processing: contracts/examplediamond/facets/FacetA.sol
[SourceResolver] Loading: contracts/examplediamond/facets/FacetA.sol
[SourceResolver] Found 0 imports in FacetA.sol
[DependencyGraph] Processing: contracts/examplediamond/facets/FacetB.sol
[SourceResolver] Loading: contracts/examplediamond/facets/FacetB.sol
[SourceResolver] Found 0 imports in FacetB.sol
[DependencyGraph] Processing: contracts/examplediamond/facets/FacetC.sol
[SourceResolver] Loading: contracts/examplediamond/facets/FacetC.sol
[SourceResolver] Found 0 imports in FacetC.sol
✓ Resolved 3 source files

[OutputFormatter] Generating flattened output
[OutputFormatter] Extracting SPDX: MIT
[OutputFormatter] Extracting pragma: ^0.8.19
[OutputFormatter] Generating selector table
[OutputFormatter] Adding facet: FacetA (1.0.0, priority 1)
[OutputFormatter] Adding facet: FacetB (1.0.0, priority 2)
[OutputFormatter] Adding facet: FacetC (1.0.0, priority 3)
✓ Generated 2,345 characters

✓ Flattened Diamond written to: flat/ExampleDiamond-flat.sol
```

---

## Advanced Examples

### Example 4: Diamond with OpenZeppelin Dependencies

Flatten a Diamond that uses OpenZeppelin contracts.

**Facet Code (OwnableFacet.sol):**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnableFacet is Ownable {
    function transferOwnership(address newOwner)
        public
        override
        onlyOwner
    {
        super.transferOwnership(newOwner);
    }
    
    function getOwner() external view returns (address) {
        return owner();
    }
}
```

**Command:**
```bash
npx hardhat diamond:flatten --diamond-name GovernanceDiamond --verbose
```

**Result:**
The flattened output will include OpenZeppelin's `Ownable.sol`, `Context.sol`, and all transitive dependencies in the correct order.

---

### Example 5: Diamond with Diamond Storage

Flatten a Diamond using the Diamond Storage pattern.

**Library (LibAppStorage.sol):**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

struct AppStorage {
    uint256 value;
    string data;
    mapping(address => uint256) balances;
}

library LibAppStorage {
    bytes32 constant STORAGE_POSITION = 
        keccak256("diamond.app.storage");
    
    function appStorage() 
        internal 
        pure 
        returns (AppStorage storage ds) 
    {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}
```

**Facet (StorageFacet.sol):**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../libraries/LibAppStorage.sol";

contract StorageFacet {
    function setValue(uint256 _value) external {
        LibAppStorage.appStorage().value = _value;
    }
    
    function getValue() external view returns (uint256) {
        return LibAppStorage.appStorage().value;
    }
}
```

**Configuration:**
```json
{
  "DiamondName": "StorageDiamond",
  "Facets": [
    {
      "name": "StorageFacet",
      "priority": 1,
      "version": "1.0.0"
    }
  ]
}
```

**Command:**
```bash
npx hardhat diamond:flatten --diamond-name StorageDiamond
```

**Result:**
The flattened output will include `LibAppStorage.sol` before `StorageFacet.sol` to maintain correct dependency order.

---

### Example 6: Multiple Diamonds in One Project

Flatten multiple Diamonds in a single workspace.

**Directory Structure:**
```
contracts/
├── diamond-a/
│   ├── DiamondA.sol
│   └── facets/
├── diamond-b/
│   ├── DiamondB.sol
│   └── facets/
└── diamond-c/
    ├── DiamondC.sol
    └── facets/

diamonds/
├── DiamondA/
│   └── diamonda.config.json
├── DiamondB/
│   └── diamondb.config.json
└── DiamondC/
    └── diamondc.config.json
```

**Script (scripts/flatten-all.ts):**
```typescript
import hre from "hardhat";
import * as path from "path";
import * as fs from "fs";

async function main() {
  const diamonds = ["DiamondA", "DiamondB", "DiamondC"];
  const outputDir = "flat";
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const diamondName of diamonds) {
    console.log(`\nFlattening ${diamondName}...`);
    
    try {
      const outputPath = path.join(
        outputDir,
        `${diamondName}-flat.sol`
      );
      
      await hre.run("diamond:flatten", {
        diamondName,
        output: outputPath,
      });
      
      console.log(`✓ ${diamondName} flattened successfully`);
    } catch (error) {
      console.error(`✗ Failed to flatten ${diamondName}:`, error.message);
    }
  }
  
  console.log(`\n✓ Flattened ${diamonds.length} Diamonds`);
}

main().catch(console.error);
```

**Run:**
```bash
npx hardhat run scripts/flatten-all.ts
```

---

### Example 7: Flatten with Network-Specific Configuration

Flatten using network-specific paths.

**Hardhat Config (hardhat.config.ts):**
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@diamondslab/hardhat-diamonds";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  diamonds: {
    paths: {
      ProductionDiamond: {
        deploymentsPath: 'diamonds',
        contractsPath: 'contracts/production',
      },
    },
  },
};

export default config;
```

**Command:**
```bash
npx hardhat diamond:flatten \
  --diamond-name ProductionDiamond \
  --network mainnet \
  --output verification/mainnet/ProductionDiamond.sol
```

---

## Integration Examples

### Example 8: Integrate with CI/CD Pipeline

Automate flattening in GitHub Actions.

**GitHub Workflow (.github/workflows/flatten.yml):**
```yaml
name: Flatten Diamonds

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  flatten:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: yarn install
      
      - name: Compile contracts
        run: npx hardhat compile
      
      - name: Flatten Diamonds
        run: |
          npx hardhat diamond:flatten --diamond-name DiamondA
          npx hardhat diamond:flatten --diamond-name DiamondB
      
      - name: Upload flattened contracts
        uses: actions/upload-artifact@v3
        with:
          name: flattened-contracts
          path: flat/
      
      - name: Commit flattened files
        if: github.event_name == 'push'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add flat/
          git commit -m "Update flattened contracts" || echo "No changes"
          git push
```

---

### Example 9: Pre-Deployment Verification Script

Verify flattened output before deployment.

**Script (scripts/pre-deploy-verify.ts):**
```typescript
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const diamondName = process.env.DIAMOND_NAME || "ProductionDiamond";
  const network = process.env.NETWORK || "mainnet";
  const version = process.env.VERSION || "1.0.0";
  
  console.log(`\nPre-Deployment Verification for ${diamondName}`);
  console.log(`Network: ${network}`);
  console.log(`Version: ${version}\n`);
  
  // Step 1: Flatten the Diamond
  const flattenedPath = path.join(
    "verification",
    network,
    `${diamondName}-v${version}.sol`
  );
  
  console.log("Step 1: Flattening Diamond...");
  await hre.run("diamond:flatten", {
    diamondName,
    output: flattenedPath,
    network,
    verbose: true,
  });
  console.log(`✓ Flattened to: ${flattenedPath}\n`);
  
  // Step 2: Verify file exists and is non-empty
  console.log("Step 2: Verifying output...");
  if (!fs.existsSync(flattenedPath)) {
    throw new Error("Flattened file not found");
  }
  
  const content = fs.readFileSync(flattenedPath, "utf-8");
  if (content.length === 0) {
    throw new Error("Flattened file is empty");
  }
  console.log(`✓ File size: ${content.length} bytes\n`);
  
  // Step 3: Check for required elements
  console.log("Step 3: Checking required elements...");
  
  const checks = [
    { name: "SPDX License", pattern: /SPDX-License-Identifier/ },
    { name: "Pragma Directive", pattern: /pragma solidity/ },
    { name: "Selector Table", pattern: /Function Selector Table/ },
    { name: "Diamond Contract", pattern: new RegExp(`contract ${diamondName}`) },
  ];
  
  for (const check of checks) {
    if (!check.pattern.test(content)) {
      throw new Error(`Missing: ${check.name}`);
    }
    console.log(`✓ ${check.name} found`);
  }
  
  console.log("\n✓ Pre-deployment verification passed");
  console.log(`Ready to deploy ${diamondName} to ${network}`);
}

main().catch((error) => {
  console.error("\n✗ Pre-deployment verification failed:");
  console.error(error.message);
  process.exit(1);
});
```

**Run:**
```bash
DIAMOND_NAME=ProductionDiamond NETWORK=mainnet VERSION=1.0.0 \
  npx hardhat run scripts/pre-deploy-verify.ts --network mainnet
```

---

### Example 10: Flatten and Compare Versions

Compare flattened outputs across versions.

**Script (scripts/compare-versions.ts):**
```typescript
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

async function main() {
  const diamondName = "ProductionDiamond";
  const versions = ["v1.0.0", "v1.1.0"];
  const tempDir = "temp-compare";
  
  // Create temp directory
  fs.mkdirSync(tempDir, { recursive: true });
  
  for (const version of versions) {
    console.log(`\nFlattening ${version}...`);
    
    // Checkout version
    execSync(`git checkout ${version}`, { stdio: "inherit" });
    
    // Install dependencies and compile
    execSync("yarn install", { stdio: "inherit" });
    execSync("npx hardhat compile", { stdio: "inherit" });
    
    // Flatten
    const outputPath = path.join(tempDir, `${diamondName}-${version}.sol`);
    await hre.run("diamond:flatten", {
      diamondName,
      output: outputPath,
    });
    
    console.log(`✓ Flattened ${version}`);
  }
  
  // Compare using diff
  console.log("\nComparing versions...");
  const file1 = path.join(tempDir, `${diamondName}-${versions[0]}.sol`);
  const file2 = path.join(tempDir, `${diamondName}-${versions[1]}.sol`);
  
  try {
    execSync(`diff -u ${file1} ${file2}`, { stdio: "inherit" });
    console.log("\n✓ No differences found");
  } catch (error) {
    console.log("\n✓ Differences displayed above");
  }
  
  // Cleanup
  fs.rmSync(tempDir, { recursive: true });
  execSync("git checkout main", { stdio: "inherit" });
}

main().catch(console.error);
```

---

## Real-World Scenarios

### Scenario 1: Etherscan Verification

Complete workflow for verifying a deployed Diamond on Etherscan.

**Step 1: Deploy Diamond**
```bash
npx hardhat run scripts/deploy-diamond.ts --network mainnet
```

**Step 2: Flatten for Verification**
```bash
npx hardhat diamond:flatten \
  --diamond-name ProductionDiamond \
  --output verification/ProductionDiamond-mainnet.sol \
  --network mainnet
```

**Step 3: Verify on Etherscan**
1. Go to Etherscan contract page
2. Click "Verify and Publish"
3. Select "Solidity (Single file)"
4. Upload `verification/ProductionDiamond-mainnet.sol`
5. Set compiler version (e.g., v0.8.19)
6. Set optimization: Yes (200 runs)
7. Submit

**Automation Script (scripts/etherscan-verify.ts):**
```typescript
import hre from "hardhat";
import * as fs from "fs";

async function main() {
  const diamondName = "ProductionDiamond";
  const network = "mainnet";
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS not set");
  }
  
  // Flatten
  const flatPath = `verification/${diamondName}-${network}.sol`;
  await hre.run("diamond:flatten", {
    diamondName,
    output: flatPath,
    network,
  });
  
  // Verify on Etherscan
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [],
    contract: flatPath,
  });
  
  console.log(`✓ Verified on Etherscan: ${contractAddress}`);
}

main().catch(console.error);
```

---

### Scenario 2: Security Audit Preparation

Prepare flattened contracts for security audit.

**Script (scripts/prepare-audit.ts):**
```typescript
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

async function main() {
  const auditVersion = "v2.0.0-audit";
  const auditDir = path.join("audits", auditVersion);
  const diamonds = ["CoreDiamond", "GovernanceDiamond"];
  
  console.log(`Preparing audit package: ${auditVersion}\n`);
  
  // Create audit directory
  fs.mkdirSync(auditDir, { recursive: true });
  
  // Flatten all Diamonds
  for (const diamondName of diamonds) {
    console.log(`Flattening ${diamondName}...`);
    
    const outputPath = path.join(auditDir, `${diamondName}.sol`);
    await hre.run("diamond:flatten", {
      diamondName,
      output: outputPath,
    });
    
    console.log(`✓ ${diamondName} flattened\n`);
  }
  
  // Generate README
  const readme = `# Security Audit Package
  
## Version: ${auditVersion}
## Date: ${new Date().toISOString().split("T")[0]}

## Contracts

${diamonds.map(d => `- ${d}.sol`).join("\n")}

## Compilation

\`\`\`bash
solc --version  # v0.8.19
solc --optimize --optimize-runs 200 ${diamonds[0]}.sol
\`\`\`

## Notes

- All contracts are flattened for easy review
- Function selector tables included for each Diamond
- OpenZeppelin contracts v4.9.0 used
`;
  
  fs.writeFileSync(path.join(auditDir, "README.md"), readme);
  
  // Create archive
  const archiveName = `${auditVersion}.tar.gz`;
  execSync(`tar -czf ${archiveName} ${auditDir}`, { stdio: "inherit" });
  
  console.log(`\n✓ Audit package ready: ${archiveName}`);
}

main().catch(console.error);
```

---

### Scenario 3: Continuous Monitoring

Monitor changes to flattened output over time.

**Script (scripts/monitor-changes.ts):**
```typescript
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

interface FlattenRecord {
  timestamp: string;
  commit: string;
  hash: string;
  size: number;
  functions: number;
}

async function main() {
  const diamondName = "ProductionDiamond";
  const recordsFile = "flatten-history.json";
  
  // Load history
  let history: FlattenRecord[] = [];
  if (fs.existsSync(recordsFile)) {
    history = JSON.parse(fs.readFileSync(recordsFile, "utf-8"));
  }
  
  // Flatten
  const tempPath = path.join("temp", `${diamondName}-temp.sol`);
  await hre.run("diamond:flatten", {
    diamondName,
    output: tempPath,
  });
  
  // Calculate hash
  const content = fs.readFileSync(tempPath, "utf-8");
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  
  // Extract function count
  const selectorMatches = content.match(/0x[0-9a-f]{8} =>/g);
  const functionCount = selectorMatches ? selectorMatches.length : 0;
  
  // Get git commit
  const commit = require("child_process")
    .execSync("git rev-parse HEAD")
    .toString()
    .trim();
  
  // Create record
  const record: FlattenRecord = {
    timestamp: new Date().toISOString(),
    commit: commit.substring(0, 7),
    hash: hash.substring(0, 16),
    size: content.length,
    functions: functionCount,
  };
  
  // Check for changes
  if (history.length > 0) {
    const previous = history[history.length - 1];
    
    if (record.hash !== previous.hash) {
      console.log("⚠️  Changes detected:");
      console.log(`  Functions: ${previous.functions} → ${record.functions}`);
      console.log(`  Size: ${previous.size} → ${record.size} bytes`);
      console.log(`  Hash: ${previous.hash}... → ${record.hash}...`);
    } else {
      console.log("✓ No changes detected");
    }
  }
  
  // Append to history
  history.push(record);
  fs.writeFileSync(recordsFile, JSON.stringify(history, null, 2));
  
  // Cleanup
  fs.unlinkSync(tempPath);
  
  console.log(`\n✓ Record added to ${recordsFile}`);
}

main().catch(console.error);
```

**Add to CI:**
```yaml
- name: Monitor flatten changes
  run: npx hardhat run scripts/monitor-changes.ts
  
- name: Commit history
  run: |
    git add flatten-history.json
    git commit -m "Update flatten history" || echo "No changes"
```

---

## See Also

- [FLATTEN.md](FLATTEN.md) - User guide
- [API.md](API.md) - API reference
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
