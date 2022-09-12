// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/extensions/ERC1155Capped.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";

/**
 * @dev Extension of {ERC1155} that adds a cap to the supply of tokens.
 */
abstract contract ERC1155NamedCapped is ERC1155Upgradeable {
    uint256 private _start;
    uint256 private _end;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    /**
     * @dev Sets the value of the `cap`. This value is immutable, it can only be
     * set once during construction.
     */
    function __ERC1155Capped_init(
        uint256 start_,
        uint256 end_,
        string memory name_,
        string memory symbol_
    ) internal onlyInitializing {
        __ERC1155Capped_init_unchained(start_, end_, name_, symbol_);
    }

    function __ERC1155Capped_init_unchained(
        uint256 start_,
        uint256 end_,
        string memory name_,
        string memory symbol_
    ) internal onlyInitializing {
        require(
            start_ <= end_,
            "ERC1155Capped: end number should be equal or greater than start number"
        );
        _start = start_;
        _end = end_;
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the start id of all the tokens to be minted.
     */
    function capStart() public view virtual returns (uint256) {
        return _start;
    }

    /**
     * @dev Returns the end id of all the tokens to be minted ().
     */
    function capEnd() public view virtual returns (uint256) {
        return _end;
    }

    /**
     * @dev See {ERC1155-_mint}.
     */
    function _mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual override {
        require(
            id >= capStart(),
            "ERC1155Capped: tokenID below global startCap"
        );
        require(id <= capEnd(), "ERC1155Capped: tokenID above global endCap");
        super._mint(to, id, amount, data);
    }
}
