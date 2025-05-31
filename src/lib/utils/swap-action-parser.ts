// Utility to extract swap action data from AI messages

export interface SwapActionData {
  type: 'SWAP_ACTION';
  data: {
    fromToken: string;
    toToken: string;
    amount: number;
    fromTokenAddress: string;
    toTokenAddress: string;
    expectedOutput: number;
    minimumReceived: number;
    priceImpact: number;
    exchangeRate: number;
    estimatedGasFee: number;
    amountIn: string; // Amount in smallest unit for 7k SDK
    slippage: number;
  };
}

/**
 * Extracts swap action data from AI message content
 * Looks for hidden HTML comment with swap data: <!-- SWAP_ACTION_DATA:{...} -->
 */
export function extractSwapActionData(content: string): SwapActionData | null {
  try {
    // Look for the hidden comment pattern
    const swapDataMatch = content.match(/<!-- SWAP_ACTION_DATA:(.*?) -->/);
    
    if (!swapDataMatch || !swapDataMatch[1]) {
      return null;
    }

    // Parse the JSON data
    const swapActionData = JSON.parse(swapDataMatch[1]) as SwapActionData;
    
    // Validate the structure
    if (
      swapActionData.type === 'SWAP_ACTION' &&
      swapActionData.data &&
      swapActionData.data.fromTokenAddress &&
      swapActionData.data.toTokenAddress &&
      swapActionData.data.amountIn
    ) {
      return swapActionData;
    }

    return null;
  } catch (error) {
    console.error('Error parsing swap action data:', error);
    return null;
  }
}

/**
 * Checks if a message contains swap action data
 */
export function hasSwapAction(content: string): boolean {
  return extractSwapActionData(content) !== null;
}

/**
 * Removes the hidden swap action data from message content for display
 * Also removes any additional LLM commentary after the swap tool response
 */
export function cleanMessageContent(content: string): string {
  // First remove the hidden swap action data
  let cleaned = content.replace(/<!-- SWAP_ACTION_DATA:.*? -->/g, '').trim();

  // If this is a swap action message, only keep the first sentence/paragraph
  // to avoid showing additional LLM commentary
  if (hasSwapAction(content)) {
    // Look for the main swap message and stop at any additional commentary
    const swapMessage = 'I will now proceed to execute the swap for you. Please hold on a moment while I handle the transaction.';
    if (cleaned.includes(swapMessage)) {
      // Only return the main swap message, ignore any additional content
      return swapMessage;
    }
  }

  return cleaned;
}
