const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

async function upgrade_CoinMaker() {
  console.log("Upgrading CoinMaker...");
  console.log("------------------------------------------------------");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const json = fs.readFileSync("deploy.json", "utf8");
  const coinMakerAddress = JSON.parse(json).address;

  const CoinMakerV2 = await ethers.getContractFactory("CoinMakerV2");
  await upgrades.upgradeProxy(coinMakerAddress, CoinMakerV2);

  console.log("[CoinMaker] [upgraded] address:", coinMakerAddress);

  // const contract = await ethers.getContractAt("BankV2", BankAddress);
  // console.log(await contract.getSavedValue());

  return coinMakerAddress;
}

upgrade_CoinMaker()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
