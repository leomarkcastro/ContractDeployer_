// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC721/extensions/ERC721Capped.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

/**
 * @dev Extension of {ERC721} that adds a cap to the supply of tokens.
 */
abstract contract ERC721Capped is ERC721Upgradeable {
    uint256 private _start;
    uint256 private _end;

    function __ERC721Capped_init(uint256 start_, uint256 end_)
        internal
        onlyInitializing
    {
        __ERC721Capped_init_unchained(start_, end_);
    }

    function __ERC721Capped_init_unchained(uint256 start_, uint256 end_)
        internal
        onlyInitializing
    {
        require(
            start_ <= end_,
            "ERC721Capped: end number should be equal or greater than start number"
        );
        _start = start_;
        _end = end_;
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
     * @dev See {ERC721-_mint}.
     */
    function _mint(address to, uint256 tokenId) internal virtual override {
        require(
            tokenId >= capStart(),
            "ERC721Capped: tokenID below global startCap"
        );
        require(
            tokenId <= capEnd(),
            "ERC721Capped: tokenID above global endCap"
        );
        super._mint(to, tokenId);
    }
}
