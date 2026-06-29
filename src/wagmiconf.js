
import { http, createConfig } from '@wagmi/core'


import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  localhost
} from 'wagmi/chains';


const bnbChain = {
  id: 56,
  name: 'BNB Chain',
  network: 'binance',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: { default: 'https://bsc-dataseed.binance.org/' },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
  testnet: false,
};


const localChain = {
  id: 1337,
  name: 'local Chain',
  network: 'local',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: 'http://127.0.0.1:8545/' },
  blockExplorers: {
    default: { name: 'nonono', url: 'https://nonoo.com' },
  },
  testnet: true,
};

// alert(localhost.id)
export const config = createConfig({
  chains: [mainnet, bnbChain, polygon, arbitrum, optimism, base, sepolia, localChain],
  //ssr: true, // If your dApp uses server side rendering (SSR)
  transports: {
    [mainnet.id]:  http('https://ethereum-rpc.publicnode.com'),
    [sepolia.id]:  http('https://ethereum-sepolia-rpc.publicnode.com'),
    [bnbChain.id]:  http('https://bsc-dataseed.binance.org/'),
    [polygon.id]:   http('https://polygon-bor-rpc.publicnode.com'),
    [arbitrum.id]:  http('https://arbitrum-one-rpc.publicnode.com'),
    [optimism.id]:  http('https://optimism-rpc.publicnode.com'),
    [base.id]:      http('https://base-rpc.publicnode.com'),
    [localhost.id]: http("http://localhost:8545"),
  },
})
