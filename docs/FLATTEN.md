# Diamond Flatten User Guide

## Overview

The Diamond Flatten feature provides a powerful tool for flattening ERC-2535 Diamond Proxy contracts into a single, verifiable Solidity file. This is essential for contract verification on block explorers like Etherscan, security audits, and understanding the complete contract logic.

## Features

- **Automatic Facet Discovery**: Discovers all facets from your Diamond configuration
- **Dependency Resolution**: Resolves and orders all contract dependencies correctly
- **Selector Table Generation**: Creates a comprehensive function selector mapping table
- **Source Deduplication**: Eliminates duplicate imports and dependencies
- **OpenZeppelin Support**: Handles OpenZeppelin contracts and imports correctly
- **Multi-Network Support**: Works with any network configured in Hardhat
- **Verbose Mode**: Detailed logging for debugging and verification

## Quick Start

### Installation

The flatten feature is included in `@diamondslab/hardhat-diamonds` package:

```bash
yarn add @diamondslab/hardhat-diamonds
```

### Basic Usage

Flatten a Diamond contract:

```bash
npx hardhat diamond:flatten --diamond-name YourDiamond
```

Output to a specific file:

```bash
npx hardhat diamond:flatten --diamond-name YourDiamond --output flattened/YourDiamond-flat.sol
```

Enable verbose logging:

```bash
npx hardhat diamond:flatten --diamond-name YourDiamond --verbose
```

Specify network:

```bash
npx hardhat diamond:flatten --diamond-name YourDiamond --network mainnet
```

## Configuration

### Diamond Configuration File

The flatten tool uses your existing Diamond configuration file. Ensure your `diamonds/YourDiamond/yourdiamondname.config.json` is properly configured:

```json
{
  "DiamondName": "YourDiamond",
  "DeploymentRecord": "yourdiamondname-deployment",
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
    }
  ]
}
```

### Hardhat Configuration

Configure Diamond paths in your `hardhat.config.ts`:

```typescript
import "@diamondslab/hardhat-diamonds";

const config: HardhatUserConfig = {
  diamonds: {
    paths: {
      YourDiamond: {
        deploymentsPath: 'diamonds',
        contractsPath: 'contracts/yourdiamond',
      },
    },
  },
};
```

## Output Format

### Flattened File Structure

The flattened output includes:

1. **SPDX License Identifier**: Extracted from the main Diamond contract
2. **Pragma Directives**: Combined and deduplicated from all sources
3. **Function Selector Table**: Comprehensive mapping of selectors to functions
4. **Contract Sources**: All contract code in dependency order

Example output structure:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * Diamond Function Selector Table
 * 
 * FacetA:
 *   0x12345678 => setValue(uint256)
 *   0x23456789 => getValue()
 * 
 * FacetB:
 *   0x34567890 => calculate(uint256,uint256)
 */

// Dependencies first (libraries, interfaces, etc.)
// ... dependency contracts ...

// Diamond contract
contract YourDiamond {
  // ... implementation ...
}

// Facets in priority order
contract FacetA {
  // ... implementation ...
}

contract FacetB {
  // ... implementation ...
}
```

### Selector Table Format

The selector table provides a complete mapping of function selectors to their implementations:

```solidity
/*
 * Diamond Function Selector Table
 * Generated: 2026-02-02 10:30:45 UTC
 * 
 * Total Functions: 15
 * Total Facets: 3
 * 
 * FacetName:
 *   0xabcdef12 => functionName(uint256,address) returns (bool)
 *   0x12345678 => anotherFunction() view returns (uint256)
 */
```

## Command-Line Interface

### Available Flags

| Flag | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `--diamond-name` | string | Yes | - | Name of the Diamond to flatten |
| `--output` | string | No | `flat/{diamondname}-flat.sol` | Output file path |
| `--verbose` | boolean | No | false | Enable detailed logging |
| `--network` | string | No | `hardhat` | Network to use for resolution |

### Examples

**Basic flatten with default output:**
```bash
npx hardhat diamond:flatten --diamond-name ExampleDiamond
```

**Custom output directory:**
```bash
npx hardhat diamond:flatten \
  --diamond-name ExampleDiamond \
  --output verification/ExampleDiamond.sol
