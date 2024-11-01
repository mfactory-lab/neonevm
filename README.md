# JSOL deployment on Neon EVM

Scripts for deploying JPool Liquid Staking Token (JSOL) on Neon EVM.

## Usage

Deployment on devnet (default network):

```shell
npx hardhat run scripts/deploy.ts
```

Deployment on mainnet:

```shell
npx hardhat run scripts/deploy.ts --network neonmainnet
```

Create Solana token mint:

```shell
npx hardhat createTokenMint --cluster mainnet-beta --token ./assets/tokens/jsol.json
```

## Links

* JSOL on Neon EVM: https://neonscan.org/token/0xbF6804889F96af906114ed40dA0F307B51E56540
* JSOL on Solana: https://solscan.io/token/7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn
* Swap tokens: https://neonpass.live/
* Swap SOL > NEON: https://jup.ag/swap/SOL-NEON
