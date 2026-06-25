import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Artifacts } from "hardhat/types";
import sinon from "sinon";

/**
 * Configuration for creating a mock Hardhat Runtime Environment
 */
export interface MockHREConfig {
  diamondName?: string;
  contractsPath?: string;
  deploymentsPath?: string;
  sourcesPath?: string;
  artifactsPath?: string;
}

/**
 * Creates a mock Hardhat Runtime Environment for testing
 *
 * @param config - Configuration options for the mock HRE
 * @returns Mocked HardhatRuntimeEnvironment instance
 *
 * @example
 * ```typescript
 * const mockHRE = createMockHRE({
 *   diamondName: 'TestDiamond',
 *   contractsPath: '/mock/contracts',
 *   deploymentsPath: '/mock/deployments'
 * });
 * ```
 */
export function createMockHRE(
  config?: MockHREConfig
): HardhatRuntimeEnvironment {
  const diamondName = config?.diamondName || "TestDiamond";
  const contractsPath = config?.contractsPath || "/mock/contracts";
  const deploymentsPath = config?.deploymentsPath || "/mock/deployments";
  const sourcesPath = config?.sourcesPath || "/mock/contracts";
  const artifactsPath = config?.artifactsPath || "/mock/artifacts";

  // Mock config object
  const mockConfig = {
    diamonds: {
      paths: {
        [diamondName]: {
          contractsPath,
          deploymentsPath,
        },
      },
    },
    paths: {
      sources: sourcesPath,
      artifacts: artifactsPath,
      root: "/mock/root",
      cache: "/mock/cache",
      tests: "/mock/test",
    },
    solidity: {
      version: "0.8.19",
    },
  };

  // Mock artifacts interface
  const mockArtifacts: Partial<Artifacts> = {
    readArtifact: sinon.stub().resolves({
      contractName: "MockContract",
      abi: [],
      bytecode: "0x",
      sourceName: "contracts/MockContract.sol",
    }),
    readArtifactSync: sinon.stub().returns({
      contractName: "MockContract",
      abi: [],
      bytecode: "0x",
      sourceName: "contracts/MockContract.sol",
    }),
    getArtifactPaths: sinon.stub().resolves([]),
    getBuildInfo: sinon.stub().resolves(undefined),
    getBuildInfoPaths: sinon.stub().resolves([]),
    artifactExists: sinon.stub().resolves(true),
    getAllFullyQualifiedNames: sinon.stub().resolves([]),
    saveArtifactAndDebugFile: sinon.stub().resolves(),
    formArtifactPathFromFullyQualifiedName: sinon.stub().returns(""),
  };

  // Create minimal mock HRE
  const mockHRE = {
    config: mockConfig,
    artifacts: mockArtifacts as Artifacts,
    network: {
      name: "hardhat",
      config: {
        chainId: 31337,
      },
    },
    run: sinon.stub().resolves(),
    ethers: {
      provider: {},
      getSigners: sinon.stub().resolves([]),
    },
  } as unknown as HardhatRuntimeEnvironment;

  return mockHRE;
}

/**
 * Creates a mock artifacts object with custom behavior
 *
 * @param artifacts - Map of contract names to artifact data
 * @returns Mocked Artifacts interface
 */
export function createMockArtifacts(
  artifacts: Record<string, any> = {}
): Artifacts {
  const readArtifactStub = sinon.stub();

  // Configure stub to return specific artifacts
  Object.keys(artifacts).forEach((contractName) => {
    readArtifactStub.withArgs(contractName).resolves(artifacts[contractName]);
  });

  // Default behavior for unknown contracts
  readArtifactStub.rejects(new Error("Artifact not found"));

  return {
    readArtifact: readArtifactStub,
    readArtifactSync: sinon.stub(),
    getArtifactPaths: sinon.stub().resolves([]),
    getBuildInfo: sinon.stub().resolves(undefined),
    getBuildInfoPaths: sinon.stub().resolves([]),
    artifactExists: sinon.stub().resolves(true),
    getAllFullyQualifiedNames: sinon.stub().resolves([]),
    saveArtifactAndDebugFile: sinon.stub().resolves(),
    formArtifactPathFromFullyQualifiedName: sinon.stub().returns(""),
  } as unknown as Artifacts;
}

/**
 * Resets all stubs in a mock HRE
 *
 * @param mockHRE - The mock HRE to reset
 */
export function resetMockHRE(mockHRE: HardhatRuntimeEnvironment): void {
  if (mockHRE.artifacts) {
    const artifacts = mockHRE.artifacts as any;
    Object.keys(artifacts).forEach((key) => {
      if (typeof artifacts[key]?.restore === "function") {
        artifacts[key].restore();
      } else if (typeof artifacts[key]?.reset === "function") {
        artifacts[key].reset();
      }
    });
  }

  if ((mockHRE as any).run?.restore) {
    (mockHRE as any).run.restore();
  }
}
