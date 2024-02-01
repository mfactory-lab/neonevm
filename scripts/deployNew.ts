import { readFileSync } from 'node:fs'
import { ethers, network, upgrades } from 'hardhat'
import { expect } from 'chai'

const TOKEN_PATH = './assets/tokens/jsol.json'

async function main() {
  const [owner] = await ethers.getSigners()
  const ERC20ForSPLFactory = await ethers.getContractFactory('ERC20ForSPL')

  const token = JSON.parse(String(readFileSync(TOKEN_PATH)))

  console.log(`Owner ${owner.address}...`)
  console.log(`Deploying token ${token.symbol}...`)

  const ERC20ForSPL = await upgrades.deployProxy(ERC20ForSPLFactory, [
    `0x${ethers.decodeBase58(token.address_spl).toString(16)}`,
  ], {
    kind: 'uups',
    initializer: 'initializeParent',
  })

  console.log(`Waiting for deployment...`)
  await ERC20ForSPL.waitForDeployment()

  const CONTRACT_OWNER = await ERC20ForSPL.owner()
  const IMPLEMENTATION = await upgrades.erc1967.getImplementationAddress(ERC20ForSPL.target.toString())

  console.log(`ERC20ForSPL proxy deployed to ${ERC20ForSPL.target}`)
  console.log(`ERC20ForSPL implementation deployed to ${IMPLEMENTATION}`)

  if (network.name === 'neondevnet') {
    console.log(`https://devnet.neonscan.org/token/${ERC20ForSPL.target}`)
  } else {
    console.log(`https://neonscan.org/token/${ERC20ForSPL.target}`)
  }

  expect(owner.address).to.eq(CONTRACT_OWNER)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
