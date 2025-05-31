// #TODO-19.8: Client-side streaming utilities - IMPLEMENTED

export interface StreamingChatOptions {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  walletAddress?: string; // Add wallet address to options
}

export interface StreamingChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// #TODO-19.8.1: Client-side streaming chat function
export async function streamChat(
  message: string,
  conversationHistory: StreamingChatMessage[] = [],
  options: StreamingChatOptions = {}
): Promise<void> {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        walletAddress: options.walletAddress, // Include wallet address in request
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    options.onStart?.();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  // Already called onStart above
                  break;
                case 'token':
                  options.onToken?.(data.content);
                  break;
                case 'end':
                  options.onEnd?.();
                  return;
                case 'error':
                  options.onError?.(data.error);
                  return;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    console.error('Streaming chat error:', error);
    options.onError?.(error instanceof Error ? error.message : 'Unknown error');
  }
}

// #TODO-19.8.2: React hook for streaming chat - IMPLEMENTED
import { useState, useCallback } from 'react';

export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    conversationHistory: StreamingChatMessage[] = [],
    walletAddress?: string
  ) => {
    setIsStreaming(true);
    setCurrentMessage('');
    setError(null);

    await streamChat(message, conversationHistory, {
      walletAddress, // Pass wallet address to streaming function
      onStart: () => {
        setCurrentMessage('');
      },
      onToken: (token) => {
        setCurrentMessage(prev => prev + token);
      },
      onEnd: () => {
        setIsStreaming(false);
      },
      onError: (errorMessage) => {
        setError(errorMessage);
        setIsStreaming(false);
      },
    });
  }, []);

  const clearMessage = useCallback(() => {
    setCurrentMessage('');
    setError(null);
  }, []);

  return {
    isStreaming,
    currentMessage,
    error,
    sendMessage,
    clearMessage,
  };
}

// Note: React import needed for the hook
// import { useState } from 'react';

// #TODO-19.8.3: Example usage
/*
// Basic usage:
await streamChat('What is SUI blockchain?', [], {
  onToken: (token) => console.log(token),
  onEnd: () => console.log('Done!'),
});

// React component usage:
function ChatComponent() {
  const { isStreaming, currentMessage, sendMessage } = useStreamingChat();
  
  const handleSend = () => {
    sendMessage('Analyze SUI market trends');
  };
  
  return (
    <div>
      <button onClick={handleSend} disabled={isStreaming}>
        Send Message
      </button>
      <div>{currentMessage}</div>
    </div>
  );
}
*/
