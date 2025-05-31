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
import { useAutoPortfolio } from '@/src/hooks/use-auto-portfolio';
import { SimpleWalletButton } from '@/src/components/wallet/SimpleWalletButton';

// #TODO-7: Simple chat interface main component using modular components
export function ChatInterface() {
  const [messages] = useAtom(chatMessagesAtom);

  // Initialize auto-swap and auto-portfolio functionality
  useAutoSwap();
  useAutoPortfolio();

  return (
    <div className="h-screen flex flex-col relative">
      {/* Top-right wallet connect button */}
      <div className="absolute top-4 right-4 z-10">
        <SimpleWalletButton />
      </div>

      {/* #TODO-7.2: Messages area using MessageList component or WelcomeScreen */}
      {messages.length === 0 ? (
        <WelcomeScreen />
      ) : (
        <MessageList />
      )}

      {/* #TODO-7.3: Input area using ChatInput component */}
      <ChatInput />
    </div>
  );
}
