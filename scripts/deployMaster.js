const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

let factory;
let erc20;
let erc721;
let erc1155;

const deployments = {
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
  CoinMaker: async (treasury = null) => {
    const [deployer] = await ethers.getSigners();
    if (treasury === null) {
      treasury = deployer.address;
    }
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
};

async function deploy_CoinMaker() {
  const [deployer] = await ethers.getSigners();
  for (const [name, deploy] of Object.entries(deployments)) {
    console.log("Deploying", name, "...");
    console.log("------------------------------------------------------");

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const _contract = await deploy();

    console.log(`[${name}] address:`, _contract.address);
    console.log();
  }

  // console.log("Deploying CoinMaker...");
  // console.log("------------------------------------------------------");
  // const [deployer] = await ethers.getSigners();

  // console.log("Deploying contracts with the account:", deployer.address);
  // console.log("Account balance:", (await deployer.getBalance()).toString());

  // const CoinMakerV1 = await ethers.getContractFactory("CoinMakerV1");
  // const contract = await upgrades.deployProxy(CoinMakerV1, [], {
  //   initializer: "initialize",
  // });
  // await contract.deployed();

  // console.log("[CoinMakerV1] address:", contract.address);

  // fs.writeFileSync(
  //   "deploy.json",
  //   JSON.stringify({
  //     address: contract.address,
  //   }),
  //   "utf8"
  // );
}

deploy_CoinMaker()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
$ npx hardhat test && npx hardhat run scripts/deployMaster.js --network rinkeby && echo "Deploy Success" || echo "Deploy Failed" 

  Bank Test
    Bank
      Dummy Token Tests
        √ ERC20 - minting and capped
        √ ERC20 - owner transferrable
        √ ERC721 - minting and capped
        √ ERC721 - owner transferrable
        √ ERC1155 - minting and capped
        √ ERC1155 - owner transferrable
      Version 1 Tests
        √ can change token models
        √ can create ERC20 contracts
        √ can create ERC721 contracts
        √ can create ERC1155 contracts

·-------------------------------------|---------------------------|--------------|-----------------------------·
|         Solc version: 0.8.4         ·  Optimizer enabled: true  ·  Runs: 1000  ·  Block limit: 30000000 gas  │
······································|···························|··············|······························
|  Methods                            ·               11 gwei/gas                ·       1552.49 eur/eth       │
················|·····················|·············|·············|··············|···············|··············
|  Contract     ·  Method             ·  Min        ·  Max        ·  Avg         ·  # calls      ·  eur (avg)  │
················|·····················|·············|·············|··············|···············|··············
|  CoinE1155    ·  mint               ·      51972  ·      54665  ·       52876  ·            6  ·       0.90  │
················|·····················|·············|·············|··············|···············|··············
|  CoinE1155    ·  transferOwnership  ·          -  ·          -  ·       28641  ·            1  ·       0.49  │
················|·····················|·············|·············|··············|···············|··············
|  CoinE20      ·  mint               ·      70668  ·      75585  ·       73705  ·            5  ·       1.26  │
················|·····················|·············|·············|··············|···············|··············
|  CoinE20      ·  transferOwnership  ·          -  ·          -  ·       28641  ·            1  ·       0.49  │
················|·····················|·············|·············|··············|···············|··············
|  CoinE721     ·  mint               ·      55810  ·      72898  ·       60082  ·            4  ·       1.03  │
················|·····················|·············|·············|··············|···············|··············
|  CoinE721     ·  transferOwnership  ·          -  ·          -  ·       28644  ·            1  ·       0.49  │
················|·····················|·············|·············|··············|···············|··············
|  CoinMakerV1  ·  createERC1155      ·     212683  ·     212719  ·      212701  ·            2  ·       3.63  │
················|·····················|·············|·············|··············|···············|··············
|  CoinMakerV1  ·  createERC20        ·     207735  ·     207759  ·      207747  ·            2  ·       3.55  │
················|·····················|·············|·············|··············|···············|··············
|  CoinMakerV1  ·  createERC721       ·     210112  ·     210148  ·      210130  ·            2  ·       3.59  │
················|·····················|·············|·············|··············|···············|··············
|  CoinMakerV1  ·  setERC1155Model    ·          -  ·          -  ·       33540  ·            1  ·       0.57  │
················|·····················|·············|·············|··············|···············|··············
|  CoinMakerV1  ·  setERC20Model      ·          -  ·          -  ·       33539  ·            1  ·       0.57  │
················|·····················|·············|·············|··············|···············|··············
|  CoinMakerV1  ·  setERC721Model     ·          -  ·          -  ·       33562  ·            1  ·       0.57  │
················|·····················|·············|·············|··············|···············|··············
|  CoinMakerV1  ·  transferOwnership  ·      31298  ·      31313  ·       31305  ·            6  ·       0.53  │
················|·····················|·············|·············|··············|···············|··············
|  Deployments                        ·                                          ·  % of limit   ·             │
······································|·············|·············|··············|···············|··············
|  CoinE1155                          ·          -  ·          -  ·     2033244  ·        6.8 %  ·      34.72  │
······································|·············|·············|··············|···············|··············
|  CoinE20                            ·          -  ·          -  ·     1245493  ·        4.2 %  ·      21.27  │
······································|·············|·············|··············|···············|··············
|  CoinE721                           ·          -  ·          -  ·     1831302  ·        6.1 %  ·      31.27  │
······································|·············|·············|··············|···············|··············
|  CoinMakerV1                        ·          -  ·          -  ·      940269  ·        3.1 %  ·      16.06  │
·-------------------------------------|-------------|-------------|--------------|---------------|-------------·

  10 passing (7s)

Deploying ERC20 ...
------------------------------------------------------
Deploying contracts with the account: 0x2B8e57b52Da12876707C56d42FD4ae3Be890e7B9
Account balance: 697939128360935598
[ERC20] address: 0x2Db14cf63E6210E785F7ce20e2b825A38664D38c

Deploying ERC721 ...
------------------------------------------------------
Deploying contracts with the account: 0x2B8e57b52Da12876707C56d42FD4ae3Be890e7B9
Account balance: 695457770013107147
[ERC721] address: 0xDafD31a7A48Ae7CA1F0D3348837E91112629595d

Deploying ERC1155 ...
------------------------------------------------------
Deploying contracts with the account: 0x2B8e57b52Da12876707C56d42FD4ae3Be890e7B9
Account balance: 691809321964748033
[ERC1155] address: 0x29792884a01f8aE26dA3d1a013cB04Dd6C14B28a

Deploying BankV1 ...
------------------------------------------------------
Deploying contracts with the account: 0x2B8e57b52Da12876707C56d42FD4ae3Be890e7B9
Account balance: 687758550926635325
[BankV1] address: 0xa206DA3595DBcCE064DB52B29Ab153659D3d0a95
*/
