// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FacetC
 * @notice Simple view functions facet for testing
 */
contract FacetC {
    bytes32 constant COUNTER_POSITION = keccak256("diamond.facetc.counter");

    function counterStorage() internal pure returns (uint256 counter) {
        bytes32 position = COUNTER_POSITION;
        assembly {
            counter := sload(position)
        }
    }

    function setCounterStorage(uint256 value) internal {
        bytes32 position = COUNTER_POSITION;
        assembly {
            sstore(position, value)
        }
    }

    /**
     * @notice Increments the counter
     */
    function increment() external {
        uint256 current = counterStorage();
        setCounterStorage(current + 1);
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
        setCounterStorage(0);
    }

    /**
     * @notice Checks if counter is zero
     * @return True if counter is zero
     */
    function isCounterZero() external view returns (bool) {
        return counterStorage() == 0;
    }
}
