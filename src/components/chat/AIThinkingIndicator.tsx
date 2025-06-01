// #TODO-7: AI thinking indicator component

'use client';

import React from 'react';
import { AnimatedMessageWrapper } from './AnimatedMessageWrapper';

export function AIThinkingIndicator() {
  // Generate unique ID for each thinking session
  const thinkingId = `ai-thinking-${Date.now()}`;

  const thinkingContent = (
    <div className="flex items-start">
      <div className="flex-1">
        <div className="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-electric-cyan/30 shadow-lg relative overflow-hidden group">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan/5 to-neon-blue/5 opacity-70"></div>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-electric-cyan to-neon-blue"></div>
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-electric-cyan opacity-10 rounded-full blur-xl"></div>

          {/* Message Header */}
          <div className="flex items-center mb-4">
            <div className="h-2 w-2 rounded-full bg-electric-cyan mr-2 animate-pulse"></div>
            <span className="text-electric-cyan font-bold text-sm tracking-wide">OMNI AI</span>
          </div>

          {/* Enhanced Thinking Animation */}
          <div className="flex items-center space-x-3 relative z-10">
            <div className="flex space-x-2 items-center">
              <div className="w-10 h-10 rounded-full bg-electric-cyan/10 flex items-center justify-center animate-thinking">
                <i className="fa-solid fa-microchip text-electric-cyan"></i>
              </div>

              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-electric-cyan animate-dot-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-electric-cyan animate-dot-pulse" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 rounded-full bg-electric-cyan animate-dot-pulse" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>

            <div className="text-gray-300 text-sm">
              Processing your request...
            </div>
          </div>

          {/* Reverse Shimmer Effect Background */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-electric-cyan to-transparent bg-[length:200%_100%] animate-shimmer-reverse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatedMessageWrapper
      messageId={thinkingId}
      animationClass="animate-slide-in-left"
      animationDuration={500}
    >
      {thinkingContent}
    </AnimatedMessageWrapper>
  );
}
