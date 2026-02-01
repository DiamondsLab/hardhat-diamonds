// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SimpleContract.sol";
import "./Library.sol";

/**
 * @title ContractWithImports
 * @dev A contract that imports other local contracts using relative paths
 */
contract ContractWithImports {
    using Library for uint256;
    
    SimpleContract public simpleContract;
    uint256 public multiplier;
    
    constructor(address _simpleContract, uint256 _multiplier) {
        simpleContract = SimpleContract(_simpleContract);
        multiplier = _multiplier;
    }
    
    function getMultipliedValue() external view returns (uint256) {
        uint256 currentValue = simpleContract.getValue();
        return currentValue.multiply(multiplier);
    }
    
    function addToValue(uint256 _amount) external pure returns (uint256) {
        return _amount.add(100);
    }
}
