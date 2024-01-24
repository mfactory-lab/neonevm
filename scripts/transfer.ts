// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import Web3 from 'web3'
import { NeonProxyRpcApi, neonTransferMintWeb3Transaction } from '@neonevm/token-transfer'
import wallet from '../NeonTFZMoqL31gZCwcJXKaSDHLhSS5JtpCjnjvLg2nb.json'
import { sendSolanaTransaction } from '../src/utils'
import tokenInfo from './token.json'

const SOLANA_DEVNET = 'https://api.devnet.solana.com'
const NEON_DEVNET = 'https://devnet.neonevm.org'

async function main() {
  const connection = new Connection(SOLANA_DEVNET, 'confirmed')
  const web3 = new Web3(NEON_DEVNET)

  const mint = new PublicKey('F8s94y4EBKiYPGuXzzik2TXaGwSa29K1w3d5xvEEzcDx')

  const token = {
    chainId: 245022926, // devnet
    // chainId: 245022934, // mainnet
    address_spl: mint.toString(),
    address: '0x2cc12c6477cA4F4b703c81670C3a85993A6464Ef',
    decimals: 9,
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    logoURI: tokenInfo.image,
  }

  const neonProxyApi = new NeonProxyRpcApi({ neonProxyRpcApi: NEON_DEVNET, solanaRpcApi: SOLANA_DEVNET })
  const neonProxyStatus = await neonProxyApi.evmParams()

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
    10,
    token.chainId,
  )

  const sig = await sendSolanaTransaction(connection, tx, [solanaWallet], true)

  console.log(`Signature: ${sig}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
