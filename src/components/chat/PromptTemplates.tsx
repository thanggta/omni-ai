// Prompt templates component - Fixed list above chat input with click-to-execute

'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { Button } from "@/components/ui/button";
import { currentInputAtom, isAIThinkingAtom, walletStateAtom } from '@/src/store/atoms';

interface PromptTemplatesProps {
  onExecutePrompt: (prompt: string) => void;
}

export function PromptTemplates({ onExecutePrompt }: PromptTemplatesProps) {
  const [, setCurrentInput] = useAtom(currentInputAtom);
  const [isAIThinking] = useAtom(isAIThinkingAtom);
  const [walletState] = useAtom(walletStateAtom);

  // Define prompt templates based on wallet connection status
  const promptTemplates = walletState.isConnected 
    ? [
        "What's the current market news/trending?",
        "Analyze trending SUI tokens",
        "Show me Twitter sentiment about SUI",
        "Analyze my portfolio",
        "Swap 10 SUI to USDC for me"
      ]
    : [
        "What's the current market news/trending?",
        "Analyze trending SUI tokens", 
        "Show me Twitter sentiment about SUI"
      ];

  const handlePromptClick = (prompt: string) => {
    if (isAIThinking) return; // Prevent execution while AI is thinking
    
    // Set the input value and immediately execute
    setCurrentInput(prompt);
    onExecutePrompt(prompt);
  };

  return (
    <div className="border-b bg-gray-50/50 p-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {promptTemplates.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
            onClick={() => handlePromptClick(prompt)}
            disabled={isAIThinking}
          >
            {prompt}
          </Button>
        ))}
      </div>
      {!walletState.isConnected && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Connect wallet for portfolio analysis and trading features
        </p>
      )}
    </div>
  );
}
