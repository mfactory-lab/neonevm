import type { Connection,
  SendOptions,
  Signer,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js'
import { solanaTransactionLog } from '@neonevm/token-transfer'
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

// export async function sendNeonTransaction(web3: Web3, transaction: TransactionConfig, account: Account): Promise<string> {
//   const signedTrx = await web3.eth.accounts.signTransaction(transaction, account.privateKey)
//   return new Promise((resolve, reject) => {
//     if (signedTrx?.rawTransaction) {
//       web3.eth.sendSignedTransaction(signedTrx.rawTransaction, (error, hash) => {
//         if (error) {
//           reject(error)
//         } else {
//           resolve(hash)
//         }
//       })
//     } else {
//       // eslint-disable-next-line prefer-promise-reject-errors
//       reject('Unknown transaction')
//     }
//   })
// }

async function _createTokenMetadata(solanaUrl: string, wallet: Uint8Array, mint: string, data: DataV2Args) {
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
      `Succesfully Minted!. Transaction Here: https://solana.fm/tx/${signature[0]}?cluster=devnet`,
  )
}

// export function getMetadataPDA(mint: PublicKey) {
//   const [publicKey] = PublicKey.findProgramAddressSync(
//     [Buffer.from('metadata'), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
//     MPL_TOKEN_METADATA_PROGRAM_ID,
//   )
//   return publicKey
// }
