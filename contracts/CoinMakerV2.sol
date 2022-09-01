// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./CoinMakerV1.sol";

contract CoinMakerVariables2 is CoinMakerVariables {}

contract CoinMakerV2 is CoinMakerV1, CoinMakerVariables2 {}
