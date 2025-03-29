import { createConfig, http } from 'wagmi';
import { bscTestnet, mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected, metaMask } from '@wagmi/connectors';

const projectId = '26dec469283ee31ae98465e63aeb64f8'; // Get this from WalletConnect Cloud (https://cloud.walletconnect.com)

export const config = createConfig({
  chains: [mainnet, bscTestnet], // Add the chains you want to support
  transports: {
    [mainnet.id]: http(),
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545/"),
  },
  connectors: [
    walletConnect({
      projectId,
      showQrModal: true, // This will show the QR code modal like in your screenshot
    }),
    injected(), // For browser wallets like MetaMask
    metaMask(), // Specifically for MetaMask
  ],
});