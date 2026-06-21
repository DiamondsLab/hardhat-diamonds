# Contributing to hardhat-diamonds

Thank you for your interest in contributing to hardhat-diamonds! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment.

## Getting Started

### Prerequisites

- Node.js >= 18.x
- Yarn package manager
- Git

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hardhat-diamonds.git
   cd hardhat-diamonds
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Build the project:**
   ```bash
   yarn workspace:build
   ```

4. **Run tests:**
   ```bash
   yarn test:unit:flatten
   yarn test:integration:flatten
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names following this convention:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `ci/` - CI/CD improvements

Examples:
- `feature/diamond-validation`
- `fix/selector-collision`
- `docs/api-reference`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or updates
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

**Examples:**
```
feat(flatten): add support for circular dependency detection

- Implement DependencyGraph circular detection
- Add tests for circular dependency scenarios
- Update documentation

Fixes #123
```

```
fix(resolver): handle missing import statements

- Fix import parsing for edge cases
- Add validation for malformed imports

Related to #456
```

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Check formatting
yarn format:check

# Auto-fix formatting
yarn format

# Run linter
yarn lint

# Fix linting issues
yarn lint:fix
```

**Key guidelines:**
- Use TypeScript for all new code
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Use meaningful variable and function names
- Keep functions small and focused

### Testing Requirements

All contributions must include appropriate tests:

#### Unit Tests

- Test individual functions and classes in isolation
- Use mocks for external dependencies
- Aim for ≥90% code coverage
- Place tests in `test/unit/`

```typescript
import { expect } from "chai";
import { DiamondFlattener } from "../lib/DiamondFlattener";

describe("DiamondFlattener", () => {
  it("should discover facets from configuration", async () => {
    // Test implementation
  });
});
```

#### Integration Tests

- Test complete workflows end-to-end
- Use real fixtures when possible
- Place tests in `test/integration/`

```typescript
describe("Flatten Integration", () => {
  it("should flatten simple diamond successfully", async () => {
    // Integration test implementation
  });
});
```

#### Running Tests

```bash
# Run all tests
yarn test

# Run unit tests only
yarn test:unit:flatten

# Run integration tests only
yarn test:integration:flatten

# Run with coverage
yarn test:coverage:flatten

# Watch mode for development
yarn test:watch
```

### Documentation

Update documentation for any changes:

1. **Code Comments**: Add JSDoc comments for public APIs
2. **README.md**: Update if adding new features or changing usage
3. **API.md**: Document new classes, methods, or interfaces
4. **EXAMPLES.md**: Add examples for new features
5. **TROUBLESHOOTING.md**: Document common issues and solutions
6. **CHANGELOG.md**: Add entry for your changes

## Pull Request Process

### Before Submitting

1. **Run all checks:**
   ```bash
   yarn test:unit:flatten
   yarn test:integration:flatten
   yarn lint
   yarn format:check
   yarn tsc --noEmit
   ```

2. **Ensure coverage threshold:**
   ```bash
   yarn test:coverage:flatten
   # Check that coverage is ≥90%
   ```

3. **Update documentation:**
   - Add/update code comments
   - Update relevant markdown files
   - Update CHANGELOG.md

4. **Test locally:**
   - Build the package: `yarn build`
   - Test in a sample project if possible

### Submitting a PR

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request:**
   - Use the PR template provided
   - Fill out all sections completely
   - Link related issues
   - Add screenshots if applicable

3. **PR Review Process:**
   - Address review comments promptly
   - Keep discussions focused and constructive
   - Update PR based on feedback
   - Ensure CI checks pass

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Coverage threshold met (≥90%)
- [ ] No new linting errors
- [ ] TypeScript compilation succeeds
- [ ] CHANGELOG.md updated

## Project Structure

```
hardhat-diamonds/
├── src/                        # Source code
│   ├── index.ts               # Main entry point
│   ├── lib/                   # Core libraries
│   │   ├── DiamondFlattener.ts
│   │   ├── SourceResolver.ts
│   │   ├── DependencyGraph.ts
│   │   └── OutputFormatter.ts
│   └── tasks/                 # Hardhat tasks
│       └── diamond-flatten.ts
├── test/                      # Tests
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   ├── fixtures/              # Test fixtures
│   └── utils/                 # Test utilities
├── docs/                      # Documentation
│   ├── FLATTEN.md
│   ├── API.md
│   ├── EXAMPLES.md
│   └── TROUBLESHOOTING.md
└── .github/                   # GitHub configuration
    └── workflows/             # CI/CD workflows
```

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (Node version, OS, etc.)
- Error messages and stack traces
- Sample code that demonstrates the issue

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Alternative solutions considered

## Development Tips

### Quick Development Cycle

```bash
# Watch mode for TypeScript compilation
yarn tsc --watch

# Watch mode for tests
yarn test:watch

# Build and test quickly
yarn build && yarn test:unit:flatten
```

### Debugging Tests

```typescript
// Add .only to run single test
it.only("should test specific behavior", () => {
  // Test implementation
});

// Use --grep to run tests matching pattern
yarn test --grep "DiamondFlattener"
```

### Verbose Output

```bash
# Enable verbose logging in tests
DEBUG=* yarn test:unit:flatten

# Verbose flatten operation
npx hardhat diamond:flatten --diamond-name Test --verbose
```

## Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussions
- **Discord**: Join our community for real-time help

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for each release
- GitHub contributors page
- Project README.md (for significant contributions)

## License

By contributing to hardhat-diamonds, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to hardhat-diamonds! 🎉
