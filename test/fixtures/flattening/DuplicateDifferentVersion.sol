// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DuplicateContract
 * @dev This is a DIFFERENT version of DuplicateContract with same name
 * Used to test version mismatch detection
 */
contract DuplicateContract {
    uint256 public value;
    string public name; // Additional field - different version

    function setValue(uint256 _value) public {
        value = _value;
    }

    function getValue() public view returns (uint256) {
        return value;
    }

    // Additional method - different version
    function setName(string memory _name) public {
        name = _name;
    }
}
