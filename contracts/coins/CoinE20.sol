// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CoinE20 is ERC20CappedUpgradeable, OwnableUpgradeable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint _maxSupply
    ) {
        init(_name, _symbol, _maxSupply);
    }

    function init(
        string memory _name,
        string memory _symbol,
        uint _maxSupply
    ) public initializer {
        __Ownable_init();
        __ERC20Capped_init(_maxSupply);
        __ERC20_init(_name, _symbol);
    }

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}
