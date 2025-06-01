// Utility to extract trending tokens UI data from AI messages

import { TrendingToken } from '@/src/components/portfolio/TrendingTokensUI';

/**
 * Extracts trending tokens UI data from AI message content
 * Looks for hidden HTML comment with trending tokens data: <!-- TRENDING_TOKENS_UI_DATA:{...} -->
 */
export function extractTrendingTokensUIData(content: string): TrendingToken[] | null {
  try {
    // Look for the hidden comment pattern
    const trendingTokensDataMatch = content.match(/<!-- TRENDING_TOKENS_UI_DATA:(.*?) -->/);

    if (!trendingTokensDataMatch || !trendingTokensDataMatch[1]) {
      return null;
    }

    // Parse the JSON data - now it's directly an array of tokens
    const trendingTokensData = JSON.parse(trendingTokensDataMatch[1]) as TrendingToken[];

    // Validate the structure
    if (Array.isArray(trendingTokensData) && trendingTokensData.length > 0) {
      return trendingTokensData;
    }

    return null;
  } catch (error) {
    console.error('Error parsing trending tokens UI data:', error);
    return null;
  }
}

/**
 * Checks if a message contains trending tokens UI data
 */
export function hasTrendingTokensUI(content: string): boolean {
  return extractTrendingTokensUIData(content) !== null;
}

/**
 * Removes the hidden trending tokens UI data from message content for display
 */
export function cleanTrendingTokensMessageContent(content: string): string {
  // Remove the hidden trending tokens UI data
  return content.replace(/<!-- TRENDING_TOKENS_UI_DATA:.*? -->/g, '').trim();
}
