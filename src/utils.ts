import type {
  Cluster,
  Commitment,
  ConnectionConfig,
  SendOptions,
  Signer,
  Transaction, TransactionSignature,
} from '@solana/web3.js'
import { base58, publicKey as publicKeySerializer, string as stringSerializer } from '@metaplex-foundation/umi-serializers'
import type {
  DataV2Args,
} from '@metaplex-foundation/mpl-token-metadata'
import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  createMetadataAccountV3,
} from '@metaplex-foundation/mpl-token-metadata'
import { createSignerFromKeypair, publicKey, signerIdentity } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import type { TransactionConfig } from 'web3-core'
import type Web3 from 'web3'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { solanaTransactionLog } from '../packages/neon-token-transfer'

export async function sendNeonTransaction(web3: Web3, tx: TransactionConfig, signer: string) {
  const signedTrx = await web3.eth.accounts.signTransaction(tx as any, signer)
  return web3.eth.sendSignedTransaction(signedTrx.rawTransaction)
}

export function createSolanaConnection(clusterOrUrl: Cluster | string, commitmentOrConfig?: Commitment | ConnectionConfig) {
  let url: string
  try {
    url = clusterApiUrl(clusterOrUrl as Cluster)
  } catch (e) {
    url = clusterOrUrl
  }
  return new Connection(url, commitmentOrConfig)
}

export async function sendSolanaTransaction(
  connection: Connection,
  tx: Transaction,
  signers: Signer[],
  confirm = false,
  options?: SendOptions,
): Promise<TransactionSignature> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.sign(...signers)
  solanaTransactionLog(tx)
  const signature = await connection.sendRawTransaction(tx.serialize(), options)
  if (confirm) {
    await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature })
  }
  return signature
}

export async function createTokenMetadata(solanaUrl: string, wallet: Uint8Array, mint: string, data: DataV2Args) {
  const umi = createUmi(solanaUrl)
  const keypair = umi.eddsa.createKeypairFromSecretKey(wallet)
  const signerKeypair = createSignerFromKeypair(umi, keypair)
  umi.use(signerIdentity(signerKeypair))

  const seeds = [
    stringSerializer({ size: 'variable' }).serialize('metadata'),
    publicKeySerializer().serialize(MPL_TOKEN_METADATA_PROGRAM_ID),
    publicKeySerializer().serialize(mint),
  ]
  const metadata = umi.eddsa.findPda(MPL_TOKEN_METADATA_PROGRAM_ID, seeds)

  const tx = createMetadataAccountV3(umi, {
    metadata,
    mint: publicKey(mint),
    mintAuthority: signerKeypair,
    payer: signerKeypair,
    data,
    isMutable: true,
    collectionDetails: null,
  })
  const result = await tx.sendAndConfirm(umi)
  const signature = base58.deserialize(result.signature)
  console.log(
      `Successfully Minted!. Transaction Here: https://solana.fm/tx/${signature[0]}?cluster=devnet`,
  )
}

// export function getMetadataPDA(mint: PublicKey) {
//   const [publicKey] = PublicKey.findProgramAddressSync(
//     [Buffer.from('metadata'), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
//     MPL_TOKEN_METADATA_PROGRAM_ID,
//   )
//   return publicKey
// }
