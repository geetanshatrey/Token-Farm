const WalterWhiteToken = artifacts.require("WalterWhiteToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, networks, accounts) {
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  await deployer.deploy(WalterWhiteToken)
  const walterWhiteToken = await WalterWhiteToken.deployed()

  await deployer.deploy(TokenFarm, walterWhiteToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  await walterWhiteToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // First Account of Ganache
  await daiToken.transfer(accounts[1], '100000000000000000000') 
}
