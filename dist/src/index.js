"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiamondsConfig = void 0;
const config_1 = require("hardhat/config");
const plugins_1 = require("hardhat/plugins");
const DiamondsConfig_1 = require("./DiamondsConfig");
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
var DiamondsConfig_2 = require("./DiamondsConfig");
Object.defineProperty(exports, "DiamondsConfig", { enumerable: true, get: function () { return __importDefault(DiamondsConfig_2).default; } });
