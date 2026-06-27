import {
  DeploymentRepository,
  Diamond,
  DiamondConfig,
  DiamondDeployer,
  DiamondPathsConfig,
  FileDeploymentRepository,
  LocalDeploymentStrategy,
  SupportedProvider,
  cutKey,
  impersonateAndFundSigner,
} from "@diamondslab/diamonds";
import { Signer } from "ethers";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { join } from "path";

// Hardhat task system used for Diamond ABI generation

export interface LocalDiamondDeployerConfig extends DiamondConfig {
  provider?: SupportedProvider;
  signer?: Signer;
  localDiamondDeployerKey?: string;
}

export class LocalDiamondDeployer {
  private static instances: Map<string, LocalDiamondDeployer> = new Map();
  private deployInProgress: boolean = false;
  private deployComplete: boolean = false;
  private diamond: Diamond | undefined;
  private verbose: boolean = true;
  private config: LocalDiamondDeployerConfig;
  private provider: SupportedProvider;
  private signer: Signer;
  private diamondName: string;
  private networkName: string = "hardhat";

  private constructor(
    hre: HardhatRuntimeEnvironment,
    config: LocalDiamondDeployerConfig,
    repository: DeploymentRepository
  ) {
    this.config = config as DiamondConfig;
    this.diamondName = config.diamondName;
    this.provider = config.provider ?? hre.ethers.provider;
    if (!config.networkName) {
      if ("_network" in this.provider) {
        config.networkName = (this.provider as SupportedProvider)._network.name;
      } else {
        config.networkName = "hardhat";
      }
    } else {
      this.networkName = config.networkName;
    }
    if (!config.chainId) {
      if ("_network" in this.provider) {
        config.chainId = (this.provider as SupportedProvider)._network.chainId;
      } else {
        config.chainId = 31337;
      }
    }

    if (!config.signer) {
      throw new Error("Signer is required for LocalDiamondDeployer");
    }
    this.signer = config.signer;

    if (!repository) {
      throw new Error("Repository is required for LocalDiamondDeployer");
    }

    this.diamond = new Diamond(this.config, repository);
    this.diamond.setProvider(this.provider);
    this.diamond.setSigner(this.signer as any);
  }

