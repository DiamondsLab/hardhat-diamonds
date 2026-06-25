// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CircularB.sol";

/**
 * @title CircularA
 * @dev Part of a circular dependency: A → B → C → A
 */
contract CircularA {
    function useB() external pure returns (string memory) {
        return "CircularA uses CircularB";
    }
}
