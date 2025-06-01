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

  // #TODO-20.1: Generate chart URLs for tokens - UPDATED WITH PROPER EMBED FORMAT
  generateChartUrls(token: TokenData): { chartUrl?: string; dexScreenerUrl?: string } {
    // Generate DEX Screener URL if token has contract address on SUI
    let tokenAddress: string | undefined;

    // Check for SUI platform contract address
    if (token.platform?.token_address && token.platform.id === 'sui-network') {
      tokenAddress = token.platform.token_address;
    }

    // Fallback: Try to get token address using known token mappings
    if (!tokenAddress) {
      const knownTokenAddresses = this.getKnownSUITokenAddresses();
      tokenAddress = knownTokenAddresses[token.id.toLowerCase()] || knownTokenAddresses[token.symbol.toLowerCase()];
    }

    // For SUI native token, use a special address if not found
    if (token.symbol.toLowerCase() === 'sui' && !tokenAddress) {
      // SUI native token might have a special representation on DEX Screener
      tokenAddress = '0x2::sui::SUI';
    }

    // Build DEX Screener URL with embed parameters if we have a token address
    let dexScreenerUrl: string | undefined;
    if (tokenAddress) {
      dexScreenerUrl = this.buildDexScreenerEmbedUrl(tokenAddress);
    }

    return {
      chartUrl: dexScreenerUrl, // Prioritize DEX Screener as primary chart URL
      dexScreenerUrl
    };
  }

  // #TODO-20.3: Build DEX Screener embed URL with optimized parameters - NEW
  private buildDexScreenerEmbedUrl(tokenAddress: string): string {
    const baseUrl = `https://dexscreener.com/sui/${tokenAddress}`;
    const embedParams = new URLSearchParams({
      embed: '1',           // Enable embed mode for iframe
      theme: 'dark',        // Dark theme to match our UI
      trades: '0',          // Hide trades panel for cleaner chart focus
      info: '0',           // Hide token info panel for more chart space
      // Additional parameters for better embed experience
      header: '0',         // Hide header for more chart space
      chartLeftToolbar: '0', // Hide left toolbar for cleaner view
      chartType: 'candles' // Use candlestick chart for better trading view
    });

    return `${baseUrl}?${embedParams.toString()}`;
  }

  // #TODO-20.2: Known SUI token addresses mapping - NEW
  private getKnownSUITokenAddresses(): Record<string, string> {
    return {
      // Known SUI ecosystem token addresses (to be expanded as we discover more)
      'sui': '0x2::sui::SUI',
      'cetus': '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
      'navx': '0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2e04fd44e516781ac0a8e3e8e::navx::NAVX',
      'deep': '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
      // Add more as we discover them
    };
  }

  // #TODO-12.6: Get token price by contract address - NEW
  async getTokenPriceByContract(contractAddress: string, platformId: string = 'sui'): Promise<number | null> {
    try {
      const response = await this.makeRequest(`/simple/token_price/${platformId}`, {
        contract_addresses: contractAddress,
        vs_currencies: 'usd'
      });

      // Response format: { "contract_address": { "usd": price } }
      const tokenData = response[contractAddress.toLowerCase()];
      return tokenData?.usd || null;
    } catch (error) {
      console.error(`Error fetching price for contract ${contractAddress}:`, error);
      return null;
    }
  }

  // #TODO-12.7: Get multiple token prices by contract addresses - NEW
  async getMultipleTokenPricesByContract(contractAddresses: string[], platformId: string = 'sui'): Promise<Record<string, number>> {
    try {
      if (contractAddresses.length === 0) return {};

      const response = await this.makeRequest(`/simple/token_price/${platformId}`, {
        contract_addresses: contractAddresses.join(','),
        vs_currencies: 'usd'
      });

      const prices: Record<string, number> = {};
      for (const address of contractAddresses) {
        const tokenData = response[address.toLowerCase()];
        if (tokenData?.usd) {
          prices[address] = tokenData.usd;
        }
      }

      return prices;
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
      return {};
    }
  }

  // #TODO-12.8: Search token by symbol - NEW
  async searchTokenBySymbol(symbol: string): Promise<any | null> {
    try {
      const response = await this.makeRequest('/search', {
        query: symbol
      });

      // Find token in coins array that matches the symbol
      const coins = response.coins || [];
      const matchingCoin = coins.find((coin: any) =>
        coin.symbol?.toLowerCase() === symbol.toLowerCase()
      );

      if (matchingCoin) {
        // Get detailed token info including platform addresses
        const detailResponse = await this.makeRequest(`/coins/${matchingCoin.id}`, {
          localization: false,
          tickers: false,
          market_data: false,
          community_data: false,
          developer_data: false,
          sparkline: false
        });

        return detailResponse;
      }

      return null;
    } catch (error) {
      console.error(`Error searching for token ${symbol}:`, error);
      return null;
    }
  }

  // Helper method to check if service is properly configured
  isConfigured(): boolean {
    return !!this.baseUrl;
  }
}

// #TODO-12.5: Export CoinGecko service instance - IMPLEMENTED
export const coinGeckoService = new CoinGeckoService();
