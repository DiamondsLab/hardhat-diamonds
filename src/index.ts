import { extendConfig, extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import { DiamondsConfig } from "./DiamondsConfig";
import { DiamondsPathsConfig } from "./type-extensions";

// Import tasks to register them with Hardhat
import "./tasks";

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

// Export main configuration class
export { DiamondsConfig } from "./DiamondsConfig";

// Re-export all task-related exports for external use
export * from "./tasks";
