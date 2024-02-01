import { readFileSync } from 'node:fs'
import { task } from 'hardhat/config'
import type { Cluster } from '@solana/web3.js'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import Web3 from 'web3'
import bs58 from 'bs58'
import type { HttpNetworkConfig } from 'hardhat/types'
import {
  NeonProxyRpcApi,
  neonTransferMintWeb3Transaction,
} from '@neonevm/token-transfer'
import type { SPLToken } from '@neonevm/token-transfer'
import { sendSolanaTransaction } from '../src/utils'
import {
  DEFAULT_NEON_TOKEN,
  DEFAULT_SOLANA_KEYPAIR,
} from './constants'

type TaskParams = {
  solanaCluster?: string
  solanaWallet: string
  neonWallet?: string
  token: string
  amount: number
}

task<TaskParams>('sol2neon', 'Transfer SOL to Neon')
  .addOptionalParam<Cluster>('solanaCluster', 'Solana Cluster')
  .addParam('solanaWallet', 'Solana Wallet', DEFAULT_SOLANA_KEYPAIR)
  .addOptionalParam('neonWallet', 'Neon Wallet Address (optional)')
  .addParam('token', 'Token Json File Path', DEFAULT_NEON_TOKEN)
  .addParam('amount', 'Amount', '1')
  .setAction(async (params, hre) => {
    const token = JSON.parse(String(readFileSync(params.token))) as SPLToken
    // const solanaWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.solanaWallet)))))
    // const solanaWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.solanaWallet)))))
    const solanaWallet = Keypair.fromSecretKey(bs58.decode('NgS58seSrGFAMVXgAVBvMeS4Uvjcutzm4ri62CLo8e3jJ94gzWP5q58v6nnS7cfgHkk6F2BvgNccRudf5MBDCsN'))
    let cluster: Cluster = params.solanaCluster

    if (!cluster) {
      switch (hre.network.name) {
        case 'neonmainnet':
          cluster = 'mainnet-beta'
          break
        default:
          cluster = 'devnet'
      }
    }

    const connection = new Connection(clusterApiUrl(cluster), 'confirmed')

    const conf = hre.network.config as HttpNetworkConfig

    const web3 = new Web3(conf.url)
    const neonProxyApi = new NeonProxyRpcApi({ neonProxyRpcApi: conf.url, solanaRpcApi: connection.rpcEndpoint })
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
      Number(params.amount),
    )

    console.log(`Transferring ${params.amount} ${token.symbol} tokens from ${solanaWallet.publicKey} to ${params.neonWallet}...`)

    const sig = await sendSolanaTransaction(connection, tx, [solanaWallet], true)

    console.log(`Signature: ${sig}`)
  })
