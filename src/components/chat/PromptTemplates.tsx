// Prompt templates component - Fixed list above chat input with click-to-execute

'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { currentInputAtom, isAIThinkingAtom, walletStateAtom } from '@/src/store/atoms';

interface PromptTemplatesProps {
  onExecutePrompt: (prompt: string) => void;
}

export function PromptTemplates({ onExecutePrompt }: PromptTemplatesProps) {
  const [, setCurrentInput] = useAtom(currentInputAtom);
  const [isAIThinking] = useAtom(isAIThinkingAtom);
  const [walletState] = useAtom(walletStateAtom);

  // Define prompt templates based on wallet connection status
  const promptTemplates = [
    "What's the current market news/trending?",
    "Find trending SUI tokens",
    "Analyze my portfolio",
  ]

  const handlePromptClick = (prompt: string) => {
    if (isAIThinking) return; // Prevent execution while AI is thinking
    
    // Set the input value and immediately execute
    setCurrentInput(prompt);
    onExecutePrompt(prompt);
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
        <span className="text-electric-cyan mr-2">⚡</span>
        Quick Prompts:
      </h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handlePromptClick(promptTemplates[0])}
          disabled={isAIThinking}
          className="flex-1 min-w-[250px] bg-darker-gray/80 hover:bg-darker-gray border border-gray-700 hover:border-electric-cyan/50 rounded-xl p-3 text-left transition-all duration-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan/5 to-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center relative z-10">
            <div className="w-8 h-8 rounded-lg bg-electric-cyan/10 flex items-center justify-center mr-3 group-hover:bg-electric-cyan/20 transition-colors duration-300">
              <span className="text-electric-cyan">📈</span>
            </div>
            <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-300">What's the current market news/trending?</span>
          </div>
        </button>

        <button
          onClick={() => handlePromptClick(promptTemplates[1])}
          disabled={isAIThinking}
          className="flex-1 min-w-[250px] bg-darker-gray/80 hover:bg-darker-gray border border-gray-700 hover:border-hot-pink/50 rounded-xl p-3 text-left transition-all duration-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-hot-pink/5 to-vivid-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center relative z-10">
            <div className="w-8 h-8 rounded-lg bg-hot-pink/10 flex items-center justify-center mr-3 group-hover:bg-hot-pink/20 transition-colors duration-300">
              <span className="text-hot-pink">🔥</span>
            </div>
            <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-300">Find trending SUI tokens</span>
          </div>
        </button>

        <button
          onClick={() => handlePromptClick(promptTemplates[2])}
          disabled={isAIThinking}
          className="flex-1 min-w-[250px] bg-darker-gray/80 hover:bg-darker-gray border border-gray-700 hover:border-neon-green/50 rounded-xl p-3 text-left transition-all duration-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 to-electric-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center relative z-10">
            <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center mr-3 group-hover:bg-neon-green/20 transition-colors duration-300">
              <span className="text-neon-green">💼</span>
            </div>
            <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-300">Analyze my portfolio</span>
          </div>
        </button>
      </div>
      {!walletState.isConnected && (
        <p className="text-xs text-gray-400 text-center mt-3">
          Connect wallet for portfolio analysis and trading features
        </p>
      )}
    </div>
  );
}