```

**Multiple Diamonds:**
```bash
# Flatten multiple Diamonds
npx hardhat diamond:flatten --diamond-name DiamondA
npx hardhat diamond:flatten --diamond-name DiamondB
npx hardhat diamond:flatten --diamond-name DiamondC
```

**Verbose mode for debugging:**
```bash
npx hardhat diamond:flatten \
  --diamond-name ExampleDiamond \
  --verbose
```

## Use Cases

### Contract Verification on Etherscan

1. Deploy your Diamond contract
2. Flatten the Diamond:
   ```bash
   npx hardhat diamond:flatten --diamond-name YourDiamond --output verification/YourDiamond.sol
   ```
3. Upload `verification/YourDiamond.sol` to Etherscan
4. Verify the contract with the flattened source

### Security Audits

Security auditors often require a single file with all contract code:

```bash
npx hardhat diamond:flatten \
  --diamond-name YourDiamond \
  --output audits/YourDiamond-audit-v1.0.0.sol
```

### Code Analysis

Generate flattened output for static analysis tools:

```bash
npx hardhat diamond:flatten --diamond-name YourDiamond --output analysis/flat.sol
slither analysis/flat.sol
```

### Documentation

Create comprehensive documentation with complete contract code:

```bash
npx hardhat diamond:flatten --diamond-name YourDiamond --output docs/contracts/YourDiamond-full.sol
```

## Programmatic Usage

### Using the Flatten Task Programmatically

```typescript
import { DiamondFlattener } from "@diamondslab/hardhat-diamonds/dist/lib/DiamondFlattener";
import { SourceResolver } from "@diamondslab/hardhat-diamonds/dist/lib/SourceResolver";
import { DependencyGraph } from "@diamondslab/hardhat-diamonds/dist/lib/DependencyGraph";
import { OutputFormatter } from "@diamondslab/hardhat-diamonds/dist/lib/OutputFormatter";
import hre from "hardhat";

