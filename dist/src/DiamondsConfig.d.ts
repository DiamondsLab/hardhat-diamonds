/**
 * HardhatRuntimeEnvironment class
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DiamondPathsConfig, DiamondsPathsConfig } from "./type-extensions";
export declare class DiamondsConfig {
    private hre;
    diamonds: DiamondsPathsConfig;
    constructor(hre: HardhatRuntimeEnvironment);
    /**
      const config = this.diamondsConfig[diamondName] as any; // Ensure type compatibility
     * @param diamondName - The name of the diamond.
     */
    getDiamondConfig(diamondName: string): DiamondPathsConfig;
}
export default DiamondsConfig;
