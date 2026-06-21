// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FacetB
 * @notice Simple calculation facet for testing
 */
contract FacetB {
    /**
     * @notice Adds two numbers
     * @param a First number
     * @param b Second number
     * @return The sum of a and b
     */
    function add(uint256 a, uint256 b) external pure returns (uint256) {
        return a + b;
    }

    /**
     * @notice Subtracts two numbers
     * @param a First number
     * @param b Second number
     * @return The difference of a minus b
     */
    function subtract(uint256 a, uint256 b) external pure returns (uint256) {
        require(a >= b, "FacetB: underflow");
        return a - b;
    }

    /**
     * @notice Multiplies two numbers
     * @param a First number
     * @param b Second number
     * @return The product of a and b
     */
    function multiply(uint256 a, uint256 b) external pure returns (uint256) {
        return a * b;
    }
}
