// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

import web3, { Keypair, PublicKey } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import wallet from '../keypair.json'

async function main() {
  const connection = new web3.Connection('https://api.devnet.solana.com')
  const mint = new PublicKey('F8s94y4EBKiYPGuXzzik2TXaGwSa29K1w3d5xvEEzcDx')
  const authority = Keypair.fromSecretKey(Uint8Array.from(wallet))

  console.log(`authority: ${authority.publicKey}`)

  // token receiver
  const user = authority.publicKey
  const userToken = await getOrCreateAssociatedTokenAccount(connection, authority, mint, user)

  const sig = await mintTo(connection, authority, mint, userToken.address, authority, 100_000_000_000)

  console.log(`Signature: ${sig}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
