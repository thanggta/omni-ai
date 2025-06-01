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

import { PromptTemplates } from './PromptTemplates';

export function ChatInput() {
  const [currentInput, setCurrentInput] = useAtom(currentInputAtom);
  const [isAIThinking, setIsAIThinking] = useAtom(isAIThinkingAtom);
  const [, addMessage] = useAtom(addMessageAtom);
  const [, updateMessage] = useAtom(updateMessageAtom);
  const [messages] = useAtom(chatMessagesAtom);
  const [walletState] = useAtom(walletStateAtom);

  const handleSendMessage = async (messageToSend?: string) => {
    const messageContent = messageToSend || currentInput;
    if (!messageContent.trim() || isAIThinking) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message
    addMessage(userMessage);
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

  const handleButtonClick = () => {
    handleSendMessage();
  };

  const handlePromptExecute = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div>
      {/* Prompt Templates - Fixed list above input */}
      <PromptTemplates onExecutePrompt={handlePromptExecute} />

      {/* Input Area */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan/20 to-vivid-purple/20 blur-xl opacity-30 rounded-xl"></div>
        <div className="relative bg-gradient-to-r from-darker-gray/90 to-darker-gray/80 backdrop-blur-sm rounded-xl border border-gray-700 p-4 hover:border-gray-600 focus-within:border-electric-cyan/50 transition-colors duration-300">
          <div className="flex space-x-3">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                walletState.isConnected
                  ? "Ask anything about SUI blockchain..."
                  : "Ask anything about SUI blockchain (connect wallet for portfolio analysis)..."
              }
              disabled={isAIThinking}
              className="flex-1 bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:border-transparent text-gray-100 placeholder-gray-500 resize-none outline-none"
            />
            <Button
              onClick={handleButtonClick}
              disabled={!currentInput.trim() || isAIThinking}
              className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center relative overflow-hidden group bg-gradient-to-r from-electric-cyan to-neon-blue text-black hover:opacity-90"
            >
              <span className="relative z-10 font-medium">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
