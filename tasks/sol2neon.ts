import { readFileSync } from 'node:fs'
import { task } from 'hardhat/config'
import type { Cluster } from '@solana/web3.js'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
  NeonProxyRpcApi,
  neonTransferMintWeb3Transaction,
} from '@neonevm/token-transfer'
import Web3 from 'web3'
import { sendSolanaTransaction } from '../src/utils'
import {
  DEFAULT_NEON_RPC,
  DEFAULT_NEON_TOKEN,
  DEFAULT_NEON_WALLET,
  DEFAULT_SOLANA_CLUSTER,
  DEFAULT_SOLANA_KEYPAIR,
} from './constants'

type TaskParams = {
  solanaCluster: Cluster
  solanaWallet: string
  neonRpc: string
  neonWallet: string
  token: string
  amount: number
}

task<TaskParams>('sol2neon', 'Transfer SOL to Neon')
  .addParam<Cluster>('solanaCluster', 'Solana Cluster', DEFAULT_SOLANA_CLUSTER)
  .addParam('solanaWallet', 'Solana Wallet', DEFAULT_SOLANA_KEYPAIR)
  .addParam('neonRpc', 'Neon RPC', DEFAULT_NEON_RPC)
  .addParam('neonWallet', 'Neon Wallet Address (0x...)', DEFAULT_NEON_WALLET)
  .addParam('token', 'Token Json File Path', DEFAULT_NEON_TOKEN)
  .addParam('amount', 'Amount', '1')
  .setAction(async (params) => {
    const token = JSON.parse(String(readFileSync(params.token)))
    const connection = new Connection(clusterApiUrl(params.solanaCluster), 'confirmed')
    const solanaWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.solanaWallet)))))

    const web3 = new Web3(params.neonRpc)
    const neonProxyApi = new NeonProxyRpcApi({
      neonProxyRpcApi: params.neonRpc,
      solanaRpcApi: connection.rpcEndpoint,
    })
    const neonProxyStatus = await neonProxyApi.evmParams()

    const tx = await neonTransferMintWeb3Transaction(
      connection,
      web3 as any,
      neonProxyApi,
      neonProxyStatus,
      new PublicKey(neonProxyStatus.NEON_EVM_ID),
      solanaWallet.publicKey,
      params.neonWallet,
      token,
      params.amount,
      token.chainId,
    )

    console.log(`Transferring ${params.amount} ${token.symbol} tokens from ${solanaWallet.publicKey} to ${params.neonWallet}...`)

    const sig = await sendSolanaTransaction(connection, tx, [solanaWallet], true)

    console.log(`Signature: ${sig}`)
  })
