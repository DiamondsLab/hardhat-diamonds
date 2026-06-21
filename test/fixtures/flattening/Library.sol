// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Library
 * @dev A simple library that will be imported by other contracts
 */
library Library {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }
    
    function multiply(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }
}
