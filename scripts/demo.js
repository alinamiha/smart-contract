const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners()
  const balance = await signer.getBalance()
  console.log(balance);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exitCode = 1;
});