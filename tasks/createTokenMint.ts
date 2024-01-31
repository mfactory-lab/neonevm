import { readFileSync } from 'node:fs'
import { task } from 'hardhat/config'
import type { Cluster } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { createMint } from '@solana/spl-token'
import { createSolanaConnection, createTokenMetadata } from '../src/utils'
import { DEFAULT_NEON_TOKEN, DEFAULT_SOLANA_CLUSTER, DEFAULT_SOLANA_KEYPAIR } from './index'

type TaskParams = {
  cluster: Cluster
  authority: string
  token: string
}

task<TaskParams>('createTokenMint', 'Create Token Mint')
  .addParam<Cluster>('cluster', 'Solana Cluster', DEFAULT_SOLANA_CLUSTER)
  .addParam('authority', 'Authority Keypair', DEFAULT_SOLANA_KEYPAIR)
  .addParam('token', 'Token Json File Path', DEFAULT_NEON_TOKEN)
  .setAction(async (params) => {
    const connection = createSolanaConnection(params.cluster)
    const authority = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.authority)))))

    const token = JSON.parse(String(readFileSync(params.token)))

    const mint = await createMint(connection, authority, authority.publicKey, null, token.decimals)
    token.address_spl = mint.toString()
    console.log(`Mint: ${mint}`)

    // Metadata is required for `ERC20ForSPL`
    await createTokenMetadata(connection.rpcEndpoint, authority.secretKey, token.address_spl, {
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
