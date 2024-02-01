# NeonEVM JSOL

JPOOL Solana Token (JSOL) NeonEVM Deployment Scripts

# Usage

devnet deployment (default network)
```shell
npx hardhat run scripts/deploy.ts
```

mainnet deployment
```shell
npx hardhat run scripts/deploy.ts --network neonmainnet
```

Create solana token mint
```shell
npx hardhat createTokenMint --cluster mainnet-beta --token ./assets/tokens/jsol.json
```

# Links

Neon token
https://neonscan.org/token/0xbF6804889F96af906114ed40dA0F307B51E56540

Solana token
https://solscan.io/token/7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn

Swap tokens
https://neonpass.live/

Swap SOL > NEON
https://jup.ag/swap/SOL-NEON
