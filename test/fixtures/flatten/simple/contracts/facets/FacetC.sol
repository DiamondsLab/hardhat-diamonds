// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FacetC
 * @notice Simple view functions facet for testing
 */
contract FacetC {
    bytes32 constant COUNTER_POSITION = keccak256("diamond.facetc.counter");

    function counterStorage() internal pure returns (uint256 storage counter) {
        bytes32 position = COUNTER_POSITION;
        assembly {
            counter.slot := position
        }
    }

    /**
     * @notice Increments the counter
     */
    function increment() external {
        uint256 storage counter = counterStorage();
        counter++;
    }

    /**
     * @notice Gets the current counter value
     * @return The current counter
     */
    function getCounter() external view returns (uint256) {
        return counterStorage();
    }

    /**
     * @notice Resets the counter to zero
     */
    function resetCounter() external {
        uint256 storage counter = counterStorage();
        counter = 0;
    }

    /**
     * @notice Checks if counter is zero
     * @return True if counter is zero
     */
    function isCounterZero() external view returns (bool) {
        return counterStorage() == 0;
    }
}
