import { Diamond } from "@diamondslab/diamonds";
import type { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";
import * as fs from "fs";
import * as path from "path";

/**
 * Loads a Diamond contract instance using the generated Diamond ABI.
 * This function handles the process of making the Diamond ABI available to Hardhat
 * by copying it to the artifacts directory structure.
 *
 * @param diamond - The Diamond instance
 * @param contractAddress - The deployed Diamond contract address
 * @param ethers - The Hardhat ethers instance (from hre.ethers) - uses any to avoid type conflicts in monorepos
 */
export async function loadDiamondContract<T>(
  diamond: Diamond,
  contractAddress: string,
  ethers?: any
): Promise<T> {
  const diamondAbiFilePath = diamond.getDiamondAbiFilePath();

  if (!fs.existsSync(diamondAbiFilePath)) {
    throw new Error(`Diamond ABI artifact not found at ${diamondAbiFilePath}`);
  }

  // Read the Diamond ABI artifact
  const diamondAbiArtifact = JSON.parse(
    fs.readFileSync(diamondAbiFilePath, "utf8")
  );

  // Ensure we have a valid ABI
  if (!diamondAbiArtifact.abi || !Array.isArray(diamondAbiArtifact.abi)) {
    throw new Error(`Invalid Diamond ABI artifact at ${diamondAbiFilePath}`);
  }

  // If ethers is provided, use Hardhat's getContractAt
  if (ethers) {
    // Create the artifacts directory structure for the Diamond contract
    const artifactsDir = path.join(process.cwd(), "artifacts", "diamond-abi");
    const artifactPath = path.join(artifactsDir, `${diamond.diamondName}.sol`);
    const finalArtifactPath = path.join(
      artifactPath,
      `${diamond.diamondName}.json`
    );

    // Ensure the directory structure exists
    fs.mkdirSync(artifactsDir, { recursive: true });
    fs.mkdirSync(artifactPath, { recursive: true });

    // Create a proper Hardhat artifact structure
    const hardhatArtifact = {
      _format: "hh-sol-artifact-1",
      contractName: diamond.diamondName,
      sourceName: `diamond-abi/${diamond.diamondName}.sol`,
      abi: diamondAbiArtifact.abi,
      bytecode: diamondAbiArtifact.bytecode ?? "0x",
      deployedBytecode: diamondAbiArtifact.deployedBytecode ?? "0x",
      linkReferences: diamondAbiArtifact.linkReferences ?? {},
      deployedLinkReferences: diamondAbiArtifact.deployedLinkReferences ?? {},
    };

    // Write the artifact to the artifacts directory
    fs.writeFileSync(
      finalArtifactPath,
      JSON.stringify(hardhatArtifact, null, 2)
    );

    // Now we can use the standard ethers.getContractAt method
    const contractName = `diamond-abi/${diamond.diamondName}.sol:${diamond.diamondName}`;

    try {
      return (await ethers.getContractAt(contractName, contractAddress)) as T;
    } catch (error) {
      // If the above fails, try a simpler approach
      console.warn(
        `Failed to load with full path, trying alternative: ${error}`
      );
      try {
        // Try using the contractName directly
        return (await ethers.getContractAt(
          diamond.diamondName,
          contractAddress
        )) as T;
      } catch (secondError) {
        console.warn(
          `Failed to load with contract name, using direct ABI approach: ${secondError}`
        );
        // Final fallback: create contract instance directly
        return createDiamondContract<T>(
          diamond,
          contractAddress,
          ethers.provider
        );
      }
    }
  }

  // Fallback: create contract instance directly without Hardhat
  return createDiamondContract<T>(diamond, contractAddress);
}

/**
 * Alternative method: Create contract instance directly from ABI
 * This avoids the Hardhat artifact system entirely
 */
export async function createDiamondContract<T>(
  diamond: Diamond,
  contractAddress: string,
  signerOrProvider?: SignerWithAddress | HardhatEthersProvider
): Promise<T> {
  const diamondAbiFilePath = diamond.getDiamondAbiFilePath();

  if (!fs.existsSync(diamondAbiFilePath)) {
    throw new Error(`Diamond ABI artifact not found at ${diamondAbiFilePath}`);
  }

  // Read the Diamond ABI artifact
  const diamondAbiArtifact = JSON.parse(
    fs.readFileSync(diamondAbiFilePath, "utf8")
  );

  // Ensure we have a valid ABI
  if (!diamondAbiArtifact.abi || !Array.isArray(diamondAbiArtifact.abi)) {
    throw new Error(`Invalid Diamond ABI artifact at ${diamondAbiFilePath}`);
  }

  // Create contract instance directly with ethers
  if (!signerOrProvider) {
    throw new Error(
      "Either ethers or signerOrProvider must be provided to createDiamondContract"
    );
  }

  return new Contract(
    contractAddress,
    diamondAbiArtifact.abi,
    signerOrProvider
  ) as T;
}
