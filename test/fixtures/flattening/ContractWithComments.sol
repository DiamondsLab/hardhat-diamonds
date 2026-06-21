// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Standard import statement
import "./SimpleContract.sol";
import { Library } from "./Library.sol";

/**
 * @title ContractWithComments
 * @author Test Author
 * @notice This contract tests comment preservation during deduplication
 * @dev All comment types should be preserved:
 *      - Inline comments with double slash
 *      - Block comments with slash-star notation
 *      - NatSpec documentation with triple slash or slash-double-star
 */
contract ContractWithComments {
    // State variable with inline comment
    uint256 public value; // This is an inline comment

    /*
     * Multi-line block comment
     * explaining the purpose of this variable
     */
    address public owner;

    /// @notice Single-line NatSpec comment
    /// @dev Can span multiple lines with /// prefix
    string public description;

    /**
     * @notice Constructor with NatSpec
     * @param _initialValue Initial value to set
     */
    constructor(uint256 _initialValue) {
        value = _initialValue; // Initialize value
        owner = msg.sender; /* Set owner to deployer */
    }

    /**
     * @notice Sets a new value
     * @dev This function demonstrates comment preservation
     * @param _newValue The new value to set
     */
    function setValue(uint256 _newValue) public {
        // Only owner can set value
        require(msg.sender == owner, "Not authorized");
        
        /* Update the value
         * and emit an event
         */
        value = _newValue;
    }

    /// @notice Gets the current value
    /// @return The current value
    function getValue() public view returns (uint256) {
        return value; // Return stored value
    }

    /*
     * Internal helper function
     * with multi-line block comment
     */
    function _internalHelper() internal pure returns (bool) {
        // Implementation details
        return true; /* Always returns true */
    }
}
