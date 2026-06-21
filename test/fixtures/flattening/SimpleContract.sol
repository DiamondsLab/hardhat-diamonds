// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleContract
 * @dev A basic contract with no imports for testing SourceResolver
 */
contract SimpleContract {
    uint256 public value;
    
    constructor(uint256 _initialValue) {
        value = _initialValue;
    }
    
    function setValue(uint256 _newValue) external {
        value = _newValue;
    }
    
    function getValue() external view returns (uint256) {
        return value;
    }
}
