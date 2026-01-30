/**
 * Mock Diamond configurations for testing DiamondFlattener
 */

/**
 * Valid Diamond configuration with multiple facets
 */
export const mockDiamondConfigWithFacets = {
  protocolVersion: 1.0,
  protocolInitFacet: "ExampleInitFacet",
  protocolExcludeFuncSelectors: [],
  facets: {
    DiamondCutFacet: {
      priority: 10,
      versions: {
        "0.0": {},
      },
    },
    DiamondLoupeFacet: {
      priority: 20,
      versions: {
        "0.0": {},
      },
    },
    ExampleOwnershipFacet: {
      priority: 30,
      versions: {
        "0.0": {},
      },
    },
    ExampleInitFacet: {
      priority: 40,
      versions: {
        "0.0": {
          deployInit: "diamondInitialize000()",
        },
        "1.0": {
          deployInit: "diamondInitialize100()",
          upgradeInit: "diamondUpgrade100()",
          fromVersions: [0.0],
        },
      },
    },
  },
};

/**
 * Diamond configuration with no facets (edge case)
 */
export const mockDiamondConfigEmpty = {
  protocolVersion: 1.0,
  protocolInitFacet: "",
  protocolExcludeFuncSelectors: [],
  facets: {},
};

/**
 * Diamond configuration with init contracts
 */
export const mockDiamondConfigWithInit = {
  protocolVersion: 1.0,
  protocolInitFacet: "DiamondInit",
  protocolExcludeFuncSelectors: [],
  facets: {
    DiamondCutFacet: {
      priority: 10,
      versions: {
        "0.0": {},
      },
    },
    DiamondInit: {
      priority: 50,
      versions: {
        "0.0": {
          deployInit: "init()",
        },
      },
    },
  },
};

/**
 * Diamond configuration with mixed priority facets
 */
export const mockDiamondConfigMixedPriority = {
  protocolVersion: 1.0,
  protocolInitFacet: "InitFacet",
  protocolExcludeFuncSelectors: [],
  facets: {
    LowPriorityFacet: {
      priority: 5,
      versions: {
        "0.0": {},
      },
    },
    HighPriorityFacet: {
      priority: 100,
      versions: {
        "0.0": {},
      },
    },
    MediumPriorityFacet: {
      priority: 50,
      versions: {
        "0.0": {},
      },
    },
    InitFacet: {
      priority: 200,
      versions: {
        "0.0": {
          deployInit: "initialize()",
        },
      },
    },
  },
};
