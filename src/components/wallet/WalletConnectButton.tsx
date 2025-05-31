// #TODO-21: Wallet connect button component for SUI wallet integration

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
import { ConnectButton, useCurrentAccount, useDisconnectWallet, useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { suiService } from '@/src/lib/services/sui';

export function WalletConnectButton() {
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
      console.log('Wallet state update triggered, currentAccount:', currentAccount);

      if (currentAccount?.address) {
        try {
          console.log('Connecting wallet with address:', currentAccount.address);
          setConnecting(true);
          setError(null);

          // Set the current account in the service
          suiService.setCurrentAccount(currentAccount);

          // Get balance
          const balance = await suiService.getBalance(currentAccount.address);
          console.log('Got balance:', balance);

          connectWallet({
            address: currentAccount.address,
            balance: balance.toString()
          });

          console.log('Wallet connected successfully');
        } catch (error) {
          console.error('Failed to update wallet state:', error);
          setError(error instanceof Error ? error.message : 'Failed to get wallet data');
        } finally {
          setConnecting(false);
        }
      } else {
        // No account connected
        console.log('No account connected, disconnecting wallet');
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

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0 SUI';
    if (num < 0.01) return '<0.01 SUI';
    return `${num.toFixed(2)} SUI`;
  };

  if (walletState.isConnected && walletState.address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col text-right text-xs">
          <span className="text-muted-foreground">
            {formatAddress(walletState.address)}
          </span>
          {walletState.balance && (
            <span className="font-medium">
              {formatBalance(walletState.balance)}
            </span>
          )}
        </div>
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

  // Handle custom wallet connection
  const handleConnectClick = () => {
    console.log('Connect button clicked!');
    setConnecting(true);
    setError(null);

    // Get available wallets
    console.log('Available wallets:', wallets);

    if (wallets.length > 0) {
      // Try to find Slush wallet first, otherwise use the first available wallet
      const slushWallet = wallets.find(wallet => wallet.name.toLowerCase().includes('slush'));
      const targetWallet = slushWallet || wallets[0];

      console.log('Connecting to wallet:', targetWallet.name);

      connectWalletMutation(
        { wallet: targetWallet },
        {
          onSuccess: () => {
            console.log('Wallet connected successfully');
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

  return (
    <div className="flex flex-col gap-2">
      {/* Custom clickable connect button */}
      <Button
        onClick={handleConnectClick}
        disabled={walletState.isConnecting}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        size="default"
      >
        <Wallet className="h-4 w-4" />
        {walletState.isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      {/* Simple test button to verify clicking works */}
      <Button
        onClick={() => {
          alert('Button clicking works! The main blue button above should connect to your Slush wallet.');
        }}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        Test Click (Should Show Alert)
      </Button>

      {/* Also include the official dApp kit button as backup */}
      <div className="opacity-75">
        <ConnectButton
          connectText="Official Connect Button"
        />
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          <div>Current Account: {currentAccount?.address ? 'Connected' : 'Not connected'}</div>
          <div>Wallet State: {walletState.isConnected ? 'Connected' : 'Disconnected'}</div>
          <div>Available Wallets: {wallets.length}</div>
          {currentAccount?.address && (
            <div>Address: {currentAccount.address.slice(0, 10)}...</div>
          )}
        </div>
      )}

      {walletState.error && (
        <p className="text-xs text-destructive text-center">
          {walletState.error}
        </p>
      )}
    </div>
  );
}
