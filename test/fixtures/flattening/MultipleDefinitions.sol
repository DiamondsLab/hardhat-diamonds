// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MultipleDefinitions
 * @dev This file contains multiple definition types to test extraction
 */

// Interface definition
interface IMultipleDefinitions {
    function doSomething() external;
}

// Library definition
library MultipleDefinitionsLib {
    function helper() internal pure returns (uint256) {
        return 42;
    }
}

// Abstract contract definition
abstract contract AbstractMultipleDefinitions {
    function abstractMethod() public virtual returns (uint256);
}

// Concrete contract definition
contract MultipleDefinitions is AbstractMultipleDefinitions {
    function abstractMethod() public pure override returns (uint256) {
        return MultipleDefinitionsLib.helper();
    }

    function doSomething() public pure {}
}
