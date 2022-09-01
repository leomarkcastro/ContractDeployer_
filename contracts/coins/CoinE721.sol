// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./experimental/ERC721Capped.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CoinE721 is ERC721Capped, OwnableUpgradeable {
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
        __ERC721Capped_init(0, _maxSupply);
        __ERC721_init(_name, _symbol);
    }

    function mint(address _to, uint256 _id) public {
        _mint(_to, _id);
    }
}
