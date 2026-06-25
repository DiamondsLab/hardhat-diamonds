// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CircularA.sol";

/**
 * @title CircularC
 * @dev Part of a circular dependency: A → B → C → A
 */
contract CircularC {
    function useA() external pure returns (string memory) {
        return "CircularC uses CircularA";
    }
}
