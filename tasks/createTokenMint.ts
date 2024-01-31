import { readFileSync } from 'node:fs'
import { task } from 'hardhat/config'
import type { Cluster } from '@solana/web3.js'
import { Keypair, PublicKey } from '@solana/web3.js'
import { createMint } from '@solana/spl-token'
import { createSolanaConnection, createTokenMetadata } from '../src/utils'
import { DEFAULT_NEON_TOKEN, DEFAULT_SOLANA_CLUSTER, DEFAULT_SOLANA_KEYPAIR } from './constants'

type TaskParams = {
  cluster: Cluster
  authority: string
  token: string
  mint?: string
}

task<TaskParams>('createTokenMint', 'Create Token Mint')
  .addParam<Cluster>('cluster', 'Solana Cluster', DEFAULT_SOLANA_CLUSTER)
  .addParam('authority', 'Authority Keypair', DEFAULT_SOLANA_KEYPAIR)
  .addParam('token', 'Token Json File Path', DEFAULT_NEON_TOKEN)
  .addOptionalParam('mint', 'Mint Address')
  .setAction(async (params) => {
    const connection = createSolanaConnection(params.cluster)
    const authority = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.authority)))))

    const token = JSON.parse(String(readFileSync(params.token)))
    let mint: PublicKey

    if (!params.mint) {
      console.log(`Creating new mint...`)
      mint = await createMint(connection, authority, authority.publicKey, null, token.decimals)
    } else {
      mint = new PublicKey(params.mint)
    }

    console.log(`Mint: ${mint}`)

    // Metadata is required for `ERC20ForSPL`
    console.log(`Creating metadata account...`)
    await createTokenMetadata(connection.rpcEndpoint, authority.secretKey, mint.toString(), {
      name: token.name,
      symbol: token.symbol,
      uri: '',
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    })

    console.log(`Done`)
  })
