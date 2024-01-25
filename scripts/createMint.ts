import { Connection, Keypair } from '@solana/web3.js'
import { createMint } from '@solana/spl-token'
import wallet from '../keypair.json'
import tokenList from '../src/tokens'
import { createTokenMetadata } from '../src/utils'

const SOLANA_DEVNET = 'https://api.devnet.solana.com'

async function main() {
  const authority = Keypair.fromSecretKey(Uint8Array.from(wallet))
  console.log(`Authority: ${authority.publicKey}`)

  const token = tokenList.TEST2

  const mint = await createMint(new Connection(SOLANA_DEVNET), authority, authority.publicKey, null, token.decimals)
  token.address_spl = mint.toString()
  console.log(`Mint: ${mint}`)

  // Metadata is required for `ERC20ForSPL`
  await createTokenMetadata(SOLANA_DEVNET, authority.secretKey, token.address_spl, {
    name: token.name,
    symbol: token.symbol,
    uri: '',
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  })

  console.log(`Done`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
