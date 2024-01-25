const chain = {
  DEVNET: 245022926,
  MAINNET: 245022934,
}

export default {
  JSOL: {
    chainId: chain.DEVNET,
    address_spl: 'F8s94y4EBKiYPGuXzzik2TXaGwSa29K1w3d5xvEEzcDx',
    address: '0x2cc12c6477cA4F4b703c81670C3a85993A6464Ef',
    decimals: 9,
    name: 'JPOOL Solana Token',
    symbol: 'JSOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn/logo.svg',
  },
  TEST: {
    chainId: chain.DEVNET,
    address_spl: 'CE9Dcka1GdTpUtz9FyS1gXyfYDG9UTLeoKWTVDoyeovM',
    address: '0x30E9BD22C403f7BB16972E8647917D98b7F4b0d2',
    decimals: 9,
    name: 'TEST Token',
    symbol: 'TEST',
    logoURI: '',
  },
  TEST2: {
    chainId: chain.DEVNET,
    address_spl: '2Ps6MKiFqFXnTQzdLDrxds6EpogT4dBauWt3MCB4TaXd',
    address: '',
    decimals: 9,
    name: 'TEST2',
    symbol: 'TEST2',
    logoURI: '',
  },
}
