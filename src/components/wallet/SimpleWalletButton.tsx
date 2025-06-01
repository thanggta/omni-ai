// Simple wallet connect button for top-right positioning - Main connect button only

'use client';

import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { LogOut, Wallet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  walletStateAtom,
  connectWalletAtom,
  disconnectWalletAtom,
  setWalletConnectingAtom,
  setWalletErrorAtom
} from '@/src/store/atoms';
import { useCurrentAccount, useDisconnectWallet, useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { suiService } from '@/src/lib/services/sui';

export function SimpleWalletButton() {
  const [walletState] = useAtom(walletStateAtom);
  const [, connectWallet] = useAtom(connectWalletAtom);
  const [, disconnectWallet] = useAtom(disconnectWalletAtom);
  const [, setConnecting] = useAtom(setWalletConnectingAtom);
  const [, setError] = useAtom(setWalletErrorAtom);

  // Use dApp kit hooks
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connectWalletMutation } = useConnectWallet();
  const wallets = useWallets();

  // Update wallet state when account changes
  useEffect(() => {
    const updateWalletState = async () => {
      if (currentAccount?.address) {
        try {
          setConnecting(true);
          setError(null);

          // Set the current account in the service
          suiService.setCurrentAccount(currentAccount);

          // Get balance
          const balance = await suiService.getBalance(currentAccount.address);

          connectWallet({
            address: currentAccount.address,
            balance: balance.toString()
          });
        } catch (error) {
          console.error('Failed to update wallet state:', error);
          setError(error instanceof Error ? error.message : 'Failed to get wallet data');
        } finally {
          setConnecting(false);
        }
      } else {
        // No account connected
        disconnectWallet();
      }
    };

    updateWalletState();
  }, [currentAccount, connectWallet, disconnectWallet, setConnecting, setError]);

  const handleDisconnect = async () => {
    try {
      disconnect();
      disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet');
    }
  };

  // Connected state - show disconnect button only (no address display)
  if (walletState.isConnected && walletState.address) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          onClick={handleDisconnect}
          className="px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 relative overflow-hidden group bg-gradient-to-r from-electric-cyan to-neon-blue text-black hover:opacity-90"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          <span className="relative z-10 font-medium">Disconnect</span>
        </Button>
      </div>
    );
  }

  // Handle wallet connection
  const handleConnectClick = () => {
    setConnecting(true);
    setError(null);

    if (wallets.length > 0) {
      // Try to find Slush wallet first, otherwise use the first available wallet
      const slushWallet = wallets.find(wallet => wallet.name.toLowerCase().includes('slush'));
      const targetWallet = slushWallet || wallets[0];

      connectWalletMutation(
        { wallet: targetWallet },
        {
          onSuccess: () => {
            setConnecting(false);
          },
          onError: (error) => {
            console.error('Failed to connect wallet:', error);
            setError(`Failed to connect to ${targetWallet.name}. Please try again.`);
            setConnecting(false);
          }
        }
      );
    } else {
      setError('No wallets available. Please install Slush wallet or another SUI wallet.');
      setConnecting(false);
    }
  };

  // Disconnected state - show connect button
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleConnectClick}
        disabled={walletState.isConnecting}
        className="px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 relative overflow-hidden group bg-gradient-to-r from-electric-cyan to-neon-blue text-black hover:opacity-90"
        size="sm"
      >
        <Wallet className="h-4 w-4" />
        <span className="relative z-10 font-medium">
          {walletState.isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </Button>

      {walletState.error && (
        <p className="text-xs text-destructive text-right max-w-48">
          {walletState.error}
        </p>
      )}
    </div>
  );
}
