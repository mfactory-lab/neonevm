import { readFileSync } from 'node:fs'
import { task } from 'hardhat/config'
import type { Cluster } from '@solana/web3.js'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { DEFAULT_SOLANA_CLUSTER, DEFAULT_SOLANA_KEYPAIR } from './constants'

type TaskParams = {
  cluster: Cluster
  authority: string
  token: string
  receiver?: string
  amount: number
}

task<TaskParams>('mint', 'Mint Token')
  .addParam<Cluster>('cluster', 'Solana Cluster', DEFAULT_SOLANA_CLUSTER)
  .addParam('authority', 'Mint Authority Keypair', DEFAULT_SOLANA_KEYPAIR)
  .addOptionalParam('receiver', 'Token Receiver Address')
  .addParam('token', 'Token Mint Address')
  .addParam('amount', 'Amount', String(LAMPORTS_PER_SOL))
  .setAction(async (params) => {
    const connection = new Connection(clusterApiUrl(params.cluster), 'confirmed')
    const authority = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.authority)))))

    const mint = new PublicKey(params.token)
    const user = params.receiver ? new PublicKey(params.receiver) : authority.publicKey

    const userToken = await getOrCreateAssociatedTokenAccount(connection, authority, mint, user)
    console.log(`Token Account: ${userToken.address}`)

    const sig = await mintTo(connection, authority, mint, userToken.address, authority, params.amount)
    console.log(`Signature: ${sig}`)

    console.log(`Minted: ${params.amount} tokens`)
  })
