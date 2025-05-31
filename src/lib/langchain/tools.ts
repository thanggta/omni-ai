// #TODO-19: Implement LangChain tool orchestration with proper function calling - OPTIMIZED

// #TODO-19.1: Import LangChain dependencies for proper tool calling - IMPLEMENTED
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { API_CONFIG, APP_CONSTANTS } from '@/src/lib/config';
import { coinGeckoService } from "../services/coingecko";

// TypeScript interfaces for tool responses
export interface TrendingPost {
  title: string;
  content_summary: string;
  engagement_metrics: {
    likes: number;
    reposts: number;
    comments: number;
    engagement_score: number;
  };
  post_url: string;
  author: string;
  timestamp: string;
  category: 'ecosystem_news' | 'token_protocol' | 'nft_gaming' | 'defi_grants' | 'technical_update' | 'partnership' | 'other';
  trending_factor: 'high' | 'medium' | 'rising';
}

interface XAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Streaming callback interface
export interface StreamingCallback {
  onToken?: (token: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

// #TODO-19.2: Twitter analysis tool - IMPLEMENTED with proper LangChain function calling
export const twitterAnalysisTool = tool(
  async ({ query }: { query: string }) => {
    try {
      console.log(`🐦 Analyzing Twitter trends for: ${query}`);

      // Use X.AI Grok API to fetch and analyze trending crypto posts
      const response = await fetch(`${API_CONFIG.XAI_API.BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_CONFIG.XAI_API.API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `
              Extract and analyze trending X (Twitter) posts about blockchain and crypto related to "${query}" from the past 24 hours. Return results as structured JSON array with the following schema for each post:

              {
                "title": "Brief descriptive title (max 100 chars)",
                "content_summary": "Concise summary of key points (max 200 chars)",
                "engagement_metrics": {
                  "likes": number,
                  "reposts": number,
                  "comments": number,
                  "engagement_score": number
                },
                "post_url": "X link of the post, coming from the citation",
                "author": "@username",
                "timestamp": "YYYY-MM-DD HH:MM:SS UTC",
                "category": "ecosystem_news|token_protocol|nft_gaming|defi_grants|technical_update|partnership|other",
                "trending_factor": "high|medium|rising"
              }

              Content Criteria:
              - Minimum engagement: 300+ likes OR high repost/comment ratio
              - Time range: Past 72 hours only
              - Sources: All accounts
              - Target quantity: 8-12 posts minimum
              - Focus on: ${query}

              Priority Topics:
              1. New ecosystem developments and partnerships
              2. Token launches, protocol updates, or DeFi innovations
              3. NFT collections, gaming launches, or creator economy
              4. Grants, campaigns, or community initiatives
              5. Technical updates, network upgrades, or developer tools

              Sort by engagement score (weighted combination of likes, reposts, comments) descending.

              Additional Requirements:
              - Include both original posts and high-engagement reposts
              - Capture trending hashtags in content_summary
              - Flag time-sensitive content (launches, events)
              - Exclude spam, promotional low-quality content

              Provide analysis summary at the end with key trends and sentiment insights.`
            }
          ],
          search_parameters: {
            mode: "on",
            from_date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString().split('T')[0], // 72 hours ago
            to_date: new Date().toISOString().split('T')[0], // today
            sources: [
              { "type": "x" },
            ],
          },
          model: API_CONFIG.XAI_API.MODELS.GROK_LATEST,
          stream: false, // X.AI streaming not implemented yet, keeping non-streaming for now
        })
      });

      if (!response.ok) {
        throw new Error(`X.AI API error: ${response.status} ${response.statusText}`);
      }

      const data: XAIResponse = await response.json();

      // Extract the content from X.AI response
      const analysisResult = data.choices?.[0]?.message?.content || 'No analysis available';

      return `Twitter Trending Analysis for "${query}":\n\n${analysisResult}`;

    } catch (error) {
      console.error('Error in Twitter analysis tool:', error);

      // Fallback to basic analysis message
      return `Twitter sentiment analysis for "${query}" - Unable to fetch real-time data. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your X.AI API configuration.`;
    }
  },
  {
    name: APP_CONSTANTS.LANGCHAIN.TOOL_NAMES.TWITTER_ANALYSIS,
    description: 'Analyze Twitter market trends and sentiment for blockchain and crypto topics using X.AI Grok. Provides trending posts, engagement metrics, and sentiment analysis.',
    schema: z.object({
      query: z.string().describe('The search query for Twitter analysis (e.g., "SUI blockchain", "crypto trends", "DeFi")')
    })
  }
);

// #TODO-19.3: Market analysis tool - IMPLEMENTED with proper LangChain function calling
export const marketAnalysisTool = tool(
  async ({ query }: { query: string }) => {
    try {
      console.log(`📊 Analyzing SUI market data for: ${query}`);

      // Fetch SUI ecosystem token data from CoinGecko using optimized category filter
      const suiTokens = await coinGeckoService.fetchSUITokens();

      if (!suiTokens || suiTokens.length === 0) {
        return `Market analysis for "${query}" - Unable to fetch SUI token data from CoinGecko. Please check your API configuration or try again later.`;
      }

      // Get price movement analysis
      const priceMovements = await coinGeckoService.monitorPriceMovements();

      // Format market data for AI analysis with structured trending tokens list (top 8)
      const trendingTokensList = suiTokens.slice(0, 8).map(token => ({
        name: token.name,
        symbol: token.symbol,
        price: token.current_price,
        change_24h: token.price_change_percentage_24h,
        volume: token.total_volume,
        market_cap: token.market_cap,
        coingecko_url: coinGeckoService.generateTokenUrl(token.id),
        formatted_display: `**${token.name} (${token.symbol})** - Price: $${token.current_price} | 24h: ${token.price_change_percentage_24h >= 0 ? '+' : ''}${token.price_change_percentage_24h?.toFixed(2)}% | Volume: $${(token.total_volume / 1000000).toFixed(1)}M | Market Cap: $${(token.market_cap / 1000000).toFixed(1)}M`
      }));

      const marketDataSummary = {
        total_tokens_analyzed: suiTokens.length,
        trending_tokens: trendingTokensList,
        top_gainers: priceMovements.gainers.slice(0, 5).map(token => ({
          name: token.name,
          symbol: token.symbol,
          price: token.current_price,
          change_24h: token.price_change_percentage_24h,
          volume: token.total_volume,
          market_cap: token.market_cap,
          coingecko_url: coinGeckoService.generateTokenUrl(token.id)
        })),
        top_losers: priceMovements.losers.slice(0, 5).map(token => ({
          name: token.name,
          symbol: token.symbol,
          price: token.current_price,
          change_24h: token.price_change_percentage_24h,
          volume: token.total_volume,
          market_cap: token.market_cap,
          coingecko_url: coinGeckoService.generateTokenUrl(token.id)
        })),
        high_volume_tokens: priceMovements.high_volume.slice(0, 5).map(token => ({
          name: token.name,
          symbol: token.symbol,
          price: token.current_price,
          change_24h: token.price_change_percentage_24h,
          volume: token.total_volume,
          market_cap: token.market_cap,
          coingecko_url: coinGeckoService.generateTokenUrl(token.id)
        })),
        sui_main_token: suiTokens.find(token => token.id === 'sui') ? {
          name: suiTokens.find(token => token.id === 'sui')!.name,
          symbol: suiTokens.find(token => token.id === 'sui')!.symbol,
          price: suiTokens.find(token => token.id === 'sui')!.current_price,
          change_24h: suiTokens.find(token => token.id === 'sui')!.price_change_percentage_24h,
          volume: suiTokens.find(token => token.id === 'sui')!.total_volume,
          market_cap: suiTokens.find(token => token.id === 'sui')!.market_cap,
          market_cap_rank: suiTokens.find(token => token.id === 'sui')!.market_cap_rank,
          coingecko_url: coinGeckoService.generateTokenUrl('sui')
        } : null,
        analysis_timestamp: new Date().toISOString(),
        data_source: 'CoinGecko API'
      };

      // Create comprehensive market analysis context
      const marketAnalysisContext = `
SUI Ecosystem Trending Tokens Analysis for "${query}":

MARKET OVERVIEW:
- Total SUI ecosystem tokens analyzed: ${marketDataSummary.total_tokens_analyzed}
- Analysis timestamp: ${marketDataSummary.analysis_timestamp}
- Data source: ${marketDataSummary.data_source}
- Focus: Trending tokens on SUI blockchain

TRENDING TOKENS DATA (Pre-formatted for display):
${marketDataSummary.trending_tokens.map(token => `- ${token.formatted_display}`).join('\n')}

ALL COINGECKO URLS FOR CITATIONS:
${marketDataSummary.trending_tokens.map(token => `- [${token.name}](${token.coingecko_url})`).join('\n')}

SUI MAIN TOKEN (Reference):
${marketDataSummary.sui_main_token ? `
- Name: ${marketDataSummary.sui_main_token.name} (${marketDataSummary.sui_main_token.symbol})
- Current Price: $${marketDataSummary.sui_main_token.price}
- 24h Change: ${marketDataSummary.sui_main_token.change_24h?.toFixed(2)}%
- 24h Volume: $${marketDataSummary.sui_main_token.volume?.toLocaleString()}
- Market Cap: $${marketDataSummary.sui_main_token.market_cap?.toLocaleString()}
- Market Cap Rank: #${marketDataSummary.sui_main_token.market_cap_rank}
- CoinGecko URL: ${marketDataSummary.sui_main_token.coingecko_url}
` : 'SUI main token data not available'}

TOP GAINERS (24h):
${marketDataSummary.top_gainers.map((token, index) => `
${index + 1}. ${token.name} (${token.symbol})
   - Price: $${token.price}
   - 24h Change: +${token.change_24h?.toFixed(2)}%
   - Volume: $${token.volume?.toLocaleString()}
   - Market Cap: $${token.market_cap?.toLocaleString()}
   - CoinGecko URL: ${token.coingecko_url}
`).join('')}

TOP LOSERS (24h):
${marketDataSummary.top_losers.map((token, index) => `
${index + 1}. ${token.name} (${token.symbol})
   - Price: $${token.price}
   - 24h Change: ${token.change_24h?.toFixed(2)}%
   - Volume: $${token.volume?.toLocaleString()}
   - Market Cap: $${token.market_cap?.toLocaleString()}
   - CoinGecko URL: ${token.coingecko_url}
`).join('')}

HIGH VOLUME TOKENS:
${marketDataSummary.high_volume_tokens.map((token, index) => `
${index + 1}. ${token.name} (${token.symbol})
   - Price: $${token.price}
   - 24h Change: ${token.change_24h?.toFixed(2)}%
   - Volume: $${token.volume?.toLocaleString()}
   - Market Cap: $${token.market_cap?.toLocaleString()}
   - CoinGecko URL: ${token.coingecko_url}
`).join('')}

ANALYSIS INSTRUCTIONS:
FOLLOW THIS EXACT FORMAT for your response:

1. START with: "Here's top trending tokens in the past 24 hours:"
   - Use the TRENDING TOKENS DATA (Pre-formatted for display) section above
   - Copy the formatted lines exactly as provided

2. PROVIDE YOUR ANALYSIS:
   - Give your own thoughts about market trends and ecosystem developments
   - Analyze what's driving the price movements and volume
   - Discuss the overall SUI ecosystem sentiment

3. MAKE RECOMMENDATIONS:
   - Recommend checking 1-2 tokens you find most potential
   - Explain WHY these specific tokens are worth watching
   - Include specific reasons (technology, use case, metrics, partnerships, etc.)

4. END with "Market Data Sources:" section:
   - Use the ALL COINGECKO URLS FOR CITATIONS section above
   - Copy the formatted links exactly as provided

IMPORTANT: Focus on SUI ecosystem tokens, not the SUI main token itself.
`;

      return `SUI Market Analysis for "${query}":\n\n${marketAnalysisContext}`;

    } catch (error) {
      console.error('Error in Market analysis tool:', error);

      // Fallback to basic analysis message
      return `Market analysis for "${query}" - Unable to fetch real-time market data. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your CoinGecko API configuration or try again later.`;
    }
  },
  {
    name: APP_CONSTANTS.LANGCHAIN.TOOL_NAMES.MARKET_ANALYSIS,
    description: 'Analyze SUI blockchain market data and provide trading insights using CoinGecko API. Provides trending tokens, price movements, and market analysis.',
    schema: z.object({
      query: z.string().describe('The search query for market analysis (e.g., "SUI market", "trending tokens", "price analysis")')
    })
  }
);

// #TODO-19.4: Portfolio analysis tool - IMPLEMENTED
export const portfolioAnalysisTool = tool(
  async ({ walletAddress }: { walletAddress?: string }, config?: any) => {
    // Try to extract wallet address from the config or message context
    let targetWalletAddress = walletAddress;

    try {

      // If no wallet address provided, try to extract from the message context
      if (!targetWalletAddress && config?.configurable?.messages) {
        const lastMessage = config.configurable.messages[config.configurable.messages.length - 1];
        if (lastMessage?.content) {
          const addressMatch = lastMessage.content.match(/wallet address:\s*([0-9a-fA-Fx]+)/);
          if (addressMatch) {
            targetWalletAddress = addressMatch[1];
            console.log('Extracted wallet address from message context:', targetWalletAddress);
          }
        }
      }

      // Validate wallet address
      if (!targetWalletAddress) {
        return `Portfolio analysis requires a wallet address. Please connect your wallet first or provide a valid SUI wallet address (e.g., "0x1234...abcd").`;
      }

      console.log(`💼 Analyzing portfolio for wallet: ${targetWalletAddress}`);

      // Import suiService here to avoid circular dependencies
      const { suiService } = await import('../services/sui');

      // Get portfolio data from SUI blockchain
      const portfolioData = await suiService.getPortfolio(targetWalletAddress);

      if (!portfolioData || portfolioData.tokens.length === 0) {
        return `Portfolio analysis for wallet ${targetWalletAddress} - No tokens found or wallet is empty. Please ensure the wallet address is correct and has some token balances.`;
      }

      // Format portfolio data for AI analysis
      const portfolioSummary = {
        wallet_address: targetWalletAddress,
        total_estimated_value: portfolioData.totalValue,
        total_tokens: portfolioData.tokens.length,
        total_nfts: portfolioData.nfts.length,
        last_updated: portfolioData.lastUpdated,
        token_holdings: portfolioData.tokens.map(token => ({
          name: token.name || 'Unknown Token',
          symbol: token.symbol,
          balance: token.balance,
          coin_type: token.coinType,
          decimals: token.decimals,
          formatted_display: `**${token.name || token.symbol}** - Balance: ${parseFloat(token.balance).toFixed(4)} ${token.symbol} | Type: ${token.coinType}`
        })),
        nft_collections: portfolioData.nfts.length > 0 ? portfolioData.nfts.slice(0, 10).map((nft, index) => ({
          index: index + 1,
          object_id: nft.data?.objectId || 'Unknown',
          type: nft.data?.type || 'Unknown NFT',
          display: nft.data?.display || {}
        })) : [],
        analysis_timestamp: new Date().toISOString(),
        data_source: 'SUI Blockchain RPC'
      };

      // Create comprehensive portfolio analysis context
      const portfolioAnalysisContext = `
Portfolio Analysis for Wallet: ${walletAddress}

PORTFOLIO OVERVIEW:
- Wallet Address: ${portfolioSummary.wallet_address}
- Total Estimated Value: $${portfolioSummary.total_estimated_value} USD
- Total Token Types: ${portfolioSummary.total_tokens}
- Total NFTs: ${portfolioSummary.total_nfts}
- Last Updated: ${portfolioSummary.last_updated}
- Analysis Timestamp: ${portfolioSummary.analysis_timestamp}
- Data Source: ${portfolioSummary.data_source}

TOKEN HOLDINGS (Detailed):
${portfolioSummary.token_holdings.map(token => `- ${token.formatted_display}`).join('\n')}

${portfolioSummary.total_nfts > 0 ? `
NFT COLLECTIONS (Top 10):
${portfolioSummary.nft_collections.map(nft => `
${nft.index}. Object ID: ${nft.object_id}
   - Type: ${nft.type}
   - Display: ${JSON.stringify(nft.display, null, 2)}
`).join('')}
` : 'NFT COLLECTIONS: None found'}

ANALYSIS INSTRUCTIONS:
FOLLOW THIS EXACT FORMAT for your response:

1. START with: "Here's your current SUI portfolio analysis:"
   - Provide a clear overview of the wallet's holdings
   - Mention total value and number of different assets

2. ANALYZE TOKEN DISTRIBUTION:
   - Break down the major token holdings
   - Identify the primary assets (SUI, major ecosystem tokens)
   - Comment on portfolio diversification

3. PROVIDE INSIGHTS:
   - Assess portfolio health and risk level
   - Identify any notable tokens or positions
   - Comment on SUI ecosystem exposure

4. MAKE RECOMMENDATIONS:
   - Suggest potential portfolio optimizations
   - Recommend tokens to watch or consider
   - Provide risk management advice
   - Suggest diversification strategies if needed

5. END with portfolio summary:
   - Total value and main holdings
   - Key strengths and areas for improvement
   - Next steps for portfolio management

IMPORTANT:
- Focus on SUI ecosystem tokens and their utility
- Provide actionable insights based on current holdings
- Consider both risk and opportunity in recommendations
- Be specific about token names and amounts when relevant
`;

      return `Portfolio Analysis for wallet ${targetWalletAddress}:\n\n${portfolioAnalysisContext}`;

    } catch (error) {
      console.error('Error in Portfolio analysis tool:', error);

      // Fallback to basic analysis message
      return `Portfolio analysis for wallet ${targetWalletAddress || 'unknown'} - Unable to fetch portfolio data. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure the wallet address is valid and try again.`;
    }
  },
  {
    name: 'portfolio_analysis',
    description: 'Analyze a SUI wallet portfolio including token holdings, NFTs, and provide investment insights and recommendations.',
    schema: z.object({
      walletAddress: z.string().optional().describe('The SUI wallet address to analyze (e.g., "0x1234...abcd"). If not provided, will prompt user to connect wallet.')
    })
  }
);

// #TODO-19.5: Swap execution tool
export const swapExecutionTool = {
  // TODO: Create LangChain tool for swap execution
  // - Get price quotes
  // - Execute swaps
  // - Track transactions
};

// #TODO-19.6: News and alerts tool
export const newsAlertsTool = {
  // TODO: Create LangChain tool for news and alerts
  // - Monitor breaking news
  // - Generate alerts
  // - Classify urgency
};

// #TODO-19.7: Tool orchestrator - IMPLEMENTED with proper LangChain function calling
export class AIToolOrchestrator {
  private chatModel: ChatOpenAI;
  private chatChain: RunnableSequence<any, any>;

  constructor() {
    // Initialize OpenAI chat model with global config and streaming enabled
    this.chatModel = new ChatOpenAI({
      openAIApiKey: API_CONFIG.OPENAI_API.API_KEY,
      modelName: API_CONFIG.OPENAI_API.MODELS.CHAT,
      temperature: API_CONFIG.OPENAI_API.PARAMETERS.TEMPERATURE,
      maxTokens: API_CONFIG.OPENAI_API.PARAMETERS.MAX_TOKENS,
      streaming: true, // Enable streaming
      verbose: true, // Enable verbose logging for debugging
    });

    // Bind tools to the chat model for intelligent function calling
    const chatModelWithTools = this.chatModel.bindTools([
      twitterAnalysisTool,
      marketAnalysisTool,
      portfolioAnalysisTool
    ]);

    // Create chat chain with system prompt and conversation history
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', APP_CONSTANTS.LANGCHAIN.SYSTEM_PROMPTS.SUI_TRADING_ASSISTANT],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ]);

    this.chatChain = RunnableSequence.from([
      prompt,
      chatModelWithTools,
    ]);
  }

  // Streaming method to process user requests with LangChain function calling
  async processUserRequestStream(
    message: string,
    conversationHistory: Array<{role: 'user' | 'assistant'; content: string}> = [],
    callbacks?: StreamingCallback
  ): Promise<void> {
    try {
      callbacks?.onStart?.();

      // Convert conversation history to LangChain message format
      const chatHistory: BaseMessage[] = conversationHistory
        .slice(-APP_CONSTANTS.LANGCHAIN.CONVERSATION_MEMORY_SIZE)
        .map(msg => {
          if (msg.role === 'user') {
            return new HumanMessage(msg.content);
          } else {
            return new AIMessage(msg.content);
          }
        });

      // Execute the chat chain with streaming - LangChain will automatically decide when to call tools
      const stream = await this.chatChain.stream({
        input: message,
        chat_history: chatHistory,
      });

      // Process streaming tokens
      for await (const chunk of stream) {
        // Handle different chunk types from LangChain
        if (chunk && typeof chunk === 'object') {
          // For AIMessageChunk objects
          if (chunk.content && typeof chunk.content === 'string') {
            callbacks?.onToken?.(chunk.content);
          }
          // For string chunks
          else if (typeof chunk === 'string') {
            callbacks?.onToken?.(chunk);
          }
        }
      }

      callbacks?.onEnd?.();
    } catch (error) {
      console.error('Error in AIToolOrchestrator streaming:', error);
      callbacks?.onError?.(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  // Main method to process user requests with LangChain function calling (non-streaming)
  async processUserRequest(
    message: string,
    conversationHistory: Array<{role: 'user' | 'assistant'; content: string}> = []
  ): Promise<string> {
    try {
      // Convert conversation history to LangChain message format
      const chatHistory: BaseMessage[] = conversationHistory
        .slice(-APP_CONSTANTS.LANGCHAIN.CONVERSATION_MEMORY_SIZE)
        .map(msg => {
          if (msg.role === 'user') {
            return new HumanMessage(msg.content);
          } else {
            return new AIMessage(msg.content);
          }
        });

      // Execute the chat chain - LangChain will automatically decide when to call tools
      const response = await this.chatChain.invoke({
        input: message,
        chat_history: chatHistory,
      });

      return response.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Error in AIToolOrchestrator:', error);
      return 'I apologize, but I encountered an error processing your message. Please try again.';
    }
  }

  // Helper method to check if the orchestrator is properly configured
  isConfigured(): boolean {
    return !!API_CONFIG.OPENAI_API.API_KEY;
  }
}

// Export singleton instance
export const aiOrchestrator = new AIToolOrchestrator();

// Example usage with proper LangChain function calling:
// The LLM will automatically decide when to call tools based on user input

// Example usage with orchestrator (non-streaming):
// const response = await aiOrchestrator.processUserRequest('What are people saying about SUI on Twitter?');
// LangChain will automatically call twitterAnalysisTool if needed

// const marketResponse = await aiOrchestrator.processUserRequest('Show me SUI market trends and top gainers');
// LangChain will automatically call marketAnalysisTool if needed

// Example usage with orchestrator (streaming):
// await aiOrchestrator.processUserRequestStream(
//   'What are people saying about SUI on Twitter?',
//   [],
//   {
//     onStart: () => console.log('Streaming started'),
//     onToken: (token) => console.log('Token:', token),
//     onEnd: () => console.log('Streaming ended'),
//     onError: (error) => console.error('Streaming error:', error)
//   }
// );
// LangChain will automatically call tools as needed during streaming
