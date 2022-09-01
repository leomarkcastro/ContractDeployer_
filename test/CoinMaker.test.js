const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

let factory;
let erc20;
let erc721;
let erc1155;

describe("Bank Test", function () {
  const deployments = {
    BankV1: async (treasury) => {
      const CoinMaker = await ethers.getContractFactory("CoinMakerV1");
      factory = await upgrades.deployProxy(
        CoinMaker,
        [treasury, erc20.address, erc1155.address, erc721.address],
        {
          initializer: "initialize",
        }
      );
      await factory.deployed();
      return factory;
    },
    ERC20: async (maxCap = 1000) => {
      const ERC20 = await ethers.getContractFactory("CoinE20");
      erc20 = await ERC20.deploy("E20", "E20", maxCap);
      await erc20.deployed();
      return erc20;
    },
    ERC721: async (maxCap = 3) => {
      const ERC721 = await ethers.getContractFactory("CoinE721");
      erc721 = await ERC721.deploy("E20", "E20", maxCap);
      await erc721.deployed();
      return erc721;
    },
    ERC1155: async (maxCap = 3) => {
      const ERC1155 = await ethers.getContractFactory("CoinE1155");
      erc1155 = await ERC1155.deploy("E20", "E20", maxCap);
      await erc1155.deployed();
      return erc1155;
    },
  };

  const situations = {
    allTokensDeployed: async () => {
      await deployments.ERC20();
      await deployments.ERC721();
      await deployments.ERC1155();
    },
  };

  const utilities = {
    getLatestEvent: async (contract, filterType) => {
      const eventFilter = contract.filters[filterType]();
      const events = await factory.queryFilter(eventFilter, "latest");
      return events[0]?.args;
    },
    attachAddress: async (contractName, address) => {
      const ABI = await ethers.getContractFactory(contractName);
      const instance = await ABI.attach(address);
      return instance;
    },
  };

  describe("Bank", function () {
    describe("Dummy Token Tests", function () {
      it("ERC20 - minting and capped", async function () {
        // Load initial states
        const [owner, user1] = await ethers.getSigners();
        await situations.allTokensDeployed();

        // Mint to owner
        await erc20.mint(owner.address, 1000);
        expect(await erc20.balanceOf(owner.address)).to.eq(1000);

        // Should fail because the max cap is 1000
        await expect(erc20.mint(user1.address, 1000)).to.be.reverted;
      });
      it("ERC20 - owner transferrable", async function () {
        // Load initial states
        const [owner, user1] = await ethers.getSigners();
        await situations.allTokensDeployed();

        // Transfer
        expect(await erc20.owner()).to.eq(owner.address);
        await erc20.transferOwnership(user1.address);
        expect(await erc20.owner()).to.eq(user1.address);
      });
      it("ERC721 - minting and capped", async function () {
        // Load initial states
        const [owner, user1] = await ethers.getSigners();
        await situations.allTokensDeployed();

        // Mint to owner
        for (let i = 0; i <= 3; i++) {
          await erc721.mint(owner.address, i);
          expect(await erc721.ownerOf(i)).to.eq(owner.address);
        }

        // Should fail because the max cap is 1000
        await expect(erc721.mint(user1.address, 4)).to.be.reverted;
      });
      it("ERC721 - owner transferrable", async function () {
        // Load initial states
        const [owner, user1] = await ethers.getSigners();
        await situations.allTokensDeployed();

        // Transfer
        expect(await erc721.owner()).to.eq(owner.address);
        await erc721.transferOwnership(user1.address);
        expect(await erc721.owner()).to.eq(user1.address);
      });
      it("ERC1155 - minting and capped", async function () {
        // Load initial states
        const [owner, user1] = await ethers.getSigners();
        await situations.allTokensDeployed();

        // Mint to owner
        for (let i = 0; i <= 3; i++) {
          await erc1155.mint(owner.address, i, 1);
          expect(await erc1155.balanceOf(owner.address, i)).to.eq(1);
        }

        // Should fail because the max cap is 1000
        await expect(erc1155.mint(user1.address, 4, 1)).to.be.reverted;
      });
      it("ERC1155 - owner transferrable", async function () {
        // Load initial states
        const [owner, user1] = await ethers.getSigners();
        await situations.allTokensDeployed();

        // Transfer
        expect(await erc1155.owner()).to.eq(owner.address);
        await erc1155.transferOwnership(user1.address);
        expect(await erc1155.owner()).to.eq(user1.address);
      });
    });
    describe("Version 1 Tests", function () {
      // Setup before test to avoid state leaks
      beforeEach(async () => {
        await situations.allTokensDeployed();

        const [owner] = await ethers.getSigners();
        await deployments.BankV1(owner.address);
      });

      it("can change token models", async function () {
        await factory.setERC20Model(erc20.address);
        await factory.setERC721Model(erc721.address);
        await factory.setERC1155Model(erc1155.address);
        expect(await factory.ERC20ModelAddress()).to.eq(erc20.address);
        expect(await factory.ERC721ModelAddress()).to.eq(erc721.address);
        expect(await factory.ERC1155ModelAddress()).to.eq(erc1155.address);
      });
      it("can create ERC20 contracts", async function () {
        const [owner, user1, user2] = await ethers.getSigners();

        await factory.createERC20("E20", "E20", 1000, {
          value: ethers.utils.parseEther("0.001"),
        });
        const eventLog = await utilities.getLatestEvent(
          factory,
          "ERC20Created"
        );

        expect(
          await factory.checkInstance(
            eventLog.modelAddress,
            eventLog.newContractAddress
          )
        ).to.be.true;

        const e20Instance = await utilities.attachAddress(
          "CoinE20",
          eventLog["newContractAddress"]
        );
        expect(await e20Instance.totalSupply()).to.eq(0);
        await e20Instance.mint(owner.address, 1000);
        expect(await e20Instance.balanceOf(owner.address)).to.eq(1000);

        await e20Instance.transferOwnership(user1.address);
        expect(await e20Instance.owner()).to.eq(user1.address);

        // ============================================================== Test 2

        await factory.createERC20("E20B", "E20B", 500, {
          value: ethers.utils.parseEther("0.001"),
        });
        const eventLog2 = await utilities.getLatestEvent(
          factory,
          "ERC20Created"
        );

        expect(
          await factory.checkInstance(
            eventLog2.modelAddress,
            eventLog2.newContractAddress
          )
        ).to.be.true;

        // Double check to see if event Logs do update
        expect(eventLog["newContractAddress"]).to.not.eq(
          eventLog2["newContractAddress"]
        );

        const e20InstanceB = await utilities.attachAddress(
          "CoinE20",
          eventLog2["newContractAddress"]
        );
        expect(await e20InstanceB.totalSupply()).to.eq(0);
        await e20InstanceB.mint(owner.address, 500);
        expect(await e20InstanceB.balanceOf(owner.address)).to.eq(500);

        await e20InstanceB.transferOwnership(user2.address);
        expect(await e20InstanceB.owner()).to.eq(user2.address);
      });
      it("can create ERC721 contracts", async function () {
        const [owner, user1, user2] = await ethers.getSigners();

        await factory.createERC721("E721", "E721", 2, {
          value: ethers.utils.parseEther("0.001"),
        });
        const eventLog = await utilities.getLatestEvent(
          factory,
          "ERC721Created"
        );

        expect(
          await factory.checkInstance(
            eventLog.modelAddress,
            eventLog.newContractAddress
          )
        ).to.be.true;

        const e721Instance = await utilities.attachAddress(
          "CoinE721",
          eventLog["newContractAddress"]
        );
        await e721Instance.mint(owner.address, 1);
        expect(await e721Instance.ownerOf(1)).to.eq(owner.address);

        await e721Instance.transferOwnership(user1.address);
        expect(await e721Instance.owner()).to.eq(user1.address);

        // Test 2

        await factory.createERC721("E721B", "E721B", 500, {
          value: ethers.utils.parseEther("0.001"),
        });
        const eventLog2 = await utilities.getLatestEvent(
          factory,
          "ERC721Created"
        );

        expect(
          await factory.checkInstance(
            eventLog2.modelAddress,
            eventLog2.newContractAddress
          )
        ).to.be.true;

        // Double check to see if event Logs do update
        expect(eventLog["newContractAddress"]).to.not.eq(
          eventLog2["newContractAddress"]
        );

        const e721InstanceB = await utilities.attachAddress(
          "CoinE721",
          eventLog2["newContractAddress"]
        );
        await e721InstanceB.mint(owner.address, 1);
        expect(await e721InstanceB.ownerOf(1)).to.eq(owner.address);

        await e721InstanceB.transferOwnership(user2.address);
        expect(await e721InstanceB.owner()).to.eq(user2.address);
      });
      it("can create ERC1155 contracts", async function () {
        const [owner, user1, user2] = await ethers.getSigners();

        await factory.createERC1155("E1155", "E1155", 2, {
          value: ethers.utils.parseEther("0.001"),
        });
        const eventLog = await utilities.getLatestEvent(
          factory,
          "ERC1155Created"
        );

        expect(
          await factory.checkInstance(
            eventLog.modelAddress,
            eventLog.newContractAddress
          )
        ).to.be.true;

        const e1155Instance = await utilities.attachAddress(
          "CoinE1155",
          eventLog["newContractAddress"]
        );
        await e1155Instance.mint(owner.address, 1, 1);
        expect(await e1155Instance.balanceOf(owner.address, 1)).to.eq(1);

        await e1155Instance.transferOwnership(user1.address);
        expect(await e1155Instance.owner()).to.eq(user1.address);

        // Test 2

        await factory.createERC1155("E1155B", "E1155B", 500, {
          value: ethers.utils.parseEther("0.001"),
        });
        const eventLog2 = await utilities.getLatestEvent(
          factory,
          "ERC1155Created"
        );

        expect(
          await factory.checkInstance(
            eventLog2.modelAddress,
            eventLog2.newContractAddress
          )
        ).to.be.true;

        // Double check to see if event Logs do update
        expect(eventLog["newContractAddress"]).to.not.eq(
          eventLog2["newContractAddress"]
        );

        const e1155InstanceB = await utilities.attachAddress(
          "CoinE1155",
          eventLog2["newContractAddress"]
        );
        await e1155InstanceB.mint(owner.address, 1, 1);
        expect(await e1155InstanceB.balanceOf(owner.address, 1)).to.eq(1);

        await e1155InstanceB.transferOwnership(user2.address);
        expect(await e1155InstanceB.owner()).to.eq(user2.address);
      });
    });
  });
});
