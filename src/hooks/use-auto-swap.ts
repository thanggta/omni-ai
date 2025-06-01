// Hook to handle automatic swap execution when AI requests it

import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { use7kSwap } from './use-7k-swap';
import { useSuiBase } from './use-sui-base';
import { extractSwapActionData, hasSwapAction } from '@/src/lib/utils/swap-action-parser';
import { chatMessagesAtom, updateMessageAtom, addMessageAtom, removeMessageAtom } from '@/src/store/atoms';
import { ChatMessage } from '@/src/types';

export function useAutoSwap() {
  const [messages] = useAtom(chatMessagesAtom);
  const [, updateMessage] = useAtom(updateMessageAtom);
  const [, addMessage] = useAtom(addMessageAtom);
  const [, removeMessage] = useAtom(removeMessageAtom);
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
        // Add new enhanced wallet connection message
        const walletMessage: ChatMessage = {
          id: Date.now().toString(),
          content: `<div class="animate-slide-in-right">
  <div class="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-vivid-purple/30 shadow-lg relative overflow-hidden group">
    <!-- Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-vivid-purple/5 to-magenta/5 opacity-70"></div>
    <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-vivid-purple to-magenta"></div>
    <div class="absolute -top-10 -left-10 w-20 h-20 bg-vivid-purple opacity-10 rounded-full blur-xl"></div>

    <!-- Message Content -->
    <div class="flex items-start space-x-4 relative z-10">
      <div class="w-10 h-10 rounded-full bg-vivid-purple/20 flex items-center justify-center flex-shrink-0">
        <i class="fa-solid fa-wallet text-vivid-purple text-lg"></i>
      </div>

      <div class="flex-1">
        <h3 class="text-vivid-purple font-bold text-lg mb-2">**Wallet Connection Required**</h3>
        <p class="text-gray-200 mb-4">Please connect your wallet to proceed with the swap.</p>

        <button class="inline-flex items-center px-4 py-2 rounded-lg bg-vivid-purple/20 text-white text-sm hover:bg-vivid-purple/30 transition-all duration-300" onclick="document.querySelector('[data-wallet-button]')?.click()">
          <i class="fa-solid fa-plug mr-2"></i>
          Connect Wallet
        </button>
      </div>
    </div>
  </div>
</div>`,
          role: 'assistant',
          timestamp: new Date(),
        };
        addMessage(walletMessage);
        toast.error('Please connect your wallet to execute the swap');
      }
    }
  }, [messages, account, updateMessage, addMessage]);

  const executeSwap = async (swapActionData: any) => {
    // Generate loading message ID outside try block for access in catch
    const loadingMessageId = Date.now().toString();

    try {
      // Add new enhanced loading message with cyberpunk styling
      const loadingMessage: ChatMessage = {
        id: loadingMessageId,
        content: `<div class="animate-slide-in-left">
  <div class="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-electric-cyan/30 shadow-lg relative overflow-hidden group">
    <!-- Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-electric-cyan/5 to-neon-blue/5 opacity-70"></div>
    <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-electric-cyan to-neon-blue"></div>
    <div class="absolute -top-10 -left-10 w-20 h-20 bg-electric-cyan opacity-10 rounded-full blur-xl"></div>

    <!-- Message Header -->
    <div class="flex items-center mb-4">
      <div class="h-2 w-2 rounded-full bg-electric-cyan mr-2 animate-pulse"></div>
      <span class="text-electric-cyan font-bold text-sm tracking-wide">OMNI AI</span>
      <div class="ml-2 px-1.5 py-0.5 rounded-md bg-electric-cyan/10 border border-electric-cyan/20">
        <span class="text-[10px] text-electric-cyan">PROCESSING</span>
      </div>
    </div>

    <!-- Processing Animation -->
    <div class="flex items-center space-x-3 relative z-10">
      <div class="flex space-x-2 items-center">
        <div class="w-10 h-10 rounded-full bg-electric-cyan/10 flex items-center justify-center animate-thinking">
          <i class="fa-solid fa-arrows-rotate text-electric-cyan"></i>
        </div>

        <div class="flex space-x-1">
          <div class="w-2 h-2 rounded-full bg-electric-cyan animate-dot-pulse"></div>
          <div class="w-2 h-2 rounded-full bg-electric-cyan animate-dot-pulse" style="animation-delay: 0.15s;"></div>
          <div class="w-2 h-2 rounded-full bg-electric-cyan animate-dot-pulse" style="animation-delay: 0.3s;"></div>
        </div>
      </div>

      <div class="text-gray-300 text-sm">
        **Executing swap... Please confirm the transaction in your wallet.**
      </div>
    </div>

    <!-- Reverse Shimmer Effect Background -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-electric-cyan to-transparent bg-[length:200%_100%] animate-[shimmer-reverse_2s_linear_infinite]"></div>
  </div>
</div>`,
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

      // Remove loading message and add success message
      removeMessage(loadingMessageId);

      const successMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `<div class="animate-slide-in-right">
  <div class="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-neon-green/30 shadow-lg relative overflow-hidden group">
    <!-- Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-neon-green/5 to-electric-cyan/5 opacity-70"></div>
    <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neon-green to-electric-cyan"></div>
    <div class="absolute -top-10 -left-10 w-20 h-20 bg-neon-green opacity-10 rounded-full blur-xl"></div>

    <!-- Message Content -->
    <div class="flex items-start space-x-4 relative z-10">
      <div class="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
        <i class="fa-solid fa-check text-neon-green text-lg"></i>
      </div>

      <div class="flex-1">
        <h3 class="text-neon-green font-bold text-lg mb-2">**Swap completed successfully!**</h3>
        <p class="text-gray-200 mb-4">Your tokens should appear in your wallet shortly.</p>

        <a href="https://suivision.xyz/txblock/${result.digest}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 rounded-lg bg-darker-gray/60 border border-neon-green/30 text-neon-green text-sm hover:bg-darker-gray/80 hover:border-neon-green/50 transition-all duration-300 group/btn cursor-pointer">
          <i class="fa-solid fa-external-link mr-2 group-hover/btn:translate-x-0.5 transition-transform duration-300"></i>
          View transaction on SUI Vision
          <div class="absolute inset-0 bg-neon-green/10 opacity-0 group-hover/btn:opacity-100 rounded-lg transition-opacity duration-300"></div>
        </a>
      </div>
    </div>

    <!-- Progress Bar Animation -->
    <div class="absolute bottom-0 left-0 w-full h-1 bg-darker-gray/40">
      <div class="h-full bg-gradient-to-r from-neon-green to-electric-cyan w-full origin-left animate-[shrink_5s_linear_forwards]"></div>
    </div>
  </div>
</div>`,
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(successMessage);
      toast.success('Swap completed successfully!');

    } catch (error) {
      console.error('Swap execution error:', error);

      // Remove loading message and add error message
      removeMessage(loadingMessageId);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: `<div class="animate-slide-in-right">
  <div class="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-neon-red/30 shadow-lg relative overflow-hidden group">
    <!-- Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-neon-red/5 to-red-500/5 opacity-70"></div>
    <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neon-red to-red-500"></div>
    <div class="absolute -top-10 -left-10 w-20 h-20 bg-neon-red opacity-10 rounded-full blur-xl"></div>

    <!-- Message Content -->
    <div class="flex items-start space-x-4 relative z-10">
      <div class="w-10 h-10 rounded-full bg-neon-red/20 flex items-center justify-center flex-shrink-0">
        <i class="fa-solid fa-xmark text-neon-red text-lg"></i>
      </div>

      <div class="flex-1">
        <h3 class="text-neon-red font-bold text-lg mb-2">**Swap failed:**</h3>
        <p class="text-gray-200 mb-4">${error instanceof Error ? error.message : 'Unknown error occurred'}</p>

        <div class="flex flex-wrap gap-3">
          <button class="inline-flex items-center px-4 py-2 rounded-lg bg-neon-red/20 text-white text-sm hover:bg-neon-red/30 transition-all duration-300" onclick="window.location.reload()">
            <i class="fa-solid fa-rotate-right mr-2"></i>
            Try Again
          </button>

          <button class="inline-flex items-center px-4 py-2 rounded-lg bg-darker-gray/60 text-gray-300 text-sm hover:bg-darker-gray/80 transition-all duration-300" onclick="alert('Please check your wallet connection and balance.')">
            <i class="fa-solid fa-wallet mr-2"></i>
            Check Wallet
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`,
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
