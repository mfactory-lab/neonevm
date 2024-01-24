// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { ethers, upgrades } from 'hardhat'
import { expect } from 'chai'

// ERC20ForSPL proxy deployed to 0x2cc12c6477cA4F4b703c81670C3a85993A6464Ef
// ERC20ForSPL implementation deployed to 0x06Ba5aD1FFEbEcED980dB10bDD5B327e783a7340

async function main() {
  const TOKEN_MINT = `0x${ethers.decodeBase58('F8s94y4EBKiYPGuXzzik2TXaGwSa29K1w3d5xvEEzcDx').toString(16)}`

  // const wallet = ethers.Wallet.createRandom()
  // console.log('privateKey:', wallet.privateKey)
  // console.log('address:', wallet.address)
  // console.log('mnemonic:', wallet.mnemonic?.phrase)
  // process.exit()

  const [owner] = await ethers.getSigners()
  const ERC20ForSPLFactory = await ethers.getContractFactory('ERC20ForSPL')

  const ERC20ForSPL = await upgrades.deployProxy(ERC20ForSPLFactory, [TOKEN_MINT], {
    kind: 'uups',
    initializer: 'initializeParent',
  })
  await ERC20ForSPL.waitForDeployment()

  const CONTRACT_OWNER = await ERC20ForSPL.owner()
  const IMPLEMENTATION = await upgrades.erc1967.getImplementationAddress(ERC20ForSPL.target.toString())

  console.log(
      `ERC20ForSPL proxy deployed to ${ERC20ForSPL.target}`,
  )
  console.log(
      `ERC20ForSPL implementation deployed to ${IMPLEMENTATION}`,
  )

  expect(owner.address).to.eq(CONTRACT_OWNER)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
