// #TODO-7: AI thinking indicator component

'use client';

import React from 'react';
import { Card } from "@/components/ui/card";

export function AIThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <Card className="bg-muted p-3">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-muted-foreground">AI is thinking...</span>
        </div>
      </Card>
    </div>
  );
}
