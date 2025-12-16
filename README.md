# hardhat-diamonds

[![npm version](https://badge.fury.io/js/hardhat-diamonds.svg)](https://badge.fury.io/js/hardhat-diamonds)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20for-Hardhat-f39c12.svg)](https://hardhat.org/)

A Hardhat Extension for Diamonds node module, Tools for deploying and interfacing with ERC-2535 Diamond Proxies in Hardhat projects.

## Overview

`hardhat-diamonds` is a Hardhat plugin that provides scaffolding for working with the [ERC-2535 Diamond Proxy Standard](https://eips.ethereum.org/EIPS/eip-2535). This plugin extends Hardhat with configuration management and utilities specifically designed for Diamond smart contract development, deployment, and upgrades.

This plugin works in conjunction with the [`diamonds`](https://github.com/GeniusVentures/diamonds) module to provide a complete Diamond development toolkit.

## Features

- **Diamond Configuration Management**: Centralized configuration for multiple Diamond contracts
- **Diamond ABI Generation**: Generate combined ABIs from Diamond proxy configurations
- **TypeScript Type Generation**: Automatic TypeChain integration for type-safe contract interactions
- **Type-Safe Integration**: Full TypeScript support with proper type definitions
- **Hardhat Tasks**: Built-in tasks for Diamond operations and development workflow
- **Hardhat Integration**: Seamless integration with existing Hardhat workflows
- **ERC-2535 Compliance**: Built specifically for the Diamond Proxy Standard

## Installation

Install the plugin and its peer dependency:

```bash
npm install --save-dev hardhat-diamonds diamonds
```

Or with yarn:

```bash
yarn add --dev hardhat-diamonds diamonds
```

## Setup

Add the plugin to your `hardhat.config.ts` or `hardhat.config.js`:

```typescript
import "hardhat-diamonds";

// Rest of your Hardhat configuration
```

## Configuration

Configure your Diamond contracts in your Hardhat config:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-diamonds";

const config: HardhatUserConfig = {
  // ... other Hardhat configuration
  diamonds: {
    paths: {
      MyDiamond: {
        // Diamond-specific configuration
        // Refer to diamonds documentation for available options
      },
      AnotherDiamond: {
        // Configuration for another Diamond contract
      },
    },
  },
};

export default config;
```

## Usage

Once configured, the plugin extends the Hardhat Runtime Environment with a `diamonds` object and provides built-in tasks for Diamond operations.

### Hardhat Tasks

The plugin provides several built-in tasks for Diamond contract operations:

#### `diamond:generate-abi`

Generate a combined ABI for a Diamond proxy contract from its facet configurations.

```bash
# Basic usage
npx hardhat diamond:generate-abi --diamond-name ExampleDiamond

# With custom output directory
npx hardhat diamond:generate-abi --diamond-name MyDiamond --output-dir ./custom-abi

# With verbose logging
npx hardhat diamond:generate-abi --diamond-name MyDiamond --verbose

# For specific network
npx hardhat diamond:generate-abi --diamond-name MyDiamond --network sepolia
```

**Parameters:**

- `--diamond-name` (required): Name of the diamond to generate ABI for
- `--output-dir` (optional): Output directory for generated ABI files (default: `./diamond-abi`)
- `--verbose` (flag): Enable verbose logging
- `--validate-selectors` (flag): Validate function selector uniqueness (default: enabled)
- `--include-source-info` (flag): Include compilation metadata in ABI (default: enabled)
- `--network` (optional): Target network (uses current network if not specified)

#### `diamond:generate-abi-typechain`

Generate both a Diamond ABI and TypeScript types using TypeChain.

```bash
# Basic usage
npx hardhat diamond:generate-abi-typechain --diamond-name ExampleDiamond

# With custom TypeChain target
npx hardhat diamond:generate-abi-typechain --diamond-name MyDiamond --typechain-target ethers-v6

# With custom output directories
npx hardhat diamond:generate-abi-typechain \
  --diamond-name MyDiamond \
  --output-dir ./custom-abi \
  --typechain-out-dir ./custom-types

# Full verbose output
npx hardhat diamond:generate-abi-typechain --diamond-name MyDiamond --verbose
```

**Parameters:**

- `--diamond-name` (required): Name of the diamond to generate ABI and types for
- `--output-dir` (optional): Output directory for generated ABI files (default: `./diamond-abi`)
- `--typechain-target` (optional): TypeChain target (default: `ethers-v6`)
  - Supported targets: `ethers-v6`, `ethers-v5`, `web3-v1`, `truffle-v5`
- `--typechain-out-dir` (optional): TypeChain output directory (default: `./diamond-typechain-types`)
- `--verbose` (flag): Enable verbose logging
- `--validate-selectors` (flag): Validate function selector uniqueness
- `--include-source-info` (flag): Include compilation metadata in ABI
- `--network` (optional): Target network

### Programmatic Usage

You can also use the Diamond functionality programmatically in your scripts and tasks:

```typescript
import { task } from "hardhat/config";
import { generateDiamondAbi } from "hardhat-diamonds";

task("diamond-info", "Get diamond configuration")
  .addParam("name", "Diamond name")
  .setAction(async (taskArgs, hre) => {
    // Get diamond configuration
    const config = hre.diamonds.getDiamondConfig(taskArgs.name);
    console.log("Diamond configuration:", config);
    
    // Generate ABI programmatically
    const abiResult = await generateDiamondAbi(hre, {
      diamondName: taskArgs.name,
      verbose: true,
    });
    
    console.log("Generated ABI with", abiResult.stats.totalFunctions, "functions");
  });
```

### LocalDiamondDeployer

The `LocalDiamondDeployer` class provides a singleton deployer for Diamond contracts on local Hardhat networks and forks. This utility is exported separately from `@diamondslab/hardhat-diamonds/dist/utils` to avoid circular dependency issues during Hardhat configuration loading.

#### Installation

The `LocalDiamondDeployer` is included with the `hardhat-diamonds` package:

```typescript
import { LocalDiamondDeployer, LocalDiamondDeployerConfig } from '@diamondslab/hardhat-diamonds/dist/utils';
import hre from 'hardhat';
```

> **Important**: Import from `/dist/utils` rather than the main package to avoid the HH9 "Error while loading Hardhat's configuration" error.

#### Configuration

The deployer requires a configuration object with the following properties:

```typescript
interface LocalDiamondDeployerConfig {
  diamondName: string;              // Name of the diamond contract
  networkName: string;              // Network name (e.g., 'hardhat', 'localhost')
  provider: JsonRpcProvider;        // Ethers provider instance
  chainId: bigint;                  // Chain ID for the network
  writeDeployedDiamondData?: boolean; // Whether to persist deployment data (default: false)
  configFilePath: string;           // Path to diamond config file
}
```

#### Basic Usage

```typescript
import { Diamond } from '@diamondslab/diamonds';
import { LocalDiamondDeployer, LocalDiamondDeployerConfig } from '@diamondslab/hardhat-diamonds/dist/utils';
import hre from 'hardhat';

// Create configuration
const config: LocalDiamondDeployerConfig = {
  diamondName: 'ExampleDiamond',
  networkName: 'hardhat',
  provider: hre.ethers.provider,
  chainId: (await hre.ethers.provider.getNetwork()).chainId,
  writeDeployedDiamondData: false,
  configFilePath: 'diamonds/ExampleDiamond/examplediamond.config.json',
};

// Get singleton instance (pass hre as first parameter)
const deployer = await LocalDiamondDeployer.getInstance(hre, config);

// Enable verbose logging (optional)
await deployer.setVerbose(true);

// Deploy or retrieve existing diamond
const diamond: Diamond = await deployer.getDiamondDeployed();

// Get deployment data
const deployedData = diamond.getDeployedDiamondData();
console.log('Diamond deployed at:', deployedData.DiamondAddress);
```

#### API Methods

##### `getInstance(hre: HardhatRuntimeEnvironment, config: LocalDiamondDeployerConfig): Promise<LocalDiamondDeployer>`

Retrieve or create a singleton instance of the deployer.

**Parameters:**
- `hre`: Hardhat Runtime Environment instance
- `config`: Configuration object for the deployer

**Returns:** Promise resolving to the LocalDiamondDeployer instance

**Example:**
```typescript
const deployer = await LocalDiamondDeployer.getInstance(hre, config);
```

##### `setVerbose(verbose: boolean): Promise<void>`

Enable or disable verbose logging during deployment.

**Parameters:**
- `verbose`: Boolean flag to enable/disable verbose output

**Example:**
```typescript
await deployer.setVerbose(true);
```

##### `getDiamondDeployed(): Promise<Diamond>`

Deploy (or retrieve if already deployed) the Diamond contract.

**Returns:** Promise resolving to a Diamond instance

**Example:**
```typescript
const diamond = await deployer.getDiamondDeployed();
```

#### Usage in Tests

```typescript
import { Diamond } from '@diamondslab/diamonds';
import { LocalDiamondDeployer, LocalDiamondDeployerConfig } from '@diamondslab/hardhat-diamonds/dist/utils';
import { expect } from 'chai';
import hre from 'hardhat';

describe('Diamond Tests', function() {
  let diamond: Diamond;
  let deployer: LocalDiamondDeployer;

  beforeEach(async function() {
    const config: LocalDiamondDeployerConfig = {
      diamondName: 'ExampleDiamond',
      networkName: 'hardhat',
      provider: hre.ethers.provider,
      chainId: (await hre.ethers.provider.getNetwork()).chainId,
      writeDeployedDiamondData: false,
      configFilePath: 'diamonds/ExampleDiamond/examplediamond.config.json',
    };

    deployer = await LocalDiamondDeployer.getInstance(hre, config);
    diamond = await deployer.getDiamondDeployed();
  });

  it('should deploy diamond successfully', async function() {
    const deployedData = diamond.getDeployedDiamondData();
    expect(deployedData.DiamondAddress).to.be.properAddress;
  });
});
```

#### Singleton Pattern

The `LocalDiamondDeployer` uses a singleton pattern to ensure only one instance exists per configuration. Subsequent calls with the same configuration will return the existing instance:

```typescript
const deployer1 = await LocalDiamondDeployer.getInstance(hre, config);
const deployer2 = await LocalDiamondDeployer.getInstance(hre, config);
// deployer1 === deployer2 (same instance)
```

#### Architecture Notes

**Why `/dist/utils` import?**

The `LocalDiamondDeployer` is exported from a separate utils module to prevent Hardhat's HH9 error. When `hardhat.config.ts` imports the main `@diamondslab/hardhat-diamonds` package, it should not trigger loading of classes that depend on the Hardhat Runtime Environment. By separating the deployer into `/dist/utils`, it can be imported only when needed in scripts and tests.

**Why pass `hre` as parameter?**

Following the `DiamondAbiGenerator` pattern, `LocalDiamondDeployer` receives the Hardhat Runtime Environment as a constructor parameter instead of importing it at the module level. This prevents circular dependencies and allows the class to work correctly when the Hardhat configuration is being loaded.

### Frontend Integration

After generating types with TypeChain, you can use them in your frontend applications:

```typescript
// Import generated types
import { ExampleDiamond__factory } from "./diamond-typechain-types";
import { ethers } from "ethers";

// Connect to your Diamond contract with full type safety
const provider = new ethers.JsonRpcProvider("https://your-rpc-url");
const signer = provider.getSigner();

// Use the factory to connect to deployed Diamond
const diamond = ExampleDiamond__factory.connect("0x...", signer);

// All function calls are now type-safe
const result = await diamond.someFunction();
```

## Migration Guide

If you're currently using the standalone scripts, here's how to migrate to the new Hardhat tasks:

### From `scripts/diamond-abi-generator.ts`

**Before:**

```bash
npx ts-node scripts/diamond-abi-generator.ts --diamond-name ExampleDiamond
```

**After:**

```bash
npx hardhat diamond:generate-abi --diamond-name ExampleDiamond
```

### From `scripts/generate-diamond-abi-with-typechain.ts`

**Before:**

```bash
npx ts-node scripts/generate-diamond-abi-with-typechain.ts --diamond-name ExampleDiamond
```

**After:**

```bash
npx hardhat diamond:generate-abi-typechain --diamond-name ExampleDiamond
```

### Benefits of Migration

1. **Better Integration**: Tasks are fully integrated with Hardhat's runtime environment
2. **Improved Error Handling**: Professional error messages and validation
3. **Network Support**: Automatic network configuration from Hardhat config
4. **Progress Feedback**: Real-time progress indicators for long operations
5. **Consistent CLI**: Follows Hardhat's parameter and flag conventions
6. **Type Safety**: Full TypeScript support with proper type checking

### Breaking Changes

- Parameter names follow Hardhat conventions (kebab-case instead of camelCase)
- Default output directories have changed:
  - ABI output: `./diamond-abi` (was `./artifacts/diamond-abi`)
  - TypeChain output: `./diamond-typechain-types` (was `./typechain-types`)
- Requires plugin installation and configuration in `hardhat.config.ts`

### Configuration Migration

Update your `hardhat.config.ts` to include the plugin:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-diamonds";

const config: HardhatUserConfig = {
  // ... your existing config
};

export default config;
```

## Troubleshooting

### Common Issues

#### "Diamond configuration not found"

Make sure your diamond configuration file exists in the expected location:

```text
diamonds/
  YourDiamondName/
    yourdiamondname.config.json
```

The diamond name is case-sensitive and should match the directory name.

#### "TypeChain not found" or "Unknown TypeChain target"

Install TypeChain and the required target package:

```bash
# For ethers-v6 (default)
yarn add --dev typechain @typechain/ethers-v6

# For ethers-v5
yarn add --dev typechain @typechain/ethers-v5

# For web3-v1
yarn add --dev typechain @typechain/web3-v1
```

#### "No facets found for diamond"

Ensure your diamond configuration includes valid facet contracts:

```json
{
  "facets": [
    {
      "name": "ExampleOwnershipFacet",
      "contract": "ExampleOwnershipFacet"
    }
  ]
}
```

#### "Function selector collision detected"

This indicates duplicate function selectors across facets. Use `--verbose` to see details:

```bash
npx hardhat diamond:generate-abi --diamond-name MyDiamond --verbose
```

Review your facet contracts to ensure unique function signatures.

#### Permission errors on output directories

Ensure you have write permissions to the output directory, or specify a different one:

```bash
npx hardhat diamond:generate-abi --diamond-name MyDiamond --output-dir ./custom-path
```

### Performance Tips

- Use `--no-validate-selectors` to skip validation for faster generation during development
- Specify `--typechain-target` explicitly to avoid auto-detection overhead
- Use absolute paths for output directories to avoid path resolution issues

### Getting Help

- Use `--verbose` flag for detailed logging
- Check the generated files in `diamond-abi/` for ABI structure
- Review TypeChain documentation for target-specific usage patterns

## API Reference

### `hre.diamonds`

The main interface for accessing Diamond functionality.

#### `getDiamondConfig(diamondName: string): DiamondPathsConfig`

Retrieves the configuration for a specific Diamond contract.

**Parameters:**

- `diamondName`: The name of the Diamond as defined in the configuration

**Returns:**

- `DiamondPathsConfig`: The configuration object for the specified Diamond

**Throws:**

- `Error`: If the Diamond configuration is not found

**Example:**

```typescript
const diamondConfig = hre.diamonds.getDiamondConfig("MyDiamond");
```

## Project Structure

```bash
hardhat-diamonds/
├── src/
│   ├── index.ts              # Main plugin entry point
│   ├── DiamondsConfig.ts     # Configuration management class
│   └── type-extensions.ts    # Hardhat type extensions
├── test/                     # Test files
├── dist/                     # Compiled output
└── package.json
```

## Development

### Prerequisites

- Node.js >= 14
- TypeScript >= 4.0
- Hardhat >= 2.0.0

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Dependencies

### Peer Dependencies

- `hardhat`: ^2.0.0
- `diamonds`: Compatible version for Diamond utilities

### Development Dependencies

- TypeScript 4.x
- Mocha for testing
- ESLint and Prettier for code quality

## Related Projects

- [`diamonds`](https://github.com/GeniusVentures/diamonds): Core Diamond utilities and types
- [ERC-2535 Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535): The official Diamond standard specification

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support, please refer to:

- [GitHub Issues](https://github.com/GeniusVentures/hardhat-diamonds/issues)
- [ERC-2535 Documentation](https://eips.ethereum.org/EIPS/eip-2535)

## Authors

- Am0rfu5

---

**Keywords**: ethereum, smart-contracts, hardhat, hardhat-plugin, diamond, diamond-proxy, diamond-upgradeable, blockchain, ERC-2535
