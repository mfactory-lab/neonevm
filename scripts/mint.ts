import web3, { Keypair, PublicKey } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import wallet from '../keypair.json'
import tokenList from '../src/tokens'

async function main() {
  const connection = new web3.Connection('https://api.devnet.solana.com')

  const authority = Keypair.fromSecretKey(Uint8Array.from(wallet))
  console.log(`Authority: ${authority.publicKey}`)

  const mint = new PublicKey(tokenList.JSOL.address_spl)
  console.log(`Mint: ${mint}`)

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
