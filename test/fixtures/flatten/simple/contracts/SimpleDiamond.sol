// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { IDiamondCut } from "@diamondslab/diamonds/contracts/interfaces/IDiamondCut.sol";
import { DiamondBase } from "@diamondslab/diamonds/contracts/DiamondBase.sol";

/**
 * @title SimpleDiamond
 * @notice A basic Diamond implementation for testing flatten functionality
 * @dev Used as a test fixture for Epic 6 integration tests
 */
contract SimpleDiamond is DiamondBase {
    constructor(
        address _contractOwner,
        address _diamondCutFacet
    ) payable DiamondBase(_contractOwner, _diamondCutFacet) {}
}
