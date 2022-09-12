// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./experimental/ERC1155NamedCapped.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CoinE1155 is ERC1155NamedCapped, OwnableUpgradeable {
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
        __ERC1155Capped_init(0, _maxSupply, _name, _symbol);
        __ERC1155_init("");
    }

    function mint(
        address _to,
        uint256 _id,
        uint256 _amount
    ) public {
        _mint(_to, _id, _amount, "");
    }
}
