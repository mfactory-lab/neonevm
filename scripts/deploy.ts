import { ethers, upgrades } from 'hardhat'
import { expect } from 'chai'
import tokenList from '../src/tokens'

async function main() {
  const [owner] = await ethers.getSigners()
  const ERC20ForSPLFactory = await ethers.getContractFactory('ERC20ForSPL')

  const tokenMint = tokenList.JSOL.address_spl

  const ERC20ForSPL = await upgrades.deployProxy(ERC20ForSPLFactory, [
    `0x${ethers.decodeBase58(tokenMint).toString(16)}`,
  ], {
    kind: 'uups',
    initializer: 'initializeParent',
  })
  await ERC20ForSPL.waitForDeployment()

  const CONTRACT_OWNER = await ERC20ForSPL.owner()
  const IMPLEMENTATION = await upgrades.erc1967.getImplementationAddress(ERC20ForSPL.target.toString())

  console.log(`ERC20ForSPL proxy deployed to ${ERC20ForSPL.target}`)
  console.log(`ERC20ForSPL implementation deployed to ${IMPLEMENTATION}`)

  expect(owner.address).to.eq(CONTRACT_OWNER)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