async function flattenDiamond() {
  const diamondName = "YourDiamond";
  const config = hre.config.diamonds.paths[diamondName];
  
  // Initialize flattener
  const flattener = new DiamondFlattener(
    hre,
    diamondName,
    config.contractsPath,
    false // verbose
  );
  
  // Discover facets
  await flattener.discoverFacets();
  const selectorMap = await flattener.buildSelectorMap();
  
  // Resolve dependencies
  const resolver = new SourceResolver(hre.artifacts, false);
  const graph = new DependencyGraph(resolver, false);
  
  const facetContracts = flattener.getFacetContracts();
  for (const contract of facetContracts) {
    graph.addRoot(contract.sourceName);
  }
  
  await graph.resolveDependencies();
  const sortedFiles = graph.getSortedForFlattening();
  
  // Generate output
  const formatter = new OutputFormatter(false);
  const flattenedSource = await formatter.generateFlattenedOutput(
    sortedFiles,
    resolver,
    selectorMap
  );
  
  return flattenedSource;
}
```

### Integration with CI/CD

```typescript
// scripts/ci-flatten.ts
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const diamonds = ["DiamondA", "DiamondB", "DiamondC"];
  const outputDir = "ci-artifacts/flattened";
  
  fs.mkdirSync(outputDir, { recursive: true });
  
  for (const diamondName of diamonds) {
    console.log(`Flattening ${diamondName}...`);
    
    await hre.run("diamond:flatten", {
      diamondName,
      output: path.join(outputDir, `${diamondName}-flat.sol`),
      verbose: false,
    });
  }
  
  console.log(`✓ Flattened ${diamonds.length} Diamonds`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

## Advanced Features

### Facet Priority Ordering

Facets are ordered by priority in the configuration. The flatten tool respects this ordering in the output:

```json
{
  "Facets": [
    { "name": "OwnershipFacet", "priority": 1 },
    { "name": "DiamondCutFacet", "priority": 2 },
    { "name": "BusinessLogicFacet", "priority": 3 }
  ]
}
```

### Handling Diamond Storage

The flatten tool preserves Diamond Storage patterns:

```solidity
// Original facet with diamond storage
library LibAppStorage {
  bytes32 constant STORAGE_POSITION = keccak256("diamond.app.storage");
  
  function appStorage() internal pure returns (AppStorage storage ds) {
    bytes32 position = STORAGE_POSITION;
    assembly {
      ds.slot := position
    }
  }
}

contract MyFacet {
  function getValue() external view returns (uint256) {
    return LibAppStorage.appStorage().value;
  }
}
```

The flattened output includes both the library and facet with proper ordering.

### OpenZeppelin Integration

The flatten tool correctly handles OpenZeppelin contracts:

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MyFacet is Ownable, Pausable {
  // ... implementation ...
}
```

OpenZeppelin dependencies are automatically resolved and included in the flattened output.

### Custom Dependencies

For custom libraries and dependencies:

1. Ensure they're in your contracts directory
2. Use relative imports: `import "./libraries/MyLib.sol";`
3. The flatten tool will discover and include them automatically

## Best Practices

### 1. Organize Your Contracts

```
contracts/yourdiamond/
├── YourDiamond.sol          # Main Diamond contract
├── facets/
│   ├── FacetA.sol
│   ├── FacetB.sol
│   └── FacetC.sol
└── libraries/
    └── LibAppStorage.sol
```

### 2. Use Consistent SPDX Licenses

Ensure all contracts use the same SPDX license identifier to avoid conflicts.

### 3. Document Function Selectors

Add comments to facets documenting their function selectors:

```solidity
/**
 * @notice Sets a value
 * @dev Selector: 0x12345678
 */
function setValue(uint256 value) external {
  // ... implementation ...
}
```

### 4. Test Before Deployment

Always flatten and review the output before deployment:

```bash
# Flatten
npx hardhat diamond:flatten --diamond-name YourDiamond --output review/flat.sol

# Review the output
cat review/flat.sol

# Compile to verify
npx hardhat compile
```

### 5. Version Control Flattened Files

Keep flattened files in version control for audit trails:

```bash
mkdir -p flattened/v1.0.0
npx hardhat diamond:flatten --diamond-name YourDiamond --output flattened/v1.0.0/YourDiamond.sol
git add flattened/v1.0.0/YourDiamond.sol
git commit -m "Add flattened contract for v1.0.0"
```

## Performance

The flatten tool is optimized for performance:

- **Caching**: Source files are cached during resolution
- **Parallel Processing**: Dependencies are resolved in parallel when possible
- **Memory Efficient**: Streams large files instead of loading entirely into memory

Typical performance metrics:

| Diamond Size | Facets | Lines of Code | Flatten Time |
|--------------|--------|---------------|--------------|
| Small | 3-5 | <1,000 | <1 second |
| Medium | 6-10 | 1,000-5,000 | 1-3 seconds |
| Large | 11-20 | 5,000-10,000 | 3-7 seconds |
| Very Large | 20+ | >10,000 | 7-15 seconds |

## Troubleshooting

Common issues and solutions:

### Issue: "Diamond configuration not found"

**Solution**: Ensure your Diamond configuration file exists at the correct path:
```bash
diamonds/YourDiamond/yourdiamondname.config.json
```

### Issue: "Facet contract not found"

**Solution**: Check the contract path in `hardhat.config.ts`:
```typescript
diamonds: {
  paths: {
    YourDiamond: {
      contractsPath: 'contracts/yourdiamond', // Correct path
    },
  },
}
```

### Issue: "Circular dependency detected"

**Solution**: Review your import statements and break circular dependencies:
```bash
npx hardhat diamond:flatten --diamond-name YourDiamond --verbose
```

For more troubleshooting tips, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## API Reference

For detailed API documentation, see [API.md](API.md).

## Examples

For complete usage examples, see [EXAMPLES.md](EXAMPLES.md).

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/DiamondsLab/hardhat-diamonds/issues)
- **Documentation**: [Full documentation](https://github.com/DiamondsLab/hardhat-diamonds)
- **Discord**: Join our community for support

## License

MIT License - see [LICENSE](../LICENSE) for details.
