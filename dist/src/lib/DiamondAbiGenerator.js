"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardhatDiamondAbiGenerator = void 0;
exports.generateDiamondAbi = generateDiamondAbi;
const path_1 = require("path");
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
/**
 * Hardhat-integrated Diamond ABI Generator
 *
 * This class wraps the diamonds module's DiamondAbiGenerator for Hardhat plugin integration.
 * It provides seamless integration with the Hardhat runtime environment and the hardhat-diamonds
 * plugin configuration system.
 */
class HardhatDiamondAbiGenerator {
    hre;
    diamondsConfig;
    options;
    diamond = null;
    repository = null;
    initializationError = null;
    /**
     * Create a new HardhatDiamondAbiGenerator instance
     *
     * @param hre - Hardhat runtime environment
     * @param options - ABI generation options
     */
    constructor(hre, options) {
        this.hre = hre;
        this.diamondsConfig = hre.diamonds;
        // Set default options with Hardhat integration
        this.options = {
            networkName: hre.network.name,
            chainId: hre.network.config.chainId || 31337,
            outputDir: (0, path_1.join)(hre.config.paths.root, 'diamond-abi'),
            contractPath: (0, path_1.join)(hre.config.paths.root, 'contracts'),
            includeSourceInfo: true,
            validateSelectors: true,
            verbose: false,
            diamondsPath: (0, path_1.join)(hre.config.paths.root, 'diamonds'),
            ...options,
        };
        this.initializeDiamond();
    }
    /**
     * Initialize the Diamond instance with proper error handling
     */
    initializeDiamond() {
        try {
            // Get diamond configuration from hardhat-diamonds plugin
            const diamondPathConfig = this.diamondsConfig.getDiamondConfig(this.options.diamondName);
            // Create diamond configuration that matches the diamonds module DiamondConfig interface
            const diamondConfig = {
                diamondName: this.options.diamondName,
                networkName: this.options.networkName,
                chainId: this.options.chainId,
                // Set paths based on the hardhat diamonds configuration
                deploymentsPath: diamondPathConfig.deploymentsPath || this.options.diamondsPath,
                contractsPath: diamondPathConfig.contractsPath || this.options.contractPath,
                // Set the configuration file path correctly
                configFilePath: diamondPathConfig.configFilePath || `${diamondPathConfig.deploymentsPath || this.options.diamondsPath}/${this.options.diamondName}/${this.options.diamondName.toLowerCase()}.config.json`,
                // Set deployed diamond data file path
                deployedDiamondDataFilePath: diamondPathConfig.deployedDiamondDataFilePath || `${diamondPathConfig.deploymentsPath || this.options.diamondsPath}/${this.options.diamondName}/deployments/${this.options.networkName}.json`,
                // Enable writing deployment data
                writeDeployedDiamondData: diamondPathConfig.writeDeployedDiamondData ?? true,
                // Configure diamond ABI path and filename
                diamondAbiPath: this.options.outputDir,
                diamondAbiFileName: this.options.diamondName,
            };
            if (this.options.verbose) {
                console.log(chalk_1.default.blue('🔧 Diamond configuration:'));
                console.log(chalk_1.default.gray(`   Config file: ${diamondConfig.configFilePath}`));
                console.log(chalk_1.default.gray(`   Contracts path: ${diamondConfig.contractsPath}`));
                console.log(chalk_1.default.gray(`   Deployments path: ${diamondConfig.deploymentsPath}`));
            }
            // Create repository
            const FileDeploymentRepository = this.getFileDeploymentRepositoryClass();
            this.repository = new FileDeploymentRepository(diamondConfig);
            // Create diamond instance
            const Diamond = this.getDiamondClass();
            this.diamond = new Diamond(diamondConfig, this.repository);
        }
        catch (error) {
            this.initializationError = error;
            if (this.options.verbose) {
                console.log(chalk_1.default.yellow(`⚠️  Failed to initialize diamond: ${error}`));
            }
        }
    }
    /**
     * Dynamically load the Diamond class from the diamonds module
     */
    getDiamondClass() {
        try {
            // Try to resolve from parent project first
            const parentPath = require.resolve('diamonds', { paths: [process.cwd()] });
            const diamondsModule = require(parentPath);
            return diamondsModule.Diamond;
        }
        catch {
            // Fallback to local resolution
            const diamondsModule = require('diamonds');
            return diamondsModule.Diamond;
        }
    }
    /**
     * Dynamically load the FileDeploymentRepository class from the diamonds module
     */
    getFileDeploymentRepositoryClass() {
        try {
            const repositoriesPath = require.resolve('diamonds/dist/repositories/FileDeploymentRepository', { paths: [process.cwd()] });
            return require(repositoriesPath).FileDeploymentRepository;
        }
        catch {
            try {
                // Try direct import as fallback
                return require('diamonds/dist/repositories/FileDeploymentRepository').FileDeploymentRepository;
            }
            catch {
                // If all else fails, create a minimal mock that has the required methods
                return class MockFileDeploymentRepository {
                    config;
                    constructor(config) {
                        this.config = config;
                    }
                    getDeploymentId() {
                        return `${this.config.diamondName}-${this.config.networkName}-${this.config.chainId}`;
                    }
                    loadDeployedDiamondData() {
                        return {};
                    }
                    loadDeployConfig() {
                        return {};
                    }
                    saveDeployedDiamondData(_data) {
                        // Mock implementation
                    }
                    setWriteDeployedDiamondData(_write) {
                        // Mock implementation
                    }
                    getWriteDeployedDiamondData() {
                        return true;
                    }
                };
            }
        }
    }
    /**
     * Generate the diamond ABI using the diamonds module DiamondAbiGenerator
     *
     * @returns Promise resolving to the generation result
     */
    async generateAbi() {
        if (this.options.verbose) {
            console.log(chalk_1.default.blue(`🔧 Generating Diamond ABI for ${this.options.diamondName} using diamonds module...`));
        }
        try {
            // If initialization failed, return fallback result
            if (this.initializationError || !this.diamond) {
                if (this.options.verbose) {
                    console.log(chalk_1.default.yellow(`⚠️  Using fallback ABI generation due to initialization error: ${this.initializationError?.message}`));
                }
                return this.generateFallbackAbi();
            }
            // Generate ABI manually using diamond data
            const deployedData = this.diamond.getDeployedDiamondData();
            const hasDeployedFacets = deployedData.DeployedFacets && Object.keys(deployedData.DeployedFacets).length > 0;
            const hasRegistryData = this.diamond.functionSelectorRegistry &&
                this.diamond.functionSelectorRegistry.size > 0;
            if (!hasDeployedFacets && !hasRegistryData) {
                if (this.options.verbose) {
                    console.log(chalk_1.default.yellow(`⚠️  No deployment data or registry data found, using configuration-based ABI generation`));
                }
                return this.generateConfigBasedAbi();
            }
            // Use the diamond's path configuration
            const outputDir = this.diamond.getDiamondAbiPath();
            const abiFileName = this.diamond.getDiamondAbiFileName();
            // Generate ABI from deployed facets and function registry
            const result = await this.generateFromDeployedData(outputDir, abiFileName);
            if (this.options.verbose) {
                console.log(chalk_1.default.green(`✅ Diamond ABI generated successfully from deployment data`));
                console.log(chalk_1.default.blue(`   Functions: ${result.stats.totalFunctions}`));
                console.log(chalk_1.default.blue(`   Events: ${result.stats.totalEvents}`));
                console.log(chalk_1.default.blue(`   Facets: ${result.stats.facetCount}`));
                console.log(chalk_1.default.blue(`   Output: ${result.outputPath}`));
            }
            return result;
        }
        catch (error) {
            if (this.options.verbose) {
                console.log(chalk_1.default.yellow(`⚠️  DiamondAbiGenerator failed, trying configuration-based approach: ${error}`));
            }
            return this.generateConfigBasedAbi();
        }
    }
    /**
     * Generate ABI from deployed diamond data using function selector registry
     *
     * @param outputDir - Output directory for the generated ABI
     * @param abiFileName - Name for the ABI file
     * @returns Promise resolving to generation result
     */
    async generateFromDeployedData(outputDir, abiFileName) {
        if (this.options.verbose) {
            console.log(chalk_1.default.blue('🔧 Generating Diamond ABI from deployed data...'));
        }
        // Ensure output directory exists
        if (!(0, fs_1.existsSync)(outputDir)) {
            (0, fs_1.mkdirSync)(outputDir, { recursive: true });
        }
        try {
            const deployedData = this.diamond.getDeployedDiamondData();
            const functionRegistry = this.diamond.functionSelectorRegistry;
            const combinedAbi = [];
            const selectorMap = {};
            const eventSignatures = new Set();
            const errorSignatures = new Set();
            const counters = { totalFunctions: 0, totalEvents: 0, totalErrors: 0 };
            const facetAddresses = [];
            // Process deployed facets
            if (deployedData.DeployedFacets) {
                for (const [facetName, facetData] of Object.entries(deployedData.DeployedFacets)) {
                    try {
                        if (this.options.verbose) {
                            console.log(chalk_1.default.cyan(`📄 Processing deployed facet ${facetName}...`));
                        }
                        const facet = facetData;
                        if (facet.address) {
                            facetAddresses.push(facet.address);
                        }
                        // Load the facet artifact
                        const artifact = await this.loadFacetArtifact(facetName);
                        if (!artifact) {
                            if (this.options.verbose) {
                                console.log(chalk_1.default.yellow(`⚠️  Artifact not found for ${facetName}`));
                            }
                            continue;
                        }
                        // Process ABI items for this facet
                        await this.processAbiItems(artifact.abi || [], facetName, combinedAbi, selectorMap, eventSignatures, errorSignatures, counters);
                    }
                    catch (error) {
                        if (this.options.verbose) {
                            console.log(chalk_1.default.yellow(`⚠️  Error processing deployed facet ${facetName}: ${error}`));
                        }
                    }
                }
            }
            // Also process function selector registry if available
            if (functionRegistry && functionRegistry.size > 0) {
                for (const [selector, entry] of functionRegistry.entries()) {
                    if (!selectorMap[selector]) {
                        selectorMap[selector] = entry.facetName || 'Unknown';
                    }
                }
            }
            // Sort ABI for consistency
            combinedAbi.sort((a, b) => {
                const typeOrder = { function: 0, event: 1, error: 2 };
                if (a.type !== b.type) {
                    return ((typeOrder[a.type] || 99) -
                        (typeOrder[b.type] || 99));
                }
                return (a.name || '').localeCompare(b.name || '');
            });
            // Generate output file
            const outputPath = (0, path_1.join)(outputDir, `${abiFileName}.json`);
            const artifact = {
                _format: 'hh-sol-artifact-1',
                contractName: abiFileName,
                sourceName: `diamond-abi/${abiFileName}.sol`,
                abi: combinedAbi,
                bytecode: '',
                deployedBytecode: '',
                linkReferences: {},
                deployedLinkReferences: {},
                _diamondMetadata: {
                    generatedAt: new Date().toISOString(),
                    diamondName: this.options.diamondName,
                    networkName: this.options.networkName,
                    chainId: this.options.chainId,
                    selectorMap: selectorMap,
                    deployedFacets: deployedData.DeployedFacets || {},
                    stats: {
                        totalFunctions: counters.totalFunctions,
                        totalEvents: counters.totalEvents,
                        totalErrors: counters.totalErrors,
                        facetCount: Object.keys(deployedData.DeployedFacets || {}).length,
                        duplicateSelectorsSkipped: 0,
                    },
                },
            };
            // Add metadata if requested
            if (this.options.includeSourceInfo) {
                artifact.metadata = JSON.stringify({
                    compiler: 'diamond-abi-generator',
                    generatedAt: new Date().toISOString(),
                    networkName: this.options.networkName,
                    chainId: this.options.chainId,
                    selectorMap: selectorMap,
                    deployedFacets: deployedData.DeployedFacets || {},
                    stats: {
                        totalFunctions: counters.totalFunctions,
                        totalEvents: counters.totalEvents,
                        totalErrors: counters.totalErrors,
                        facetCount: Object.keys(deployedData.DeployedFacets || {}).length,
                        duplicateSelectorsSkipped: 0,
                    },
                });
            }
            (0, fs_1.writeFileSync)(outputPath, JSON.stringify(artifact, null, 2));
            return {
                abi: combinedAbi,
                selectorMap,
                facetAddresses,
                outputPath,
                stats: {
                    totalFunctions: counters.totalFunctions,
                    totalEvents: counters.totalEvents,
                    totalErrors: counters.totalErrors,
                    facetCount: Object.keys(deployedData.DeployedFacets || {}).length,
                    duplicateSelectorsSkipped: 0,
                },
            };
        }
        catch (error) {
            if (this.options.verbose) {
                console.log(chalk_1.default.yellow(`⚠️  Failed to generate from deployed data: ${error}`));
            }
            // Fallback to configuration-based generation
            return this.generateConfigBasedAbi();
        }
    }
    /**
     * Generate a fallback ABI when the diamonds module fails
     *
     * @returns Promise resolving to fallback ABI generation result
     */
    async generateFallbackAbi() {
        // Ensure output directory exists
        if (!(0, fs_1.existsSync)(this.options.outputDir)) {
            (0, fs_1.mkdirSync)(this.options.outputDir, { recursive: true });
        }
        // Generate output file path with unique name to avoid conflicts
        const outputContractName = `${this.options.diamondName}ABI`;
        const outputFileName = `${outputContractName}.json`;
        const outputPath = (0, path_1.join)(this.options.outputDir, outputFileName);
        // Create minimal artifact structure for testing
        const artifact = {
            _format: 'hh-sol-artifact-1',
            contractName: outputContractName,
            sourceName: `diamond-abi/${outputContractName}.sol`,
            abi: [],
            bytecode: '0x',
            deployedBytecode: '0x',
            linkReferences: {},
            deployedLinkReferences: {},
        };
        // Add metadata if requested
        if (this.options.includeSourceInfo) {
            artifact.metadata = JSON.stringify({
                compiler: 'diamond-abi-generator-fallback',
                generatedAt: new Date().toISOString(),
                networkName: this.options.networkName,
                chainId: this.options.chainId,
                error: this.initializationError?.message || 'Unknown error',
            });
        }
        // Write the artifact
        (0, fs_1.writeFileSync)(outputPath, JSON.stringify(artifact, null, 2));
        // Return empty ABI structure for graceful failure
        return {
            abi: [],
            selectorMap: {},
            facetAddresses: [],
            outputPath,
            stats: {
                totalFunctions: 0,
                totalEvents: 0,
                totalErrors: 0,
                facetCount: 0,
                duplicateSelectorsSkipped: 0,
            },
        };
    }
    /**
     * Generate ABI based on diamond configuration when no deployment data is available
     *
     * @returns Promise resolving to configuration-based ABI generation result
     */
    async generateConfigBasedAbi() {
        if (this.options.verbose) {
            console.log(chalk_1.default.blue('🔧 Generating Diamond ABI from configuration...'));
        }
        // Ensure output directory exists
        if (!(0, fs_1.existsSync)(this.options.outputDir)) {
            (0, fs_1.mkdirSync)(this.options.outputDir, { recursive: true });
        }
        try {
            // Read diamond configuration to find facets
            const configPath = (0, path_1.join)(this.options.diamondsPath, this.options.diamondName, `${this.options.diamondName.toLowerCase()}.config.json`);
            if (!(0, fs_1.existsSync)(configPath)) {
                if (this.options.verbose) {
                    console.log(chalk_1.default.yellow(`⚠️  Configuration file not found at ${configPath}`));
                }
                return this.generateFallbackAbi();
            }
            const config = JSON.parse((0, fs_1.readFileSync)(configPath, 'utf-8'));
            const combinedAbi = [];
            const selectorMap = {};
            const eventSignatures = new Set();
            const errorSignatures = new Set();
            const counters = { totalFunctions: 0, totalEvents: 0, totalErrors: 0 };
            // Process each facet from configuration
            for (const [facetName] of Object.entries(config.facets || {})) {
                try {
                    if (this.options.verbose) {
                        console.log(chalk_1.default.cyan(`📄 Processing ${facetName} from configuration...`));
                    }
                    // Try to load the contract artifact using Hardhat artifacts
                    const artifact = await this.loadFacetArtifact(facetName);
                    if (!artifact) {
                        if (this.options.verbose) {
                            console.log(chalk_1.default.yellow(`⚠️  Artifact not found for ${facetName}`));
                        }
                        continue;
                    }
                    // Process ABI items
                    await this.processAbiItems(artifact.abi || [], facetName, combinedAbi, selectorMap, eventSignatures, errorSignatures, counters);
                }
                catch (error) {
                    if (this.options.verbose) {
                        console.log(chalk_1.default.yellow(`⚠️  Error processing ${facetName}: ${error}`));
                    }
                }
            }
            // Sort ABI for consistency
            combinedAbi.sort((a, b) => {
                const typeOrder = { function: 0, event: 1, error: 2 };
                if (a.type !== b.type) {
                    return ((typeOrder[a.type] || 99) -
                        (typeOrder[b.type] || 99));
                }
                return (a.name || '').localeCompare(b.name || '');
            });
            // Generate output file with unique name
            const outputContractName = `${this.options.diamondName}`;
            const outputFileName = `${outputContractName}.json`;
            const outputPath = (0, path_1.join)(this.options.outputDir, outputFileName);
            const artifact = {
                _format: 'hh-sol-artifact-1',
                contractName: outputContractName,
                sourceName: `diamond-abi/${outputContractName}.sol`,
                abi: combinedAbi,
                bytecode: '',
                deployedBytecode: '',
                linkReferences: {},
                deployedLinkReferences: {},
                _diamondMetadata: {
                    generatedAt: new Date().toISOString(),
                    diamondName: this.options.diamondName,
                    networkName: this.options.networkName,
                    chainId: this.options.chainId,
                    selectorMap: selectorMap,
                    stats: {
                        totalFunctions: counters.totalFunctions,
                        totalEvents: counters.totalEvents,
                        totalErrors: counters.totalErrors,
                        facetCount: Object.keys(config.facets || {}).length,
                        duplicateSelectorsSkipped: 0,
                    },
                },
            };
            // Add metadata if requested
            if (this.options.includeSourceInfo) {
                artifact.metadata = JSON.stringify({
                    compiler: 'diamond-abi-generator',
                    generatedAt: new Date().toISOString(),
                    networkName: this.options.networkName,
                    chainId: this.options.chainId,
                    selectorMap: selectorMap,
                    stats: {
                        totalFunctions: counters.totalFunctions,
                        totalEvents: counters.totalEvents,
                        totalErrors: counters.totalErrors,
                        facetCount: Object.keys(config.facets || {}).length,
                        duplicateSelectorsSkipped: 0,
                    },
                });
            }
            (0, fs_1.writeFileSync)(outputPath, JSON.stringify(artifact, null, 2));
            const result = {
                abi: combinedAbi,
                selectorMap,
                facetAddresses: [],
                outputPath,
                stats: {
                    totalFunctions: counters.totalFunctions,
                    totalEvents: counters.totalEvents,
                    totalErrors: counters.totalErrors,
                    facetCount: Object.keys(config.facets || {}).length,
                    duplicateSelectorsSkipped: 0,
                },
            };
            if (this.options.verbose) {
                console.log(chalk_1.default.green(`✅ Configuration-based Diamond ABI generated`));
                console.log(chalk_1.default.blue(`   Functions: ${counters.totalFunctions}`));
                console.log(chalk_1.default.blue(`   Events: ${counters.totalEvents}`));
                console.log(chalk_1.default.blue(`   Errors: ${counters.totalErrors}`));
                console.log(chalk_1.default.blue(`   Facets: ${Object.keys(config.facets || {}).length}`));
                console.log(chalk_1.default.blue(`   Output: ${outputPath}`));
            }
            return result;
        }
        catch (error) {
            if (this.options.verbose) {
                console.log(chalk_1.default.yellow(`⚠️  Configuration-based generation failed: ${error}`));
            }
            return this.generateFallbackAbi();
        }
    }
    /**
     * Load facet artifact using Hardhat artifacts manager
     *
     * @param facetName - Name of the facet to load
     * @returns Promise resolving to the artifact or null if not found
     */
    async loadFacetArtifact(facetName) {
        try {
            // Try to use Hardhat artifacts manager first
            const artifact = await this.hre.artifacts.readArtifact(facetName);
            return artifact;
        }
        catch {
            // Fallback to manual file loading like the original script
            const artifactPaths = [
                (0, path_1.join)(this.hre.config.paths.artifacts, `contracts/${facetName}.sol/${facetName}.json`),
                (0, path_1.join)(this.hre.config.paths.artifacts, `contracts/examplediamond/${facetName}.sol/${facetName}.json`),
                (0, path_1.join)(this.hre.config.paths.artifacts, `contracts/${this.options.diamondName.toLowerCase()}/${facetName}.sol/${facetName}.json`),
                (0, path_1.join)(this.hre.config.paths.artifacts, `contracts-starter/contracts/facets/${facetName}.sol/${facetName}.json`),
                (0, path_1.join)(this.hre.config.paths.artifacts, `@gnus.ai/contracts-upgradeable-diamond/contracts/${facetName}.sol/${facetName}.json`),
            ];
            for (const artifactPath of artifactPaths) {
                if ((0, fs_1.existsSync)(artifactPath)) {
                    return JSON.parse((0, fs_1.readFileSync)(artifactPath, 'utf-8'));
                }
            }
            return null;
        }
    }
    /**
     * Process ABI items for a facet
     *
     * @param abiItems - ABI items to process
     * @param facetName - Name of the facet
     * @param combinedAbi - Combined ABI array to append to
     * @param selectorMap - Selector to facet mapping
     * @param eventSignatures - Set of event signatures for deduplication
     * @param errorSignatures - Set of error signatures for deduplication
     * @param counters - Counters for statistics
     */
    async processAbiItems(abiItems, facetName, combinedAbi, selectorMap, eventSignatures, errorSignatures, counters) {
        for (const abiItem of abiItems) {
            if (abiItem.type === 'function') {
                const { Interface } = await Promise.resolve().then(() => __importStar(require('ethers')));
                const iface = new Interface([abiItem]);
                const func = iface.getFunction(abiItem.name);
                if (func) {
                    const selector = func.selector;
                    // Check for duplicate selectors and skip if already added
                    if (selectorMap[selector]) {
                        if (this.options.verbose) {
                            console.log(chalk_1.default.yellow(`⚠️  Skipping duplicate function ${abiItem.name} with selector ${selector} from ${facetName} (already added from ${selectorMap[selector]})`));
                        }
                        continue;
                    }
                    // Add source information if requested
                    if (this.options.includeSourceInfo) {
                        abiItem._diamondFacet = facetName;
                        abiItem._diamondSelector = selector;
                    }
                    combinedAbi.push(abiItem);
                    selectorMap[selector] = facetName;
                    counters.totalFunctions++;
                }
            }
            else if (abiItem.type === 'event') {
                // Create a signature for the event to deduplicate
                const eventSignature = `${abiItem.name}(${(abiItem.inputs || []).map((input) => input.type).join(',')})`;
                if (eventSignatures.has(eventSignature)) {
                    if (this.options.verbose) {
                        console.log(chalk_1.default.yellow(`⚠️  Skipping duplicate event ${eventSignature} from ${facetName}`));
                    }
                    continue;
                }
                // Add source information if requested
                if (this.options.includeSourceInfo) {
                    abiItem._diamondFacet = facetName;
                }
                combinedAbi.push(abiItem);
                eventSignatures.add(eventSignature);
                counters.totalEvents++;
            }
            else if (abiItem.type === 'error') {
                // Create a signature for the error to deduplicate
                const errorSignature = `${abiItem.name}(${(abiItem.inputs || []).map((input) => input.type).join(',')})`;
                if (errorSignatures.has(errorSignature)) {
                    if (this.options.verbose) {
                        console.log(chalk_1.default.yellow(`⚠️  Skipping duplicate error ${errorSignature} from ${facetName}`));
                    }
                    continue;
                }
                // Add source information if requested
                if (this.options.includeSourceInfo) {
                    abiItem._diamondFacet = facetName;
                }
                combinedAbi.push(abiItem);
                errorSignatures.add(errorSignature);
                counters.totalErrors++;
            }
        }
    }
}
exports.HardhatDiamondAbiGenerator = HardhatDiamondAbiGenerator;
/**
 * Convenience function to generate diamond ABI using Hardhat runtime environment
 *
 * @param hre - Hardhat runtime environment
 * @param options - Generation options including diamondName
 * @returns Promise resolving to generation result
 */
async function generateDiamondAbi(hre, options) {
    const generator = new HardhatDiamondAbiGenerator(hre, options);
    return generator.generateAbi();
}
