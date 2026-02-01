// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { SimpleContract } from "./SimpleContract.sol";
import { Library } from "./Library.sol";

/**
 * @title NamedImports
 * @dev A contract that uses named import syntax
 */
contract NamedImports {
    using Library for uint256;
    
    SimpleContract private _contract;
    
    constructor() {
        _contract = new SimpleContract(42);
    }
    
    function calculate(uint256 a, uint256 b) external pure returns (uint256) {
        return a.add(b);
    }
    
    function getContractValue() external view returns (uint256) {
        return _contract.getValue();
    }
}
