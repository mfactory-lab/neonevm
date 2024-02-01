import { readFileSync } from 'node:fs'
import { task } from 'hardhat/config'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import type { HttpNetworkConfig } from 'hardhat/types'
import Web3 from 'web3'
import {
  NeonProxyRpcApi,
} from '@neonevm/token-transfer'
import { DEFAULT_SOLANA_KEYPAIR } from './constants'

task<any>('test')
  .addOptionalParam('solanaWallet', 'Solana Wallet', DEFAULT_SOLANA_KEYPAIR)
  .setAction(async (params, hre) => {
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed')

    const conf = hre.network.config as HttpNetworkConfig

    const solanaWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(String(readFileSync(params.solanaWallet)))))
    const web3 = new Web3(conf.url)

    const neonProxyApi = new NeonProxyRpcApi({ neonProxyRpcApi: conf.url, solanaRpcApi: connection.rpcEndpoint })
    const neonProxyStatus = await neonProxyApi.evmParams()

    const neonEvmProgram = new PublicKey(neonProxyStatus.NEON_EVM_ID)

    const neonWallet = '0x38ab5220Af134C2546e036360e930F1596137e00'

    const chainId = conf.chainId!

    // const [neonWalletBalanceAddress] = neonBalanceProgramAddress(neonWallet, neonEvmProgram, chainId)
    // const neonWalletBalanceAccount = await connection.getAccountInfo(neonWalletBalanceAddress)
    //
    // const tx = new Transaction().add(createAccountBalanceInstruction(solanaWallet.publicKey, neonEvmProgram, neonWallet, chainId))
    // const sig = await sendSolanaTransaction(connection, tx, [solanaWallet], true)
    // console.log(sig)

    const token = {
      chainId: 245022934,
      address_spl: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      address: '0xEA6B04272f9f62F997F666F07D3a974134f7FFb9',
      decimals: 6,
      name: 'USDC',
      symbol: 'USDC',
      logoURI: 'https://raw.githubusercontent.com/neonlabsorg/token-list/master/assets/usd-coin-usdc-logo.svg',
    }

    // const tx = await neonTransferMintWeb3Transaction(connection, web3, neonProxyApi, neonProxyStatus, neonEvmProgram/* or solEvmProgram */,
    //   solanaWallet.publicKey, neonWallet, token, 0.01, token.chainId)
    //
    // const sig = await sendSolanaTransaction(connection, tx, [solanaWallet], true, { skipPreflight: false })
    // console.log(sig)

    // const mint = new PublicKey('7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn')
    // const transaction = await solanaNEONTransferTransaction(solanaWallet.publicKey, neonWallet, neonEvmProgram, mint, splToken, amount, chainId)
    // transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    // const solana = await sendTransaction(connection, transaction, [solanaSigner], true, { skipPreflight: false })
    // setSignature({ solana })

    // const emulateSigner = solanaWalletSigner(web3, solanaWallet, neonWallet)
    //
    // const [emulateSignerBalanceAddress] = neonBalanceProgramAddress(emulateSigner.address, neonEvmProgram, chainId)
    // const signerBalanceAccount = await connection.getAccountInfo(emulateSignerBalanceAddress)
    //
    // const ix = createAccountBalanceInstruction(solanaWallet.publicKey, neonEvmProgram, emulateSigner.address, chainId)
    // const tx = new Transaction().add(ix)
    //
    // console.log(neonWalletBalanceAccount)
    // console.log(signerBalanceAccount)
  })
