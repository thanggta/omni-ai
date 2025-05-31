// #TODO-12: Implement CoinGecko API integration - OPTIMIZED VERSION

import { API_CONFIG } from '@/src/lib/config';
import { TokenData } from '@/src/types';

// #TODO-12.1: CoinGecko API client setup - IMPLEMENTED
export class CoinGeckoService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = API_CONFIG.COINGECKO_API.API_KEY
      ? API_CONFIG.COINGECKO_API.PRO_BASE_URL
      : API_CONFIG.COINGECKO_API.BASE_URL;
    this.apiKey = API_CONFIG.COINGECKO_API.API_KEY;
  }

  // Helper method to make API requests with proper headers
  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    const url = new URL(fullUrl);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      headers['x-cg-pro-api-key'] = this.apiKey;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinGecko API Error Response:', errorText);
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Helper method to detect stablecoins
  private isStablecoin(token: TokenData): boolean {
    const price = token.current_price || 0;
    const priceChange24h = Math.abs(token.price_change_percentage_24h || 0);
    const symbol = token.symbol?.toLowerCase() || '';
    const name = token.name?.toLowerCase() || '';

    // Common stablecoin identifiers
    const stablecoinSymbols = ['usdc', 'usdt', 'dai', 'busd', 'tusd', 'usdp', 'frax', 'lusd', 'susd', 'usdd', 'usdn', 'ust', 'fei', 'tribe'];
    const stablecoinNames = ['usd coin', 'tether', 'dai stablecoin', 'binance usd', 'trueusd', 'pax dollar', 'frax', 'liquity usd', 'susd', 'usdd', 'neutrino usd', 'terrausd', 'fei protocol', 'tribe'];

    // Check if symbol or name matches known stablecoins
    const isKnownStablecoin = stablecoinSymbols.some(stable => symbol.includes(stable)) ||
                             stablecoinNames.some(stable => name.includes(stable));

    // Check if price is approximately $1 (within 5% tolerance) and has low volatility
    const isPriceStable = price >= 0.95 && price <= 1.05;
    const isLowVolatility = priceChange24h < 2.0; // Less than 2% daily change

    // Token is considered a stablecoin if it matches known patterns OR has stable price characteristics
    return isKnownStablecoin || (isPriceStable && isLowVolatility);
  }

  // #TODO-12.2: Fetch SUI ecosystem token data - OPTIMIZED WITH CATEGORY FILTER AND STABLECOIN FILTERING
  async fetchSUITokens(): Promise<TokenData[]> {
    try {
      console.log('🚀 Starting optimized CoinGecko API call with SUI ecosystem category filter...');
      const startTime = Date.now();

      // SINGLE API CALL using category=sui-ecosystem to get only SUI tokens
      const suiEcosystemTokens = await this.makeRequest(API_CONFIG.COINGECKO_API.ENDPOINTS.COINS_MARKETS, {
        vs_currency: 'usd',
        category: API_CONFIG.COINGECKO_API.SUI_ECOSYSTEM_CATEGORY, // Direct filter for SUI ecosystem tokens
        order: 'volume_desc', // Order by volume to get most active tokens first
        per_page: 100, // Get up to 100 SUI ecosystem tokens
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      });

      const endTime = Date.now();
      console.log(`⚡ SUI ecosystem API call completed in ${endTime - startTime}ms`);
      console.log(`Found ${suiEcosystemTokens.length} SUI ecosystem tokens using category filter`);

      // Filter out stablecoins before trending analysis
      const nonStablecoinTokens = suiEcosystemTokens.filter((token: TokenData) => !this.isStablecoin(token));
      const filteredCount = suiEcosystemTokens.length - nonStablecoinTokens.length;

      if (filteredCount > 0) {
        console.log(`🚫 Filtered out ${filteredCount} stablecoin(s) from trending analysis`);
      }
      console.log(`📊 Analyzing ${nonStablecoinTokens.length} non-stablecoin tokens for trending algorithm`);

      // Sort by DEX Screener-inspired trending algorithm (using filtered non-stablecoin tokens)
      const sortedTokens = nonStablecoinTokens.sort((a: TokenData, b: TokenData) => {
        // Market Activity (60% weight)
        const volumeA = a.total_volume || 0;
        const volumeB = b.total_volume || 0;
        const marketCapA = a.market_cap || 0;
        const marketCapB = b.market_cap || 0;
        const volumeRatioA = marketCapA > 0 ? volumeA / marketCapA : 0;
        const volumeRatioB = marketCapB > 0 ? volumeB / marketCapB : 0;

        // Price Momentum (25% weight)
        const priceChangeA = Math.abs(a.price_change_percentage_24h || 0);
        const priceChangeB = Math.abs(b.price_change_percentage_24h || 0);
        const bullishBonusA = (a.price_change_percentage_24h || 0) > 0 ? 1.2 : 1.0;
        const bullishBonusB = (b.price_change_percentage_24h || 0) > 0 ? 1.2 : 1.0;

        // Liquidity & Size (10% weight)
        const sizeScoreA = marketCapA > 1000000 && marketCapA < 10000000000 ? 1.0 : 0.7;
        const sizeScoreB = marketCapB > 1000000 && marketCapB < 10000000000 ? 1.0 : 0.7;

        // Volatility Factor (5% weight)
        const volatilityA = Math.min(priceChangeA, 50);
        const volatilityB = Math.min(priceChangeB, 50);

        // Calculate trending scores
        const marketActivityScoreA = (volumeA * 0.4) + (volumeRatioA * 1000000 * 0.2);
        const marketActivityScoreB = (volumeB * 0.4) + (volumeRatioB * 1000000 * 0.2);
        const momentumScoreA = (priceChangeA * bullishBonusA * 1000);
        const momentumScoreB = (priceChangeB * bullishBonusB * 1000);
        const liquidityScoreA = Math.sqrt(marketCapA) * sizeScoreA;
        const liquidityScoreB = Math.sqrt(marketCapB) * sizeScoreB;
        const volatilityScoreA = volatilityA * 100;
        const volatilityScoreB = volatilityB * 100;

        const scoreA = (marketActivityScoreA * 0.6) + (momentumScoreA * 0.25) + (liquidityScoreA * 0.1) + (volatilityScoreA * 0.05);
        const scoreB = (marketActivityScoreB * 0.6) + (momentumScoreB * 0.25) + (liquidityScoreB * 0.1) + (volatilityScoreB * 0.05);

        return scoreB - scoreA;
      });

      // Return top 8 trending SUI ecosystem tokens
      // Since we're using category=sui-ecosystem, all tokens are already SUI-related
      return sortedTokens.slice(0, 8);

    } catch (error) {
      console.error('Error fetching SUI ecosystem tokens with category filter:', error);
      // Fallback: try to get just SUI main token
      try {
        console.log('🔄 Attempting fallback with SUI main token only...');
        const fallbackResponse = await this.makeRequest(API_CONFIG.COINGECKO_API.ENDPOINTS.COINS_MARKETS, {
          vs_currency: 'usd',
          ids: 'sui', // Only fetch SUI main token as fallback
          order: 'market_cap_desc',
          per_page: 1,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        });
        console.log('✅ Fallback successful - returning SUI main token only');
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('Fallback SUI token fetch failed:', fallbackError);
        throw new Error(`Failed to fetch SUI token data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // #TODO-12.3: Get token market data - IMPLEMENTED
  async getTokenMarketData(tokenId: string): Promise<TokenData | null> {
    try {
      const response = await this.makeRequest(API_CONFIG.COINGECKO_API.ENDPOINTS.COINS_MARKETS, {
        vs_currency: 'usd',
        ids: tokenId,
        order: 'market_cap_desc',
        per_page: 1,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d,30d'
      });
      return response[0] || null;
    } catch (error) {
      console.error(`Error fetching market data for token ${tokenId}:`, error);
      return null;
    }
  }

  // #TODO-12.4: Monitor price movements - IMPLEMENTED (automatically excludes stablecoins via fetchSUITokens)
  async monitorPriceMovements(): Promise<{ gainers: TokenData[]; losers: TokenData[]; high_volume: TokenData[] }> {
    try {
      const tokens = await this.fetchSUITokens(); // Already filtered to exclude stablecoins

      const gainers = tokens
        .filter(token => (token.price_change_percentage_24h || 0) > 0)
        .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
        .slice(0, 10);

      const losers = tokens
        .filter(token => (token.price_change_percentage_24h || 0) < 0)
        .sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
        .slice(0, 10);

      const high_volume = tokens
        .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))
        .slice(0, 10);

      return { gainers, losers, high_volume };
    } catch (error) {
      console.error('Error monitoring price movements:', error);
      return { gainers: [], losers: [], high_volume: [] };
    }
  }

  // Helper method to generate CoinGecko URLs for tokens
  generateTokenUrl(tokenId: string): string {
    return `https://www.coingecko.com/en/coins/${tokenId}`;
  }

  // Helper method to check if service is properly configured
  isConfigured(): boolean {
    return !!this.baseUrl;
  }
}

// #TODO-12.5: Export CoinGecko service instance - IMPLEMENTED
export const coinGeckoService = new CoinGeckoService();
