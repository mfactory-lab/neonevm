// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import Web3 from 'web3'
import { NeonProxyRpcApi, createMintNeonTransactionWeb3, createMintSolanaTransaction } from '@neonevm/token-transfer'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { sendNeonTransaction, sendSolanaTransaction } from '../src/utils'
import tokenList from '../src/tokens'

import wallet from '../NeonTFZMoqL31gZCwcJXKaSDHLhSS5JtpCjnjvLg2nb.json'

const SOLANA_DEVNET = 'https://api.devnet.solana.com'
const NEON_DEVNET = 'https://devnet.neonevm.org'

async function main() {
  const connection = new Connection(SOLANA_DEVNET, 'confirmed')
  const web3 = new Web3(NEON_DEVNET)

  const neonProxyApi = new NeonProxyRpcApi({ neonProxyRpcApi: NEON_DEVNET, solanaRpcApi: SOLANA_DEVNET })
  const neonProxyStatus = await neonProxyApi.evmParams()

  const amount = 1
  const token = tokenList.JSOL
  const solanaWallet = Keypair.fromSecretKey(Uint8Array.from(wallet))
  const neonWallet = web3.eth.accounts.privateKeyToAccount('0x73708692b2b67cf2732fd81610cc310da4a364a5592b38f37f9fe500b64840f4')

  const mintPubkey = new PublicKey(token.address_spl)
  const associatedToken = getAssociatedTokenAddressSync(mintPubkey, solanaWallet.publicKey)

  const solanaTransaction = createMintSolanaTransaction(
    solanaWallet.publicKey,
    mintPubkey,
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
    amount,
  )

  const signedNeonTransaction = await sendNeonTransaction(web3, neonTransaction, neonWallet.privateKey)
  console.log(signedSolanaTransaction, signedNeonTransaction)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
