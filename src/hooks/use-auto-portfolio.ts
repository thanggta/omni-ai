// Hook to handle automatic portfolio UI rendering when AI requests it
// Note: Portfolio UI is now rendered directly in MessageBubble component
// This hook is kept for potential future enhancements but currently just logs detection

import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { extractPortfolioUIData, hasPortfolioUI } from '@/src/lib/utils/portfolio-action-parser';
import { chatMessagesAtom } from '@/src/store/atoms';

export function useAutoPortfolio() {
  const [messages] = useAtom(chatMessagesAtom);
  const processedMessageIds = useRef(new Set<string>());

  useEffect(() => {
    // Check for new AI messages with portfolio UI data
    const latestMessage = messages[messages.length - 1];

    if (
      latestMessage &&
      latestMessage.role === 'assistant' &&
      !processedMessageIds.current.has(latestMessage.id) &&
      hasPortfolioUI(latestMessage.content)
    ) {
      // Mark this message as processed
      processedMessageIds.current.add(latestMessage.id);

      // Extract portfolio UI data
      const portfolioUIData = extractPortfolioUIData(latestMessage.content);

      if (portfolioUIData) {
        console.log('Portfolio UI data detected - will be rendered by MessageBubble:', portfolioUIData);
      }
    }
  }, [messages]);
}
