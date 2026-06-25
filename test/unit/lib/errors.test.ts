import { expect } from "chai";
import {
  FlattenError,
  FlattenErrorCode,
  FlattenErrorCodeType,
} from "../../../src/lib/errors";

describe("Epic 5: Error Handling Infrastructure", () => {
  describe("FlattenError", () => {
    it("should create error with all properties", () => {
      const error = new FlattenError(
        "Test error message",
        FlattenErrorCode.DIAMOND_NOT_FOUND,
        "Check your configuration",
        { diamondName: "TestDiamond" }
      );

      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(FlattenError);
      expect(error.message).to.equal("Test error message");
      expect(error.code).to.equal(FlattenErrorCode.DIAMOND_NOT_FOUND);
      expect(error.suggestion).to.equal("Check your configuration");
      expect(error.context).to.deep.equal({ diamondName: "TestDiamond" });
      expect(error.name).to.equal("FlattenError");
    });

    it("should create error without optional properties", () => {
      const error = new FlattenError(
        "Test error message",
        FlattenErrorCode.VALIDATION_FAILED
      );

      expect(error.message).to.equal("Test error message");
      expect(error.code).to.equal(FlattenErrorCode.VALIDATION_FAILED);
      expect(error.suggestion).to.be.undefined;
      expect(error.context).to.be.undefined;
    });

    it("should have proper stack trace", () => {
      const error = new FlattenError(
        "Test error",
        FlattenErrorCode.FILE_WRITE_FAILED
      );

      expect(error.stack).to.be.a("string");
      expect(error.stack).to.include("FlattenError");
      expect(error.stack).to.include("Test error");
    });

    it("should extend Error properly", () => {
      const error = new FlattenError(
        "Test",
        FlattenErrorCode.CIRCULAR_DEPENDENCY
      );

      expect(error instanceof Error).to.be.true;
      expect(error instanceof FlattenError).to.be.true;
    });

    it("should have readonly properties", () => {
      const error = new FlattenError(
        "Test",
        FlattenErrorCode.DEPENDENCY_RESOLUTION_FAILED,
        "Suggestion",
        { key: "value" }
      );

      // TypeScript enforces readonly, but we can test that the properties exist
      expect(error.code).to.be.a("string");
      expect(error.suggestion).to.be.a("string");
      expect(error.context).to.be.an("object");
    });
  });

  describe("FlattenErrorCode", () => {
    it("should define DIAMOND_NOT_FOUND code", () => {
      expect(FlattenErrorCode.DIAMOND_NOT_FOUND).to.equal("DIAMOND_NOT_FOUND");
    });

    it("should define FACET_SOURCE_NOT_FOUND code", () => {
      expect(FlattenErrorCode.FACET_SOURCE_NOT_FOUND).to.equal(
        "FACET_SOURCE_NOT_FOUND"
      );
    });

    it("should define DEPENDENCY_RESOLUTION_FAILED code", () => {
      expect(FlattenErrorCode.DEPENDENCY_RESOLUTION_FAILED).to.equal(
        "DEPENDENCY_RESOLUTION_FAILED"
      );
    });

    it("should define CIRCULAR_DEPENDENCY code", () => {
      expect(FlattenErrorCode.CIRCULAR_DEPENDENCY).to.equal(
        "CIRCULAR_DEPENDENCY"
      );
    });

    it("should define FILE_WRITE_FAILED code", () => {
      expect(FlattenErrorCode.FILE_WRITE_FAILED).to.equal("FILE_WRITE_FAILED");
    });

    it("should define VALIDATION_FAILED code", () => {
      expect(FlattenErrorCode.VALIDATION_FAILED).to.equal("VALIDATION_FAILED");
    });

    it("should have all 6 error codes defined", () => {
      const codes = Object.keys(FlattenErrorCode);
      expect(codes).to.have.lengthOf(6);
      expect(codes).to.include.members([
        "DIAMOND_NOT_FOUND",
        "FACET_SOURCE_NOT_FOUND",
        "DEPENDENCY_RESOLUTION_FAILED",
        "CIRCULAR_DEPENDENCY",
        "FILE_WRITE_FAILED",
        "VALIDATION_FAILED",
      ]);
    });

    it("should have const values matching keys", () => {
      expect(FlattenErrorCode.DIAMOND_NOT_FOUND).to.equal("DIAMOND_NOT_FOUND");
      expect(FlattenErrorCode.FACET_SOURCE_NOT_FOUND).to.equal(
        "FACET_SOURCE_NOT_FOUND"
      );
      expect(FlattenErrorCode.DEPENDENCY_RESOLUTION_FAILED).to.equal(
        "DEPENDENCY_RESOLUTION_FAILED"
      );
      expect(FlattenErrorCode.CIRCULAR_DEPENDENCY).to.equal(
        "CIRCULAR_DEPENDENCY"
      );
      expect(FlattenErrorCode.FILE_WRITE_FAILED).to.equal("FILE_WRITE_FAILED");
      expect(FlattenErrorCode.VALIDATION_FAILED).to.equal("VALIDATION_FAILED");
    });
  });

  describe("Error Usage Scenarios", () => {
    it("should create DIAMOND_NOT_FOUND error with suggestion", () => {
      const error = new FlattenError(
        'Diamond "MyDiamond" not found in configuration',
        FlattenErrorCode.DIAMOND_NOT_FOUND,
        "Check diamonds.paths in hardhat.config.ts",
        { diamondName: "MyDiamond" }
      );

      expect(error.code).to.equal(FlattenErrorCode.DIAMOND_NOT_FOUND);
      expect(error.suggestion).to.include("hardhat.config.ts");
      expect(error.context).to.have.property("diamondName", "MyDiamond");
    });

    it("should create FACET_SOURCE_NOT_FOUND error with path", () => {
      const error = new FlattenError(
        "Source file for facet ExampleFacet not found at contracts/ExampleFacet.sol",
        FlattenErrorCode.FACET_SOURCE_NOT_FOUND,
        "Ensure the contract is compiled and the path is correct",
        { facetName: "ExampleFacet", sourcePath: "contracts/ExampleFacet.sol" }
      );

      expect(error.code).to.equal(FlattenErrorCode.FACET_SOURCE_NOT_FOUND);
      expect(error.suggestion).to.include("compiled");
      expect(error.context).to.have.property("facetName");
      expect(error.context).to.have.property("sourcePath");
    });

    it("should create DEPENDENCY_RESOLUTION_FAILED error", () => {
      const error = new FlattenError(
        "Failed to resolve dependencies for MyContract",
        FlattenErrorCode.DEPENDENCY_RESOLUTION_FAILED,
        "Run 'npx hardhat compile' and ensure all imports are valid",
        { contractName: "MyContract", missingImports: ["./Missing.sol"] }
      );

      expect(error.code).to.equal(
        FlattenErrorCode.DEPENDENCY_RESOLUTION_FAILED
      );
      expect(error.suggestion).to.include("npx hardhat compile");
    });

    it("should create CIRCULAR_DEPENDENCY error with cycle info", () => {
      const cycle = ["ContractA", "ContractB", "ContractA"];
      const error = new FlattenError(
        `Circular dependency detected: ${cycle.join(" -> ")}`,
        FlattenErrorCode.CIRCULAR_DEPENDENCY,
        "Refactor contracts to remove circular imports",
        { cycle }
      );

      expect(error.code).to.equal(FlattenErrorCode.CIRCULAR_DEPENDENCY);
      expect(error.suggestion).to.include("Refactor");
      expect(error.context).to.have.property("cycle");
    });

    it("should create FILE_WRITE_FAILED error", () => {
      const error = new FlattenError(
        "Failed to write output file to /readonly/output.sol",
        FlattenErrorCode.FILE_WRITE_FAILED,
        "Check directory permissions and available disk space",
        { outputPath: "/readonly/output.sol" }
      );

      expect(error.code).to.equal(FlattenErrorCode.FILE_WRITE_FAILED);
      expect(error.suggestion).to.include("permissions");
    });

    it("should create VALIDATION_FAILED error", () => {
      const error = new FlattenError(
        "Validation failed",
        FlattenErrorCode.VALIDATION_FAILED,
        "See validation errors above"
      );

      expect(error.code).to.equal(FlattenErrorCode.VALIDATION_FAILED);
      expect(error.suggestion).to.equal("See validation errors above");
    });
  });
});
