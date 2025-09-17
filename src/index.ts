import { extendConfig, extendEnvironment } from "hardhat/config";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import { lazyObject } from "hardhat/plugins";
import { DiamondsPathsConfig } from "./type-extensions";
import { DiamondsConfig } from "./DiamondsConfig";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // Set default diamonds config to an empty object if not provided
    // console.log('diamonds config:', userConfig.diamonds);
    const defaultDiamondsConfig: DiamondsPathsConfig = {
      // Default values for diamonds config
      paths: {},
    };
    config.diamonds = {
      ...defaultDiamondsConfig,
      ...userConfig.diamonds,
    };
  }
);

extendEnvironment((hre) => {
  // Attach our helper to the runtime environment under hre.diamonds.
  hre.diamonds = lazyObject(() => new DiamondsConfig(hre));
});

export { default as DiamondsConfig } from "./DiamondsConfig";
