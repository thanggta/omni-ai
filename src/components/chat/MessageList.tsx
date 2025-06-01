// #TODO-7: Message list component for displaying all chat messages

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { chatMessagesAtom, isAIThinkingAtom } from '@/src/store/atoms';
import { MessageBubble } from './MessageBubble';
import { AIThinkingIndicator } from './AIThinkingIndicator';

export function MessageList() {
  const [messages] = useAtom(chatMessagesAtom);
  const [isAIThinking] = useAtom(isAIThinkingAtom);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Debounced scroll function for smoother UX
  const debouncedScrollToBottom = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      scrollToBottom();
    }, 200); // 200ms debounce delay
  }, []);

  useEffect(() => {
    debouncedScrollToBottom();
  }, [messages, isAIThinking, debouncedScrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex-grow overflow-y-auto space-y-6 pr-2 mb-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* AI thinking indicator */}
      {isAIThinking && <AIThinkingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}
