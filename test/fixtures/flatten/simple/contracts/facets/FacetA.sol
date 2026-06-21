// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FacetA
 * @notice Simple getter/setter facet for testing
 */
contract FacetA {
    bytes32 constant STORAGE_POSITION = keccak256("diamond.faceta.storage");

    struct FacetAStorage {
        uint256 value;
        string data;
    }

    function facetAStorage() internal pure returns (FacetAStorage storage ds) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    /**
     * @notice Sets a uint256 value
     * @param _value The value to set
     */
    function setValue(uint256 _value) external {
        FacetAStorage storage ds = facetAStorage();
        ds.value = _value;
    }

    /**
     * @notice Gets the current value
     * @return The stored value
     */
    function getValue() external view returns (uint256) {
        FacetAStorage storage ds = facetAStorage();
        return ds.value;
    }

    /**
     * @notice Sets string data
     * @param _data The string to store
     */
    function setData(string memory _data) external {
        FacetAStorage storage ds = facetAStorage();
        ds.data = _data;
    }

    /**
     * @notice Gets the stored string
     * @return The stored string
     */
    function getData() external view returns (string memory) {
        FacetAStorage storage ds = facetAStorage();
        return ds.data;
    }
}
