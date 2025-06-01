// Utility to extract portfolio UI data from AI messages

export interface TokenHolding {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change24h: number;
  amount: number;
  value: number;
  color: string;
}

export interface PortfolioInsights {
  diversity: string;
  largestHolding: string;
  largestHoldingPercentage: number;
}

// #TODO-29: Add LP data interfaces to portfolio parser
export interface LPPosition {
  vaultSymbol: string;
  vaultName: string;
  ytBalance: string;
  equity: string;
  apr: number;
  apy: number;
  tvl: string;
}

export interface LPData {
  positions: LPPosition[];
  lastUpdated: string;
  isLoading: boolean;
}

export interface PortfolioUIData {
  type: 'PORTFOLIO_UI';
  data: {
    walletAddress: string;
    netWorth: number;
    suiAmount: string;
    totalTokens: number;
    holdings: TokenHolding[];
    analysisTimestamp: string;
    insights: PortfolioInsights;
    lpData?: LPData; // Optional LP data
  };
}

/**
 * Extracts portfolio UI data from AI message content
 * Looks for hidden HTML comment with portfolio data: <!-- PORTFOLIO_UI_DATA:{...} -->
 */
export function extractPortfolioUIData(content: string): PortfolioUIData | null {
  try {
    // Look for the hidden comment pattern
    console.log(content)
    const portfolioDataMatch = content.match(/<!-- PORTFOLIO_UI_DATA:(.*?) -->/);
    
    if (!portfolioDataMatch || !portfolioDataMatch[1]) {
      return null;
    }

    // Parse the JSON data
    const portfolioUIData = JSON.parse(portfolioDataMatch[1]) as PortfolioUIData;
    
    // Validate the structure
    if (
      portfolioUIData.type === 'PORTFOLIO_UI' &&
      portfolioUIData.data &&
      portfolioUIData.data.walletAddress &&
      portfolioUIData.data.holdings &&
      Array.isArray(portfolioUIData.data.holdings)
    ) {
      return portfolioUIData;
    }

    return null;
  } catch (error) {
    console.error('Error parsing portfolio UI data:', error);
    return null;
  }
}

/**
 * Checks if a message contains portfolio UI data
 */
export function hasPortfolioUI(content: string): boolean {
  return extractPortfolioUIData(content) !== null;
}

/**
 * Removes the hidden portfolio UI data from message content for display
 * Keeps the user-friendly summary text
 */
export function cleanPortfolioMessageContent(content: string): string {
  // Remove the hidden portfolio UI data
  return content.replace(/<!-- PORTFOLIO_UI_DATA:.*? -->/g, '').trim();
}

/**
 * Checks if a message is a portfolio analysis response
 */
export function isPortfolioAnalysisMessage(content: string): boolean {
  return content.includes('Portfolio Summary:') || 
         content.includes('portfolio analysis') ||
         hasPortfolioUI(content);
}
