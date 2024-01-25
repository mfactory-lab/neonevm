import { ethers } from 'hardhat'

async function main() {
  const wallet = ethers.Wallet.createRandom()
  console.log('privateKey:', wallet.privateKey)
  console.log('address:', wallet.address)
  console.log('mnemonic:', wallet.mnemonic?.phrase)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
