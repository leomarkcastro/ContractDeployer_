// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./experimental/CloneFactory.sol";

import "./coins/CoinE20.sol";
import "./coins/CoinE721.sol";
import "./coins/CoinE1155.sol";

contract CoinMakerVariables {
    address public treasury;
    address public ERC20ModelAddress;
    address public ERC1155ModelAddress;
    address public ERC721ModelAddress;
}

contract CoinMakerV1 is
    Initializable,
    OwnableUpgradeable,
    CoinMakerVariables,
    CloneFactory
{
    event ERC20Created(address newContractAddress, address modelAddress);
    event ERC721Created(address newContractAddress, address modelAddress);
    event ERC1155Created(address newContractAddress, address modelAddress);

    function initialize(
        address _treasury,
        address _ERC20Model,
        address _ERC1155Model,
        address _ERC721Model
    ) public initializer {
        __Ownable_init();
        setERC20Model(_ERC20Model);
        setERC1155Model(_ERC1155Model);
        setERC721Model(_ERC721Model);
        setTreasuryAddress(_treasury);
    }

    modifier paymentRequired() {
        require(msg.value == 0.001 ether, "Payment required");
        payable(treasury).transfer(msg.value);
        _;
    }

    function setERC20Model(address _ERC20Model) public onlyOwner {
        ERC20ModelAddress = _ERC20Model;
    }

    function setERC1155Model(address _ERC1155Model) public onlyOwner {
        ERC1155ModelAddress = _ERC1155Model;
    }

    function setERC721Model(address _ERC721Model) public onlyOwner {
        ERC721ModelAddress = _ERC721Model;
    }

    function setTreasuryAddress(address _treasury) public onlyOwner {
        treasury = _treasury;
    }

    function checkInstance(address model, address instance)
        public
        view
        returns (bool)
    {
        return isClone(model, instance);
    }

    function createERC20(
        string memory _name,
        string memory _symbol,
        uint _maxSupply
    ) external payable paymentRequired {
        address clone = createClone(ERC20ModelAddress);
        CoinE20(clone).init(_name, _symbol, _maxSupply);
        CoinE20(clone).transferOwnership(_msgSender());
        emit ERC20Created(clone, ERC20ModelAddress);
    }

    function createERC721(
        string memory _name,
        string memory _symbol,
        uint _maxSupply
    ) external payable paymentRequired {
        address clone = createClone(ERC721ModelAddress);
        CoinE721(clone).init(_name, _symbol, _maxSupply);
        CoinE721(clone).transferOwnership(_msgSender());
        emit ERC721Created(clone, ERC721ModelAddress);
    }

    function createERC1155(
        string memory _name,
        string memory _symbol,
        uint _maxSupply
    ) external payable paymentRequired {
        address clone = createClone(ERC1155ModelAddress);
        CoinE1155(clone).init(_name, _symbol, _maxSupply);
        CoinE1155(clone).transferOwnership(_msgSender());
        emit ERC1155Created(clone, ERC1155ModelAddress);
    }
}
