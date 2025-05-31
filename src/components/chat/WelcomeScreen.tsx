// #TODO-7: Welcome screen component with quick starters

'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { Button } from "@/components/ui/button";
import { currentInputAtom } from '@/src/store/atoms';

export function WelcomeScreen() {
  const [, setCurrentInput] = useAtom(currentInputAtom);

  const quickStarters = [
    "What's the current market news/trending?",
    "Analyze trending SUI tokens",
    "Show me Twitter sentiment about SUI",
    "Analyze my portfolio"
  ];

  const handleQuickStart = (prompt: string) => {
    setCurrentInput(prompt);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">SUI Daily Assistant</h1>
        <p className="text-muted-foreground">
          Your AI agent for SUI market insights, Twitter sentiment, and trading intelligence
        </p>
      </div>
      
      <div className="space-y-2 w-full max-w-md">
        <p className="text-sm text-muted-foreground text-center">Try asking:</p>
        {quickStarters.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full text-left justify-start"
            onClick={() => handleQuickStart(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}
