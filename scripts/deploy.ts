import { readFileSync } from 'node:fs'
import { ethers } from 'hardhat'

const TOKEN_PATH = './assets/tokens/jsol.json'

async function main() {
  const token = JSON.parse(String(readFileSync(TOKEN_PATH)))

  // const ERC20ForSplFactoryAddress = '0xF6b17787154C418d5773Ea22Afc87A95CAA3e957' // devnet
  const ERC20ForSplFactoryAddress = '0x6B226a13F5FE3A5cC488084C08bB905533804720' // mainnet
  const ERC20ForSplFactory = await ethers.getContractAt('ERC20ForSplFactory', ERC20ForSplFactoryAddress)

  const mint = `0x${ethers.decodeBase58(token.address_spl).toString(16)}`

  const resp = await ERC20ForSplFactory.createErc20ForSpl(mint, {
    // prevent gas limit error...
    gasLimit: 65856000n,
  })
  console.log(resp)

  const receipt = await resp.wait()
  console.log(receipt)

  const addr = await ERC20ForSplFactory.getErc20ForSpl(mint)
  console.log(addr)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
