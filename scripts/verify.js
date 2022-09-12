const console = require("console");
const hre = require("hardhat");

// Define the NFT

async function verifyAndPublish(address, constructorArguments) {
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: constructorArguments,
  });
}

verifyAndPublish("0x6573e299264C7B21a8982826FbA7B66819c52f43", [
  "0x2Db14cf63E6210E785F7ce20e2b825A38664D38c",
  "0x29792884a01f8aE26dA3d1a013cB04Dd6C14B28a",
  "0xDafD31a7A48Ae7CA1F0D3348837E91112629595d",
])
  .then(() => {
    console.log("Successfully deployed the contract");
  })
  .catch((err) => {
    console.log("Error deploying the contract");
    console.log(err);
  });
