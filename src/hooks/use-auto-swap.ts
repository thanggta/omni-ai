// Hook to handle automatic swap execution when AI requests it

import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { use7kSwap } from './use-7k-swap';
import { useSuiBase } from './use-sui-base';
import { extractSwapActionData, hasSwapAction } from '@/src/lib/utils/swap-action-parser';
import { chatMessagesAtom, updateMessageAtom, addMessageAtom } from '@/src/store/atoms';
import { ChatMessage } from '@/src/types';

export function useAutoSwap() {
  const [messages] = useAtom(chatMessagesAtom);
  const [, updateMessage] = useAtom(updateMessageAtom);
  const [, addMessage] = useAtom(addMessageAtom);
  const { account } = useSuiBase();
  const swapMutation = use7kSwap();
  const processedMessageIds = useRef(new Set<string>());

  useEffect(() => {
    // Check for new AI messages with swap actions
    const latestMessage = messages[messages.length - 1];
    
    if (
      latestMessage &&
      latestMessage.role === 'assistant' &&
      !processedMessageIds.current.has(latestMessage.id) &&
      hasSwapAction(latestMessage.content)
    ) {
      // Mark this message as processed
      processedMessageIds.current.add(latestMessage.id);
      
      // Extract swap action data
      const swapActionData = extractSwapActionData(latestMessage.content);
      
      if (swapActionData && account) {
        executeSwap(swapActionData);
      } else if (swapActionData && !account) {
        // Add new message to indicate wallet connection needed
        const walletMessage: ChatMessage = {
          id: Date.now().toString(),
          content: '⚠️ **Please connect your wallet to proceed with the swap.**',
          role: 'assistant',
          timestamp: new Date(),
        };
        addMessage(walletMessage);
        toast.error('Please connect your wallet to execute the swap');
      }
    }
  }, [messages, account, updateMessage, addMessage]);

  const executeSwap = async (swapActionData: any) => {
    try {
      // Add new loading message
      const loadingMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `🔄 **Executing swap... Please confirm the transaction in your wallet.**`,
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(loadingMessage);
      toast.info('Please confirm the transaction in your wallet');

      // Execute the swap using the 7k hook
      const result = await swapMutation.mutateAsync({
        tokenIn: swapActionData.data.fromTokenAddress,
        tokenOut: swapActionData.data.toTokenAddress,
        amountIn: swapActionData.data.amountIn,
        slippage: swapActionData.data.slippage
      });

      // Add new success message
      const successMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `✅ **Swap completed successfully!** Your tokens should appear in your wallet shortly.

[View transaction on SUI Vision](https://suivision.xyz/txblock/${result.digest})`,
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(successMessage);
      toast.success('Swap completed successfully!');

    } catch (error) {
      console.error('Swap execution error:', error);

      // Add new error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: `❌ **Swap failed:** ${error instanceof Error ? error.message : 'Unknown error occurred'}

Please try again or check your wallet connection.`,
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(errorMessage);
      toast.error('Swap failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return {
    isSwapping: swapMutation.isPending
  };
}
