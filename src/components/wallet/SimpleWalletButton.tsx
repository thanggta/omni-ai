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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Connected state - show address and disconnect button (no balance)
  if (walletState.isConnected && walletState.address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {formatAddress(walletState.address)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
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
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        <Wallet className="h-4 w-4" />
        {walletState.isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      
      {walletState.error && (
        <p className="text-xs text-destructive text-right max-w-48">
          {walletState.error}
        </p>
      )}
    </div>
  );
}
