import { readFileSync } from 'node:fs'
import { task } from 'hardhat/config'
import type { Cluster } from '@solana/web3.js'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { NeonProxyRpcApi, createMintNeonTransactionWeb3, createMintSolanaTransaction } from '@neonevm/token-transfer'
import Web3 from 'web3'
import type { HttpNetworkConfig } from 'hardhat/types'
import { sendNeonTransaction, sendSolanaTransaction } from '../src/utils'
import {
  DEFAULT_NEON_TOKEN,
  DEFAULT_SOLANA_CLUSTER,
  DEFAULT_SOLANA_KEYPAIR,
} from './constants'

type TaskParams = {
  solanaCluster: Cluster
  solanaWallet: string
  neonWallet: string
  token: string
  amount: number
}

task<TaskParams>('neon2sol', 'Send Neon Token to Solana')
  .addParam<Cluster>('solanaCluster', 'Solana Cluster', DEFAULT_SOLANA_CLUSTER)
  .addParam('solanaWallet', 'Solana Wallet Json File Path', DEFAULT_SOLANA_KEYPAIR)
  .addOptionalParam('neonWallet', 'Neon Wallet Address (optional)')
  .addParam('token', 'Token Json File Path', DEFAULT_NEON_TOKEN)
  .addParam('amount', 'Amount', '1')
  .setAction(async (params, hre) => {
    const token = JSON.parse(String(readFileSync(params.token)))
    const connection = new Connection(clusterApiUrl(params.solanaCluster), 'confirmed')
    const solanaWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.solanaWallet)))))

    const conf = hre.network.config as HttpNetworkConfig

    const web3 = new Web3(conf.url)
    const neonProxyApi = new NeonProxyRpcApi({ neonProxyRpcApi: conf.url, solanaRpcApi: connection.rpcEndpoint })
    const neonProxyStatus = await neonProxyApi.evmParams()

    const neonWallet = web3.eth.accounts.privateKeyToAccount(
      params.neonWallet ?? (conf.accounts as string[])[0],
    )

    const solanaMint = new PublicKey(token.address_spl)
    const associatedToken = getAssociatedTokenAddressSync(solanaMint, solanaWallet.publicKey)

    const solanaTransaction = createMintSolanaTransaction(
      solanaWallet.publicKey,
      solanaMint,
      associatedToken,
      neonProxyStatus,
    )

    const signedSolanaTransaction = await sendSolanaTransaction(
      connection,
      solanaTransaction,
      [solanaWallet],
      true,
      { skipPreflight: false },
    )

    const neonTransaction = await createMintNeonTransactionWeb3(
      web3 as any,
      neonWallet.address,
      associatedToken,
      token,
      Number(params.amount),
    )

    const signedNeonTransaction = await sendNeonTransaction(web3, neonTransaction, neonWallet.privateKey)
    console.log('solanaTransaction', signedSolanaTransaction)
    console.log('neonTransaction', signedNeonTransaction)
  })
