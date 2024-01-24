import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'

import { resolve } from 'node:path'
import { config as dotenvConfig } from 'dotenv'
import type { HardhatUserConfig } from 'hardhat/config'

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || './.env'
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) })

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.23',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: 'neondevnet',
  networks: {
    neondevnet: {
      url: 'https://devnet.neonevm.org',
      chainId: 245022926,
      allowUnlimitedContractSize: false,
      accounts: [process.env.PRIVATE_KEY_OWNER!],
      gas: 'auto',
      gasPrice: 'auto',
    },
    neonmainnet: {
      url: 'https://neon-proxy-mainnet.solana.p2p.org',
      chainId: 245022934,
      allowUnlimitedContractSize: false,
      accounts: [process.env.PRIVATE_KEY_OWNER!],
      gas: 'auto',
      gasPrice: 'auto',
    },
  },
}

export default config
