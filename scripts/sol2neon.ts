import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import Web3 from 'web3'
import { NeonProxyRpcApi, neonTransferMintWeb3Transaction } from '@neonevm/token-transfer'
import { sendSolanaTransaction } from '../src/utils'
import wallet from '../NeonTFZMoqL31gZCwcJXKaSDHLhSS5JtpCjnjvLg2nb.json'
import tokenList from '../src/tokens'

const SOLANA_DEVNET = 'https://api.devnet.solana.com'
const NEON_DEVNET = 'https://devnet.neonevm.org'

async function main() {
  const connection = new Connection(SOLANA_DEVNET, 'confirmed')
  const web3 = new Web3(NEON_DEVNET)

  const neonProxyApi = new NeonProxyRpcApi({ neonProxyRpcApi: NEON_DEVNET, solanaRpcApi: SOLANA_DEVNET })
  const neonProxyStatus = await neonProxyApi.evmParams()

  const amount = 10
  const token = tokenList.JSOL
  const solanaWallet = Keypair.fromSecretKey(Uint8Array.from(wallet))
  const neonWallet = '0xefF995523fe0d1B83c2034671A0977421bf288Fc'

  const tx = await neonTransferMintWeb3Transaction(
    connection,
    web3 as any,
    neonProxyApi,
    neonProxyStatus,
    new PublicKey(neonProxyStatus.NEON_EVM_ID),
    solanaWallet.publicKey,
    neonWallet,
    token,
    amount,
    token.chainId,
  )

  console.log(`Transferring ${amount} ${token.symbol} tokens from ${solanaWallet.publicKey} to ${neonWallet}...`)

  const sig = await sendSolanaTransaction(connection, tx, [solanaWallet], true)

  console.log(`Signature: ${sig}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