  public static async getInstance(
    hre: HardhatRuntimeEnvironment,
    config: LocalDiamondDeployerConfig
  ): Promise<LocalDiamondDeployer> {
    config.provider ??= hre.ethers.provider; // Default to ethers provider
    if (!config.networkName) {
      const network = await config.provider.getNetwork();
      const networkName = network.name ?? "hardhat";
      config.networkName = networkName === "unknown" ? "hardhat" : networkName;
    }
    if (!config.chainId) {
      const network = await config.provider.getNetwork();
      config.chainId = Number(network.chainId) ?? 31337;
    }

    hre.ethers.provider = config.provider;

    const key =
      config.localDiamondDeployerKey ??
      (await cutKey(
        config.diamondName,
        config.networkName as string,
        (config.chainId as number).toString()
      ));

    const existingInstance = this.instances.get(key);
    if (existingInstance) {
      return existingInstance;
    } else {
      const hardhatDiamonds: DiamondPathsConfig | undefined = (
        hre as unknown as {
          diamonds?: { getDiamondConfig: (name: string) => DiamondPathsConfig };
        }
      ).diamonds?.getDiamondConfig(config.diamondName);
      const deployedDiamondDataFileName = `${config.diamondName.toLowerCase()}-${config.networkName?.toLowerCase()}-${config.chainId?.toString()}.json`;
      const defaultDeployedDiamondDataFilePath = join(
        "diamonds",
        config.diamondName,
        "deployments",
        deployedDiamondDataFileName
      );
      const defaultConfigFilePath = join(
        "diamonds",
        config.diamondName,
        `${config.diamondName.toLowerCase()}.config.json`
      );

      config.deploymentsPath =
        config.deploymentsPath ??
        hardhatDiamonds?.deploymentsPath ??
        "diamonds";
      config.contractsPath = hardhatDiamonds?.contractsPath ?? "contracts";
      config.callbacksPath =
        hardhatDiamonds?.callbacksPath ??
        join("diamonds", config.diamondName, "callbacks");
      config.deployedDiamondDataFilePath =
        config.deployedDiamondDataFilePath ??
        hardhatDiamonds?.deployedDiamondDataFilePath ??
        defaultDeployedDiamondDataFilePath;
      config.configFilePath =
        config.configFilePath ??
        hardhatDiamonds?.configFilePath ??
        defaultConfigFilePath;

      // Configure Diamond ABI path and filename to avoid hardhat conflicts
      config.diamondAbiPath =
        config.diamondAbiPath ??
        (hardhatDiamonds as DiamondPathsConfig & { diamondAbiPath?: string })
          ?.diamondAbiPath ??
        "diamond-abi";
      config.diamondAbiFileName =
        config.diamondAbiFileName ??
        (
          hardhatDiamonds as DiamondPathsConfig & {
            diamondAbiFileName?: string;
          }
        )?.diamondAbiFileName ??
        config.diamondName;

      const repository = new FileDeploymentRepository(config);
      repository.setWriteDeployedDiamondData(
        config.writeDeployedDiamondData ??
          hardhatDiamonds?.writeDeployedDiamondData ??
          false
      );
      const deployedDiamondData = repository.loadDeployedDiamondData();

      const [signer0] = await hre.ethers.getSigners();
      if (!deployedDiamondData.DeployerAddress) {
        config.signer = signer0;
      } else {
        // Impersonate + fund FIRST, then use the signer it returns (bound to
        // config.provider / the fork). Calling hre.ethers.getSigner() before
        // impersonation throws "invalid account" for a non-test deployer address,
        // which broke every fork-based UPGRADE (new deployments worked only because
        // DeployerAddress was empty).
        config.signer = await impersonateAndFundSigner(
          deployedDiamondData.DeployerAddress,
          config.provider
        );
      }
      const instance = new LocalDiamondDeployer(hre, config, repository);
      this.instances.set(key, instance);

      // Generate Diamond ABI with Typechain using hardhat task
      await hre.run("diamond:generate-abi-typechain", {
        diamondName: config.diamondName,
        outputDir: config.diamondAbiPath ?? "diamond-abi",
        typechainOutDir: "diamond-typechain-types",
        enableVerbose: false,
        targetNetwork: config.networkName,
      });
      return instance;
    }
  }

  public async deployDiamond(): Promise<Diamond> {
    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId) ?? 31337;
    const key = cutKey(this.diamondName, this.networkName, chainId.toString());
    if (this.deployComplete) {
      console.log(
        `Deployment already completed for ${this.diamondName} on ${this.networkName}-${chainId.toString()}`
      );
      if (!this.diamond) {
        throw new Error("Diamond instance not found after deployment");
      }
      return Promise.resolve(this.diamond);
    } else if (this.deployInProgress) {
      console.log(`Deployment already in progress for ${this.networkName}`);
      console.log("chainId", chainId);
      console.log("key", key);
      // Wait for the deployment to complete
      while (this.deployInProgress) {
        console.log(
          `Waiting for deployment to complete for ${this.networkName}`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (!this.diamond) {
        throw new Error("Diamond instance not found after deployment");
      }
      return Promise.resolve(this.diamond);
    }

    this.deployInProgress = true;

    // Make Deployment Strategy configurable.
    const strategy = new LocalDeploymentStrategy(this.verbose);
    if (!this.diamond) {
      throw new Error("Diamond instance not initialized before deployment");
    }
    const deployer = new DiamondDeployer(this.diamond, strategy);

    await deployer.deployDiamond();

    this.deployComplete = true;
    this.deployInProgress = false;

    return deployer.getDiamond();
  }

  public async getDiamondDeployed(): Promise<Diamond> {
    if (this.deployComplete && this.diamond) {
      return this.diamond;
    }
    const diamond = await this.deployDiamond();
    return diamond;
  }

  public async getDiamond(): Promise<Diamond> {
    if (!this.diamond) {
      throw new Error(
        `Diamond instance not initialized for ${this.diamondName}`
      );
    }
    return this.diamond;
  }

  public async setVerbose(useVerboseLogging: boolean): Promise<void> {
    this.verbose = useVerboseLogging;
  }
}
