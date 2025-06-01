// Utility to extract LP deposit action data from AI messages

export interface LPDepositActionData {
  type: 'LP_DEPOSIT_ACTION';
  data: {
    vaultSymbol: string;
    amount: number;
    expectedYTTokens: number;
    currentAPR: number;
    currentAPY: number;
    vaultTVL: string;
    walletAddress: string;
  };
}

/**
 * Extracts LP deposit action data from AI message content
 * Looks for hidden HTML comment with LP deposit data: <!-- LP_DEPOSIT_ACTION_DATA:{...} -->
 */
export function extractLPDepositActionData(content: string): LPDepositActionData | null {
  try {
    // Look for the hidden comment pattern
    const lpDepositDataMatch = content.match(/<!-- LP_DEPOSIT_ACTION_DATA:(.*?) -->/);
    
    if (!lpDepositDataMatch || !lpDepositDataMatch[1]) {
      return null;
    }

    // Parse the JSON data
    const lpDepositActionData = JSON.parse(lpDepositDataMatch[1]) as LPDepositActionData;
    
    // Validate the structure
    if (
      lpDepositActionData.type === 'LP_DEPOSIT_ACTION' &&
      lpDepositActionData.data &&
      lpDepositActionData.data.vaultSymbol &&
      lpDepositActionData.data.amount &&
      lpDepositActionData.data.walletAddress
    ) {
      return lpDepositActionData;
    }

    return null;
  } catch (error) {
    console.error('Error parsing LP deposit action data:', error);
    return null;
  }
}

/**
 * Checks if a message contains LP deposit action data
 */
export function hasLPDepositAction(content: string): boolean {
  return extractLPDepositActionData(content) !== null;
}

/**
 * Removes the hidden LP deposit action data from message content for display
 * Also removes any additional LLM commentary after the LP deposit tool response
 */
export function cleanLPDepositMessageContent(content: string): string {
  // First remove the hidden LP deposit action data
  let cleaned = content.replace(/<!-- LP_DEPOSIT_ACTION_DATA:.*? -->/g, '').trim();

  // If this is an LP deposit action message, only keep the first sentence/paragraph
  // to avoid showing additional LLM commentary
  if (hasLPDepositAction(content)) {
    // Look for the main LP deposit message and stop at any additional commentary
    const lpDepositMessagePattern = /I will now proceed to deposit .* into the .* Vault for you\. Please hold on a moment while I prepare the transaction\./;
    const match = cleaned.match(lpDepositMessagePattern);
    if (match) {
      // Only return the main LP deposit message, ignore any additional content
      return match[0];
    }
  }

  return cleaned;
}
