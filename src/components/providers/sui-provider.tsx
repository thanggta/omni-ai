// #TODO-21: SUI dApp kit provider for wallet connectivity

'use client';

import { ReactNode } from 'react';
import { SuiClientProvider, WalletProvider, createNetworkConfig, lightTheme } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Network configuration for SUI
const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl('localnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

// Create a query client for React Query
const queryClient = new QueryClient();

interface SuiProviderProps {
  children: ReactNode;
}

export function SuiProvider({ children }: SuiProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider
          autoConnect
          slushWallet={{
            name: 'SUI Trading Assistant',
          }}
          enableUnsafeBurner={process.env.NODE_ENV === 'development'}
          theme={lightTheme}
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
