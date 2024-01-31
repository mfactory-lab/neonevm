import { readFileSync } from 'node:fs'
import { task } from 'hardhat/config'
import type { Cluster } from '@solana/web3.js'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { DEFAULT_SOLANA_CLUSTER, DEFAULT_SOLANA_KEYPAIR } from './index'

type TaskParams = {
  cluster: Cluster
  authority: string
  mint: string
  receiver: string
  amount: number
}

task<TaskParams>('mint', 'Mint Token')
  .addParam<Cluster>('cluster', 'Solana Cluster', DEFAULT_SOLANA_CLUSTER)
  .addParam('authority', 'Mint Authority Keypair', DEFAULT_SOLANA_KEYPAIR)
  .addParam('receiver', 'Token Receiver Address')
  .addParam('mint', 'Token Mint Address')
  .addParam('amount', 'Amount', String(LAMPORTS_PER_SOL)) // 1 SOL
  .setAction(async (params) => {
    const connection = new Connection(clusterApiUrl(params.cluster), 'confirmed')
    const authority = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.authority)))))

    const mint = new PublicKey(params.mint)
    const user = new PublicKey(params.receiver)

    const userToken = await getOrCreateAssociatedTokenAccount(connection, authority, mint, user)
    console.log(`Token Account: ${userToken.address}`)

    const sig = await mintTo(connection, authority, mint, userToken.address, authority, params.amount)
    console.log(`Signature: ${sig}`)
  })
