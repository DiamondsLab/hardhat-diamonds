// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import { IDiamondCut } from "@diamondslab/diamonds/contracts/interfaces/IDiamondCut.sol";
import "contracts-starter/contracts/facets/DiamondCutFacet.sol";
// import { DiamondBase } from "@diamondslab/diamonds/contracts/DiamondBase.sol";
import "contracts-starter/contracts/Diamond.sol";

/**
 * @title SimpleDiamond
 * @notice A basic Diamond implementation for testing flatten functionality
 * @dev Used as a test fixture for Epic 6 integration tests
 */
contract SimpleDiamond is Diamond {
    constructor(
        address _contractOwner,
        address _diamondCutFacet
    ) payable Diamond(_contractOwner, _diamondCutFacet) {}
}
