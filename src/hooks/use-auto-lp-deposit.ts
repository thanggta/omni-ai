// Hook to handle automatic LP deposit execution when AI requests it

import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { useLPDeposit } from './use-lp-deposit';
import { useSuiBase } from './use-sui-base';
import { extractLPDepositActionData, hasLPDepositAction } from '@/src/lib/utils/lp-deposit-action-parser';
import { chatMessagesAtom, updateMessageAtom, addMessageAtom, removeMessageAtom } from '@/src/store/atoms';
import { ChatMessage } from '@/src/types';

export function useAutoLPDeposit() {
  const [messages] = useAtom(chatMessagesAtom);
  const [, updateMessage] = useAtom(updateMessageAtom);
  const [, addMessage] = useAtom(addMessageAtom);
  const [, removeMessage] = useAtom(removeMessageAtom);
  const { account } = useSuiBase();
  const lpDepositMutation = useLPDeposit();
  const processedMessageIds = useRef(new Set<string>());

  useEffect(() => {
    // Check for new AI messages with LP deposit actions
    const latestMessage = messages[messages.length - 1];
    
    if (
      latestMessage &&
      latestMessage.role === 'assistant' &&
      !processedMessageIds.current.has(latestMessage.id) &&
      hasLPDepositAction(latestMessage.content)
    ) {
      // Mark this message as processed
      processedMessageIds.current.add(latestMessage.id);
      
      // Extract LP deposit action data
      const lpDepositActionData = extractLPDepositActionData(latestMessage.content);
      
      if (lpDepositActionData && account) {
        executeLPDeposit(lpDepositActionData);
      } else if (lpDepositActionData && !account) {
        // Add new enhanced wallet connection message
        const walletMessage: ChatMessage = {
          id: Date.now().toString(),
          content: `<div class="animate-slide-in-right">
  <div class="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-vivid-purple/30 shadow-lg relative overflow-hidden group">
    <!-- Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-vivid-purple/5 to-magenta/5 opacity-70"></div>
    <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-vivid-purple to-magenta"></div>
    <div class="absolute -top-10 -left-10 w-20 h-20 bg-vivid-purple opacity-10 rounded-full blur-xl"></div>
    
    <!-- Content -->
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-vivid-purple to-magenta flex items-center justify-center">
          <span class="text-white text-sm font-bold">🏦</span>
        </div>
        <h3 class="text-lg font-semibold text-white">LP Deposit Ready</h3>
      </div>
      
      <p class="text-gray-300 mb-4">
        I've prepared your LP deposit transaction for <strong>${lpDepositActionData.data.amount} ${lpDepositActionData.data.vaultSymbol}</strong> into the ${lpDepositActionData.data.vaultSymbol} Vault.
      </p>
      
      <div class="bg-darker-gray/50 rounded-lg p-3 mb-4 border border-vivid-purple/20">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-400">Expected YT Tokens:</div>
          <div class="text-white font-medium">${lpDepositActionData.data.expectedYTTokens.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
          <div class="text-gray-400">Current APR:</div>
          <div class="text-green-400 font-medium">${(lpDepositActionData.data.currentAPR * 100).toFixed(2)}%</div>
          <div class="text-gray-400">Current APY:</div>
          <div class="text-blue-400 font-medium">${(lpDepositActionData.data.currentAPY * 100).toFixed(2)}%</div>
        </div>
      </div>
      
      <p class="text-orange-300 text-sm">
        ⚠️ Please connect your wallet to proceed with the LP deposit.
      </p>
    </div>
    
    <!-- Animated Border -->
    <div class="absolute inset-0 rounded-2xl border border-vivid-purple/30 group-hover:border-vivid-purple/50 transition-colors"></div>
  </div>
</div>`,
          role: 'assistant',
          timestamp: new Date(),
        };

        addMessage(walletMessage);
        toast.warning('Please connect your wallet to proceed with LP deposit');
      }
    }
  }, [messages, account, addMessage]);

  const executeLPDeposit = async (lpDepositActionData: any) => {
    // Generate loading message ID outside try block for access in catch
    const loadingMessageId = Date.now().toString();

    try {
      // Add loading message with LP deposit styling
      const loadingMessage: ChatMessage = {
        id: loadingMessageId,
        content: `<div class="animate-slide-in-right">
  <div class="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-vivid-purple/30 shadow-lg relative overflow-hidden">
    <!-- Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-vivid-purple/5 to-magenta/5 opacity-70"></div>
    <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-vivid-purple to-magenta"></div>
    
    <!-- Content -->
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-vivid-purple to-magenta flex items-center justify-center animate-pulse">
          <span class="text-white text-sm font-bold">🏦</span>
        </div>
        <h3 class="text-lg font-semibold text-white">Processing LP Deposit...</h3>
      </div>
      
      <p class="text-gray-300 mb-4">
        Depositing <strong>${lpDepositActionData.data.amount} ${lpDepositActionData.data.vaultSymbol}</strong> into the ${lpDepositActionData.data.vaultSymbol} Vault...
      </p>
      
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <div class="w-2 h-2 bg-electric-cyan rounded-full animate-pulse"></div>
        <span>Please confirm the transaction in your wallet</span>
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
      toast.info('Please confirm the LP deposit transaction in your wallet');

      // Execute the LP deposit using the LP deposit hook
      const result = await lpDepositMutation.mutateAsync({
        vaultSymbol: lpDepositActionData.data.vaultSymbol,
        amount: lpDepositActionData.data.amount
      });

      // Remove loading message
      removeMessage(loadingMessageId);

      // Add success message
      const successMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `<div class="animate-slide-in-right">
  <div class="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-green-500/30 shadow-lg relative overflow-hidden">
    <!-- Success Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-70"></div>
    <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500"></div>
    
    <!-- Content -->
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-3">
         <div class="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
        <i class="fa-solid fa-check text-neon-green text-lg"></i>
      </div>
        <h3 class="text-lg font-semibold text-white">LP Deposit Successful!</h3>
      </div>
      
      <p class="text-gray-300 mb-4">
        Successfully deposited <strong>${lpDepositActionData.data.amount} ${lpDepositActionData.data.vaultSymbol}</strong> into the ${lpDepositActionData.data.vaultSymbol} Vault.
      </p>
      
      <div class="bg-darker-gray/50 rounded-lg p-3 mb-4 border border-green-500/20">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-400">Expected YT Tokens:</div>
          <div class="text-white font-medium">${lpDepositActionData.data.expectedYTTokens.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
          <div class="text-gray-400">APR:</div>
          <div class="text-green-400 font-medium">${(lpDepositActionData.data.currentAPR * 100).toFixed(2)}%</div>
          <div class="text-gray-400">APY:</div>
          <div class="text-blue-400 font-medium">${(lpDepositActionData.data.currentAPY * 100).toFixed(2)}%</div>
        </div>
      </div>
      
      <p class="text-green-300 text-sm">
        🎉 Your LP position is now active and earning yield!
      </p>
    </div>
  </div>
</div>`,
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(successMessage);
      toast.success(`LP deposit successful! Deposited ${lpDepositActionData.data.amount} ${lpDepositActionData.data.vaultSymbol}`);

    } catch (error) {
      console.error('LP deposit failed:', error);
      
      // Remove loading message
      removeMessage(loadingMessageId);

      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `<div class="animate-slide-in-right">
  <div class="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-red-500/30 shadow-lg relative overflow-hidden">
    <!-- Error Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-70"></div>
    <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-pink-500"></div>
    
    <!-- Content -->
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
          <span class="text-white text-sm font-bold">❌</span>
        </div>
        <h3 class="text-lg font-semibold text-white">LP Deposit Failed</h3>
      </div>
      
      <p class="text-gray-300 mb-4">
        Failed to deposit <strong>${lpDepositActionData.data.amount} ${lpDepositActionData.data.vaultSymbol}</strong> into the ${lpDepositActionData.data.vaultSymbol} Vault.
      </p>
      
      <p class="text-red-300 text-sm">
        ${error instanceof Error ? error.message : 'Unknown error occurred'}
      </p>
    </div>
  </div>
</div>`,
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(errorMessage);
      toast.error(`LP deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
}
