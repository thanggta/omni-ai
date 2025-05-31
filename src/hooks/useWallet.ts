// #TODO-21: Set up SUI wallet connectivity hook - IMPLEMENTED

'use client';

import { useAtom } from 'jotai';
import {
  walletStateAtom,
  portfolioDataAtom,
  setWalletConnectingAtom,
  setWalletErrorAtom
} from '@/src/store/atoms';
import { suiService } from '@/src/lib/services/sui';

// #TODO-21.1: Wallet connection hook - IMPLEMENTED
export function useWallet() {
  const [walletState] = useAtom(walletStateAtom);
  const [, setPortfolioData] = useAtom(portfolioDataAtom);
  const [, setConnecting] = useAtom(setWalletConnectingAtom);
  const [, setError] = useAtom(setWalletErrorAtom);

  // #TODO-21.3: Connect wallet function - IMPLEMENTED (handled by dApp kit)
  const connectWallet = async (): Promise<{ address: string; balance: string }> => {
    // This function is now handled by the dApp kit ConnectButton
    // The actual connection logic is in the WalletConnectButton component
    throw new Error('Use the ConnectButton component for wallet connection');
  };

  // #TODO-21.4: Disconnect wallet function - IMPLEMENTED
  const disconnectWallet = async (): Promise<void> => {
    try {
      await suiService.disconnectWallet();
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect wallet';
      setError(errorMessage);
      throw error;
    }
  };

  // #TODO-21.5: Get wallet balance and portfolio - IMPLEMENTED
  const getBalance = async (): Promise<string> => {
    if (!walletState.address) {
      throw new Error('No wallet connected');
    }

    try {
      const balance = await suiService.getBalance(walletState.address);
      return balance.toString();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get balance';
      setError(errorMessage);
      throw error;
    }
  };

  // #TODO-21.5: Get full portfolio data - IMPLEMENTED
  const getPortfolio = async (): Promise<void> => {
    if (!walletState.address) {
      throw new Error('No wallet connected');
    }

    try {
      setPortfolioData(prev => ({ ...prev, isLoading: true }));

      const portfolioData = await suiService.getPortfolio(walletState.address);

      setPortfolioData({
        totalValue: portfolioData.totalValue,
        tokens: portfolioData.tokens,
        nfts: portfolioData.nfts,
        lastUpdated: new Date().toISOString(),
        isLoading: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get portfolio';
      setError(errorMessage);
      setPortfolioData(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // #TODO-21.6: Sign transaction function - IMPLEMENTED
  const signTransaction = async (transaction: any): Promise<any> => {
    if (!walletState.address) {
      throw new Error('No wallet connected');
    }

    try {
      const signedTransaction = await suiService.signTransaction(transaction);
      return signedTransaction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign transaction';
      setError(errorMessage);
      throw error;
    }
  };

  // #TODO-21.7: Return hook interface - IMPLEMENTED
  return {
    walletState,
    connectWallet,
    disconnectWallet,
    getBalance,
    getPortfolio,
    signTransaction,
    isConnected: walletState.isConnected,
    address: walletState.address,
    balance: walletState.balance,
    isConnecting: walletState.isConnecting,
    error: walletState.error
  };
}
