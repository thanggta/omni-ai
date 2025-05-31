// #TODO-7: Chat input component for message sending - UPDATED WITH STREAMING

'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  currentInputAtom,
  isAIThinkingAtom,
  addMessageAtom,
  chatMessagesAtom,
  updateMessageAtom,
  walletStateAtom
} from '@/src/store/atoms';
import { ChatMessage } from '@/src/types';
import { streamChat } from '@/src/lib/utils/streaming-client';
import { WalletConnectButton } from '@/src/components/wallet/WalletConnectButton';

export function ChatInput() {
  const [currentInput, setCurrentInput] = useAtom(currentInputAtom);
  const [isAIThinking, setIsAIThinking] = useAtom(isAIThinkingAtom);
  const [, addMessage] = useAtom(addMessageAtom);
  const [, updateMessage] = useAtom(updateMessageAtom);
  const [messages] = useAtom(chatMessagesAtom);
  const [walletState] = useAtom(walletStateAtom);

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isAIThinking) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentInput,
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message
    addMessage(userMessage);
    const messageContent = currentInput;
    setCurrentInput('');
    setIsAIThinking(true);

    // Track the AI message ID and accumulated content for streaming
    const aiMessageId = (Date.now() + 1).toString();
    let accumulatedContent = '';
    let aiMessageCreated = false;

    try {
      // #TODO-11: Connect to streaming API - IMPLEMENTED
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      await streamChat(messageContent, conversationHistory, {
        walletAddress: walletState.address || undefined, // Pass connected wallet address
        onStart: () => {
          // Streaming started - don't create AI message yet, wait for first content
          accumulatedContent = '';
          aiMessageCreated = false;
        },
        onToken: (token: string) => {
          // Accumulate content
          accumulatedContent += token;

          // Create AI message on first token arrival and hide thinking indicator
          if (!aiMessageCreated) {
            const aiMessage: ChatMessage = {
              id: aiMessageId,
              content: accumulatedContent,
              role: 'assistant',
              timestamp: new Date(),
            };
            addMessage(aiMessage);
            aiMessageCreated = true;
            setIsAIThinking(false); // Hide thinking indicator immediately when first content arrives
          } else {
            // Update existing AI message with accumulated content
            updateMessage({ id: aiMessageId, content: accumulatedContent });
          }
        },
        onEnd: () => {
          // Streaming ended - thinking indicator should already be hidden
          // Only set to false if no content was received (edge case)
          if (!aiMessageCreated) {
            setIsAIThinking(false);
          }
        },
        onError: (errorMessage: string) => {
          console.error('Streaming error:', errorMessage);

          // Create error message if no AI message was created yet
          if (!aiMessageCreated) {
            const aiMessage: ChatMessage = {
              id: aiMessageId,
              content: 'Sorry, I encountered an error processing your message. Please try again.',
              role: 'assistant',
              timestamp: new Date(),
            };
            addMessage(aiMessage);
          } else {
            // Update existing message with error
            updateMessage({
              id: aiMessageId,
              content: 'Sorry, I encountered an error processing your message. Please try again.'
            });
          }
          setIsAIThinking(false);
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);

      // Create error message if no AI message was created yet
      if (!aiMessageCreated) {
        const aiMessage: ChatMessage = {
          id: aiMessageId,
          content: 'Sorry, I encountered an error processing your message. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
        };
        addMessage(aiMessage);
      } else {
        // Update existing message with error
        updateMessage({
          id: aiMessageId,
          content: 'Sorry, I encountered an error processing your message. Please try again.'
        });
      }
      setIsAIThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t p-4">
      {/* Wallet connection area */}
      <div className="flex justify-end mb-3">
        <WalletConnectButton />
      </div>

      {/* Chat input area */}
      <div className="flex space-x-2">
        <Input
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            walletState.isConnected
              ? "Ask about SUI market sentiment, trends, portfolio analysis, or trading insights..."
              : "Ask about SUI market sentiment, trends, or trading insights (connect wallet for portfolio analysis)..."
          }
          disabled={isAIThinking}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!currentInput.trim() || isAIThinking}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
