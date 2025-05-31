// #TODO-7: Message list component for displaying all chat messages

'use client';

import React, { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { chatMessagesAtom, isAIThinkingAtom } from '@/src/store/atoms';
import { MessageBubble } from './MessageBubble';
import { AIThinkingIndicator } from './AIThinkingIndicator';

export function MessageList() {
  const [messages] = useAtom(chatMessagesAtom);
  const [isAIThinking] = useAtom(isAIThinkingAtom);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAIThinking]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {/* AI thinking indicator */}
      {isAIThinking && <AIThinkingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
