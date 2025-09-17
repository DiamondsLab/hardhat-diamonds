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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiamondsConfig = void 0;
const config_1 = require("hardhat/config");
const plugins_1 = require("hardhat/plugins");
const DiamondsConfig_1 = require("./DiamondsConfig");
// Import tasks to register them with Hardhat
require("./tasks");
(0, config_1.extendConfig)((config, userConfig) => {
    // Set default diamonds config to an empty object if not provided
    // console.log('diamonds config:', userConfig.diamonds);
    const defaultDiamondsConfig = {
        // Default values for diamonds config
        paths: {},
    };
    config.diamonds = {
        ...defaultDiamondsConfig,
        ...userConfig.diamonds,
    };
});
(0, config_1.extendEnvironment)((hre) => {
    // Attach our helper to the runtime environment under hre.diamonds.
    hre.diamonds = (0, plugins_1.lazyObject)(() => new DiamondsConfig_1.DiamondsConfig(hre));
});
// Export main configuration class
var DiamondsConfig_2 = require("./DiamondsConfig");
Object.defineProperty(exports, "DiamondsConfig", { enumerable: true, get: function () { return __importDefault(DiamondsConfig_2).default; } });
// Re-export all task-related exports for external use
__exportStar(require("./tasks"), exports);
