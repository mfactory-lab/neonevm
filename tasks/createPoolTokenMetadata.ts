import { existsSync, readFileSync } from 'node:fs'
import { task } from 'hardhat/config'
import type { Cluster } from '@solana/web3.js'
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { keypairIdentity } from '@metaplex-foundation/umi'
import { createPoolTokenMetadata } from '@solana/spl-stake-pool'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { sendSolanaTransaction } from '../src/utils'
import { DEFAULT_SOLANA_CLUSTER, DEFAULT_SOLANA_KEYPAIR } from './constants'

type TaskParams = {
  cluster: Cluster
  manager: string
  metadata: string
  stakePool: string
  uri?: string
}

task<TaskParams>('createPoolTokenMetadata', 'Create Pool Token Metadata')
  .addParam<Cluster>('cluster', 'Solana Cluster', DEFAULT_SOLANA_CLUSTER)
  .addParam('manager', 'Manager Keypair', DEFAULT_SOLANA_KEYPAIR)
  .addParam('metadata', 'Metadata Json File Path', './assets/metadata.json')
  .addParam('stakePool', 'Stake Pool Address')
  .addOptionalParam('uri', 'Metadata URI')
  .setAction(async (params) => {
    const connection = new Connection(clusterApiUrl(params.cluster), 'confirmed')
    const authority = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.manager)))))
    const stakePool = new PublicKey(params.stakePool)

    if (!existsSync(params.metadata)) {
      throw new Error('Token Json File doesn\'t exists')
    }

    const metadata = JSON.parse(String(readFileSync(params.metadata)))

    let uri: string
    if (!params.uri) {
      const umi = createUmi(connection.rpcEndpoint)
      umi.use(irysUploader())
      umi.use(keypairIdentity(umi.eddsa.createKeypairFromSecretKey(authority.secretKey)))
      console.log(`Uploading metadata ${params.metadata}...`)
      uri = await umi.uploader.uploadJson(metadata)
      console.log('Metadata uri:', uri)
    } else {
      uri = params.uri
    }

    const { instructions } = await createPoolTokenMetadata({
      name: metadata.name,
      symbol: metadata.symbol,
      uri,
      connection,
      payer: authority.publicKey,
      stakePool,
    })

    const tx = new Transaction().add(...instructions)
    const sig = await sendSolanaTransaction(connection, tx, [authority], true)

    console.log(`Signature: ${sig}`)
    console.log(`Done`)
  })
