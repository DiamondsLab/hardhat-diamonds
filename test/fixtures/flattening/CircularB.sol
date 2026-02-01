// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CircularC.sol";

/**
 * @title CircularB
 * @dev Part of a circular dependency: A → B → C → A
 */
contract CircularB {
    function useC() external pure returns (string memory) {
        return "CircularB uses CircularC";
    }
}
