import { expect } from "chai";
import {
  SourceResolver,
  LoadedSource,
  ImportInfo,
} from "../../../src/lib/SourceResolver";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

describe("SourceResolver", () => {
  // Mock HRE for testing
  let mockHre: Partial<HardhatRuntimeEnvironment>;
  let resolver: SourceResolver;

  // Paths to test fixtures
  const fixturesPath = path.join(__dirname, "../../fixtures/flattening");
  const simpleContractPath = path.join(fixturesPath, "SimpleContract.sol");
  const contractWithImportsPath = path.join(
    fixturesPath,
    "ContractWithImports.sol"
  );
  const libraryPath = path.join(fixturesPath, "Library.sol");
  const namedImportsPath = path.join(fixturesPath, "NamedImports.sol");

  beforeEach(() => {
    // Reset mock HRE before each test
    mockHre = {
      network: {
        name: "hardhat",
        config: {
          chainId: 31337,
        } as any,
      } as any,
      config: {
        paths: {
          root: path.join(__dirname, "../../../"),
          sources: "contracts",
          artifacts: "artifacts",
        },
      } as any,
    };

    resolver = new SourceResolver(mockHre as HardhatRuntimeEnvironment, false);
  });

  describe("LoadedSource Interface", () => {
    it("should have correct properties", async () => {
      const source = await resolver.loadSource(simpleContractPath);

      expect(source).to.have.property("name");
      expect(source).to.have.property("path");
      expect(source).to.have.property("content");
      expect(source).to.have.property("imports");

      expect(source.name).to.be.a("string");
      expect(source.path).to.be.a("string");
      expect(source.content).to.be.a("string");
      expect(source.imports).to.be.an("array");
    });
  });

  describe("ImportInfo Interface", () => {
    it("should have correct properties when imports exist", async () => {
      const source = await resolver.loadSource(contractWithImportsPath);

      expect(source.imports).to.have.length.greaterThan(0);

      const importInfo = source.imports[0];
      expect(importInfo).to.have.property("statement");
      expect(importInfo).to.have.property("path");
      expect(importInfo).to.have.property("isNodeModule");
      expect(importInfo).to.have.property("start");
      expect(importInfo).to.have.property("end");

      expect(importInfo.statement).to.be.a("string");
      expect(importInfo.path).to.be.a("string");
      expect(importInfo.isNodeModule).to.be.a("boolean");
      expect(importInfo.start).to.be.a("number");
      expect(importInfo.end).to.be.a("number");
    });
  });

  describe("constructor", () => {
    it("should create instance with HRE", () => {
      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment
      );
      expect(testResolver).to.be.instanceOf(SourceResolver);
    });

    it("should create instance with verbose flag", () => {
      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment,
        true
      );
      expect(testResolver).to.be.instanceOf(SourceResolver);
    });

    it("should initialize empty cache", () => {
      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment
      );
      const stats = testResolver.getStats();
      expect(stats.cachedSources).to.equal(0);
    });
  });

  describe("loadSource() - Basic Functionality", () => {
    it("should load simple contract without imports", async () => {
      const source = await resolver.loadSource(simpleContractPath);

      expect(source.name).to.equal("SimpleContract");
      expect(source.path).to.equal(simpleContractPath);
      expect(source.content).to.include("contract SimpleContract");
      expect(source.imports).to.have.length(0);
    });

    it("should load contract with imports", async () => {
      const source = await resolver.loadSource(contractWithImportsPath);

      expect(source.name).to.equal("ContractWithImports");
      expect(source.path).to.equal(contractWithImportsPath);
      expect(source.content).to.include("contract ContractWithImports");
      expect(source.imports).to.have.length.greaterThan(0);
    });

    it("should load library file", async () => {
      const source = await resolver.loadSource(libraryPath);

      expect(source.name).to.equal("Library");
      expect(source.path).to.equal(libraryPath);
      expect(source.content).to.include("library Library");
      expect(source.imports).to.have.length(0);
    });

    it("should throw error for missing file", async () => {
      const nonExistentPath = path.join(fixturesPath, "DoesNotExist.sol");

      await expect(resolver.loadSource(nonExistentPath)).to.be.rejectedWith(
        /Failed to read source file/
      );
    });

    it("should extract correct contract name from path", async () => {
      const source = await resolver.loadSource(simpleContractPath);
      expect(source.name).to.equal("SimpleContract");
    });
  });

  describe("loadSource() - Caching", () => {
    it("should cache loaded sources", async () => {
      const source1 = await resolver.loadSource(simpleContractPath);
      const source2 = await resolver.loadSource(simpleContractPath);

      expect(source1).to.equal(source2); // Same object reference
      expect(resolver.getStats().cachedSources).to.equal(1);
    });

    it("should use cache for same absolute path", async () => {
      await resolver.loadSource(simpleContractPath);
      await resolver.loadSource(simpleContractPath);

      expect(resolver.getStats().cachedSources).to.equal(1);
    });

    it("should cache multiple different files", async () => {
      await resolver.loadSource(simpleContractPath);
      await resolver.loadSource(libraryPath);
      await resolver.loadSource(contractWithImportsPath);

      expect(resolver.getStats().cachedSources).to.equal(3);
    });

    it("should clear cache", async () => {
      await resolver.loadSource(simpleContractPath);
      expect(resolver.getStats().cachedSources).to.equal(1);

      resolver.clearCache();
      expect(resolver.getStats().cachedSources).to.equal(0);
    });

    it("should reload after cache clear", async () => {
      const source1 = await resolver.loadSource(simpleContractPath);
      resolver.clearCache();
      const source2 = await resolver.loadSource(simpleContractPath);

      expect(source1).to.not.equal(source2); // Different object references
      expect(source1.content).to.equal(source2.content); // Same content
    });
  });

  describe("parseImports() - Import Detection", () => {
    it("should detect relative imports with ./", async () => {
      const source = await resolver.loadSource(contractWithImportsPath);

      const relativeImports = source.imports.filter((imp) =>
        imp.path.startsWith("./")
      );
      expect(relativeImports).to.have.length.greaterThan(0);
    });

    it("should detect named imports", async () => {
      const source = await resolver.loadSource(namedImportsPath);

      const namedImports = source.imports.filter(
        (imp) => imp.statement.includes("{") && imp.statement.includes("}")
      );
      expect(namedImports).to.have.length.greaterThan(0);
    });

    it("should extract import paths correctly", async () => {
      const source = await resolver.loadSource(contractWithImportsPath);

      expect(source.imports).to.satisfy((imports: ImportInfo[]) =>
        imports.some((imp) => imp.path === "./SimpleContract.sol")
      );
      expect(source.imports).to.satisfy((imports: ImportInfo[]) =>
        imports.some((imp) => imp.path === "./Library.sol")
      );
    });

    it("should mark local imports as not node_modules", async () => {
      const source = await resolver.loadSource(contractWithImportsPath);

      const localImports = source.imports.filter((imp) =>
        imp.path.startsWith("./")
      );

      localImports.forEach((imp) => {
        expect(imp.isNodeModule).to.be.false;
      });
    });

    it("should capture import statement positions", async () => {
      const source = await resolver.loadSource(contractWithImportsPath);

      source.imports.forEach((imp) => {
        expect(imp.start).to.be.a("number");
        expect(imp.end).to.be.a("number");
        expect(imp.end).to.be.greaterThan(imp.start);

        const extracted = source.content.substring(imp.start, imp.end);
        expect(extracted).to.equal(imp.statement);
      });
    });

    it("should detect all import syntax variants", async () => {
      const source = await resolver.loadSource(namedImportsPath);

      // Named imports: import { X } from "path";
      const hasNamedImports = source.imports.some(
        (imp) => imp.statement.includes("{") && imp.statement.includes("}")
      );
      expect(hasNamedImports).to.be.true;
    });
  });

  describe("parseImports() - Import Syntax Variants", () => {
    it("should parse simple import statement", () => {
      const testContent = 'import "./Contract.sol";';

      // Create a test resolver with test content
      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment
      );
      const imports = (testResolver as any).parseImports(testContent);

      expect(imports).to.have.length(1);
      expect(imports[0].path).to.equal("./Contract.sol");
      expect(imports[0].isNodeModule).to.be.false;
    });

    it("should parse parent directory import", () => {
      const testContent = 'import "../Parent.sol";';

      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment
      );
      const imports = (testResolver as any).parseImports(testContent);

      expect(imports).to.have.length(1);
      expect(imports[0].path).to.equal("../Parent.sol");
    });

    it("should parse named import", () => {
      const testContent = 'import { Contract } from "./Named.sol";';

      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment
      );
      const imports = (testResolver as any).parseImports(testContent);

      expect(imports).to.have.length(1);
      expect(imports[0].path).to.equal("./Named.sol");
      expect(imports[0].statement).to.include("{");
      expect(imports[0].statement).to.include("Contract");
    });

    it("should parse multiple named imports", () => {
      const testContent = 'import { A, B, C } from "./Multiple.sol";';

      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment
      );
      const imports = (testResolver as any).parseImports(testContent);

      expect(imports).to.have.length(1);
      expect(imports[0].path).to.equal("./Multiple.sol");
      expect(imports[0].statement).to.include("A, B, C");
    });

    it("should parse namespace import", () => {
      const testContent = 'import * as Lib from "./Library.sol";';

      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment
      );
      const imports = (testResolver as any).parseImports(testContent);

      expect(imports).to.have.length(1);
      expect(imports[0].path).to.equal("./Library.sol");
      expect(imports[0].statement).to.include("* as Lib");
    });

    it("should parse node_modules import", () => {
      const testContent =
        'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";';

      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment
      );
      const imports = (testResolver as any).parseImports(testContent);

      expect(imports).to.have.length(1);
      expect(imports[0].path).to.equal(
        "@openzeppelin/contracts/token/ERC20/ERC20.sol"
      );
      expect(imports[0].isNodeModule).to.be.true;
    });

    it("should parse multiple imports in same file", () => {
      const testContent = `
        import "./ContractA.sol";
        import { B } from "./ContractB.sol";
        import * as C from "./ContractC.sol";
      `;

      const testResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment
      );
      const imports = (testResolver as any).parseImports(testContent);

      expect(imports).to.have.length(3);
    });
  });

  describe("getStats()", () => {
    it("should return correct stats with empty cache", () => {
      const stats = resolver.getStats();
      expect(stats.cachedSources).to.equal(0);
      expect(stats.cacheSize).to.equal(0);
    });

    it("should return correct stats with loaded sources", async () => {
      await resolver.loadSource(simpleContractPath);
      await resolver.loadSource(libraryPath);

      const stats = resolver.getStats();
      expect(stats.cachedSources).to.equal(2);
      expect(stats.cacheSize).to.equal(2);
    });

    it("should update stats after cache clear", async () => {
      await resolver.loadSource(simpleContractPath);
      resolver.clearCache();

      const stats = resolver.getStats();
      expect(stats.cachedSources).to.equal(0);
    });
  });

  describe("Verbose Mode", () => {
    it("should work with verbose enabled", async () => {
      const verboseResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment,
        true
      );

      // Should not throw with verbose logging
      const source = await verboseResolver.loadSource(simpleContractPath);
      expect(source.name).to.equal("SimpleContract");
    });

    it("should work with verbose disabled", async () => {
      const quietResolver = new SourceResolver(
        mockHre as HardhatRuntimeEnvironment,
        false
      );

      const source = await quietResolver.loadSource(simpleContractPath);
      expect(source.name).to.equal("SimpleContract");
    });
  });

  describe("Error Messages", () => {
    it("should provide descriptive error for missing file", async () => {
      const missingPath = path.join(fixturesPath, "DoesNotExist.sol");

      try {
        await resolver.loadSource(missingPath);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include(
          "Failed to read source file"
        );
        expect((error as Error).message).to.include(missingPath);
      }
    });

    it("should include file path in error message", async () => {
      const missingPath = "/invalid/path/Contract.sol";

      try {
        await resolver.loadSource(missingPath);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect((error as Error).message).to.include(
          "/invalid/path/Contract.sol"
        );
      }
    });
  });

  describe("Path Resolution", () => {
    it("should handle absolute paths", async () => {
      const source = await resolver.loadSource(simpleContractPath);
      expect(source.path).to.equal(simpleContractPath);
    });

    it("should resolve relative paths from project root", async () => {
      const relativePath = path.relative(
        mockHre.config!.paths.root,
        simpleContractPath
      );

      const source = await resolver.loadSource(relativePath);
      expect(source.path).to.equal(simpleContractPath);
    });
  });

  describe("Contract Name Extraction", () => {
    it("should extract contract name from simple filename", async () => {
      const source = await resolver.loadSource(simpleContractPath);
      expect(source.name).to.equal("SimpleContract");
    });

    it("should extract contract name with complex path", async () => {
      const source = await resolver.loadSource(contractWithImportsPath);
      expect(source.name).to.equal("ContractWithImports");
    });

    it("should remove .sol extension from name", async () => {
      const source = await resolver.loadSource(libraryPath);
      expect(source.name).to.not.include(".sol");
      expect(source.name).to.equal("Library");
    });
  });
});
