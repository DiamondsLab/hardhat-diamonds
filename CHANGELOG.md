# Changelog

All notable changes to the `hardhat-diamonds` project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Diamond Flatten Feature (Epic 6)

- **Flatten Task** (`diamond:flatten`): New Hardhat task for flattening Diamond contracts into single Solidity files
  - Automatic facet discovery from Diamond configuration
  - Complete dependency resolution including OpenZeppelin contracts
  - Topological sorting for correct dependency order
  - Function selector table generation
  - SPDX license and pragma directive deduplication
  - CLI flags: `--diamond-name`, `--output`, `--verbose`, `--network`
  
- **Core Libraries**:
  - `DiamondFlattener`: Facet discovery and selector mapping
  - `SourceResolver`: Contract source loading with caching
  - `DependencyGraph`: Dependency resolution with circular dependency detection
  - `OutputFormatter`: Flattened output generation with selector tables

- **Comprehensive Documentation**:
  - [FLATTEN.md](./docs/FLATTEN.md): User guide with quickstart, configuration, and best practices
  - [API.md](./docs/API.md): Complete API reference for all classes and methods
  - [EXAMPLES.md](./docs/EXAMPLES.md): Real-world usage examples and CI/CD integration
  - [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md): Common issues and solutions guide

- **Test Suite**:
  - 271 unit tests covering all flatten components
  - 21 integration tests with fixture-based validation
  - Test utilities: `mockHRE`, `fixtureLoader`, `testHelpers`
  - Test execution time: <1 second (under 30s requirement)
  - Test fixtures: Simple Diamond with 3 facets (FacetA, FacetB, FacetC)

- **Test Coverage** (as of Epic 6 completion):
  - `DiamondFlattener`: 121 tests
  - `SourceResolver`: 64 tests  
  - `DependencyGraph`: 48 tests
  - `OutputFormatter`: 25 tests
  - Task validation: 13 tests
  - Integration tests: 21 tests
  - Total: 292 passing tests

### Changed

- **README.md**: Updated with flatten feature documentation and links to new docs
- **Package.json**: Added test scripts for flatten unit and integration tests
  - `test:unit:flatten`: Run unit tests for flatten feature
  - `test:integration:flatten`: Run integration tests for flatten feature
  - `test:coverage:flatten`: Run tests with coverage report

### Technical Details

#### Flatten Architecture

The flatten feature uses a modular architecture with four main components:

1. **DiamondFlattener**: Discovers facets from configuration and builds function selector maps
2. **SourceResolver**: Loads and caches Solidity source files, parses import statements
3. **DependencyGraph**: Builds dependency graph, detects circular dependencies, performs topological sort
4. **OutputFormatter**: Generates formatted output with selector tables and cleaned source code

#### Performance Characteristics

- Source caching: Eliminates redundant file reads
- Parallel processing: Dependencies resolved concurrently when possible
- Memory efficient: Streams large files instead of loading entirely into memory
- Typical flatten time: 1-3 seconds for medium-sized Diamonds (6-10 facets)

#### Use Cases

- **Contract Verification**: Flatten for Etherscan/Blockscout verification
- **Security Audits**: Provide auditors with single-file contract code
- **Code Analysis**: Generate input for static analysis tools (Slither, Mythril)
- **Documentation**: Create comprehensive contract documentation with full code
- **CI/CD Integration**: Automate flatten process in deployment pipelines

### Fixed

- N/A (initial flatten feature release)

### Deprecated

- N/A

### Removed

- N/A

### Security

- N/A

## Previous Versions

See [GitHub Releases](https://github.com/DiamondsLab/hardhat-diamonds/releases) for previous version history.

---

## Version Guidelines

### Version Number Format

`MAJOR.MINOR.PATCH`

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backward-compatible manner
- **PATCH**: Backward-compatible bug fixes

### Change Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes

---

## Links

- [Project Repository](https://github.com/DiamondsLab/hardhat-diamonds)
- [Issue Tracker](https://github.com/DiamondsLab/hardhat-diamonds/issues)
- [ERC-2535 Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535)
