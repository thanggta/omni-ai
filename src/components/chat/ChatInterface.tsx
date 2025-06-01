// #TODO-6: Create simple chat interface component (SIMPLIFIED - Full-screen chatbox only)
// #TODO-7: Refactored to use separate message display and input components

'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { chatMessagesAtom } from '@/src/store/atoms';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import { useAutoSwap } from '@/src/hooks/use-auto-swap';
import { useAutoLPDeposit } from '@/src/hooks/use-auto-lp-deposit';
import { useAutoPortfolio } from '@/src/hooks/use-auto-portfolio';
import { SimpleWalletButton } from '@/src/components/wallet/SimpleWalletButton';

// #TODO-7: Simple chat interface main component using modular components with cyberpunk styling
export function ChatInterface() {
  const [messages] = useAtom(chatMessagesAtom);

  // Initialize auto-swap, auto-LP-deposit, and auto-portfolio functionality
  useAutoSwap();
  useAutoLPDeposit();
  useAutoPortfolio();

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-electric-cyan opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-vivid-purple opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-neon-blue opacity-5 rounded-full blur-3xl"></div>

        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-electric-cyan via-neon-blue to-vivid-purple bg-[size:400%_400%] animate-gradient-shift"></div>

        {/* Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,191,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

        {/* Animated Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-electric-cyan animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/3 w-2 h-2 rounded-full bg-vivid-purple animate-pulse-slow"></div>
        <div className="absolute top-2/3 left-1/2 w-2 h-2 rounded-full bg-neon-blue animate-pulse-slow"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-hot-pink animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 rounded-full bg-neon-green animate-pulse-slow"></div>
      </div>

      {/* Top-right wallet connect button - positioned absolutely to viewport */}
      <div className="fixed top-6 right-6 z-30">
        <SimpleWalletButton />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 h-screen flex flex-col">

        {/* #TODO-7.2: Messages area using MessageList component or WelcomeScreen */}
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <MessageList />
        )}

        {/* #TODO-7.3: Input area using ChatInput component */}
        <ChatInput />
      </div>
    </div>
  );
}
