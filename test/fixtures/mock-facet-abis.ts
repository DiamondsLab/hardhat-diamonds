/**
 * Mock facet ABIs for testing selector extraction
 */

/**
 * Mock ABI for DiamondCutFacet with one function
 */
export const mockDiamondCutFacetAbi = [
  {
    type: "function",
    name: "diamondCut",
    inputs: [
      {
        name: "_diamondCut",
        type: "tuple[]",
        components: [
          { name: "facetAddress", type: "address" },
          { name: "action", type: "uint8" },
          { name: "functionSelectors", type: "bytes4[]" },
        ],
      },
      { name: "_init", type: "address" },
      { name: "_calldata", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

/**
 * Mock ABI for DiamondLoupeFacet with multiple functions
 */
export const mockDiamondLoupeFacetAbi = [
  {
    type: "function",
    name: "facets",
    inputs: [],
    outputs: [
      {
        name: "facets_",
        type: "tuple[]",
        components: [
          { name: "facetAddress", type: "address" },
          { name: "functionSelectors", type: "bytes4[]" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "facetFunctionSelectors",
    inputs: [{ name: "_facet", type: "address" }],
    outputs: [{ name: "facetFunctionSelectors_", type: "bytes4[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "facetAddresses",
    inputs: [],
    outputs: [{ name: "facetAddresses_", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "facetAddress",
    inputs: [{ name: "_functionSelector", type: "bytes4" }],
    outputs: [{ name: "facetAddress_", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [{ name: "_interfaceId", type: "bytes4" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
];

/**
 * Mock ABI for OwnershipFacet
 */
export const mockOwnershipFacetAbi = [
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "_newOwner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

/**
 * Mock ABI with no functions (edge case)
 */
export const mockEmptyFacetAbi: unknown[] = [];

/**
 * Mock ABI with non-function entries (should be filtered out)
 */
export const mockMixedAbi = [
  {
    type: "function",
    name: "testFunction",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "TestEvent",
    inputs: [{ name: "value", type: "uint256", indexed: false }],
  },
  {
    type: "error",
    name: "TestError",
    inputs: [{ name: "message", type: "string" }],
  },
  {
    type: "function",
    name: "anotherFunction",
    inputs: [{ name: "param", type: "uint256" }],
    outputs: [{ name: "result", type: "bool" }],
    stateMutability: "view",
  },
];

/**
 * Mock ABIs with duplicate selectors (collision test)
 * Two different functions that would hash to the same selector (for testing purposes)
 */
export const mockFacet1AbiWithCollision = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
    stateMutability: "nonpayable",
  },
];

export const mockFacet2AbiWithCollision = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
];

/**
 * Mock ABI with complex types
 */
export const mockComplexTypesAbi = [
  {
    type: "function",
    name: "complexFunction",
    inputs: [
      { name: "simpleParam", type: "uint256" },
      { name: "arrayParam", type: "address[]" },
      {
        name: "tupleParam",
        type: "tuple",
        components: [
          { name: "field1", type: "uint256" },
          { name: "field2", type: "string" },
        ],
      },
      {
        name: "nestedTupleParam",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          {
            name: "data",
            type: "tuple",
            components: [
              { name: "value", type: "uint256" },
              { name: "label", type: "string" },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: "result", type: "bool" }],
    stateMutability: "nonpayable",
  },
];
