// #TODO-19: LangGraph ReactAgent implementation for proper tool orchestration - OPTIMIZED

// #TODO-19.1: Import LangGraph dependencies for ReactAgent - IMPLEMENTED
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { API_CONFIG, APP_CONSTANTS } from '@/src/lib/config';
import { coinGeckoService } from "../services/coingecko";

// Streaming callback interface
export interface StreamingCallback {
  onToken?: (token: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  walletAddress?: string; // Add wallet address for portfolio analysis
}

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

// #TODO-19.2: Twitter analysis tool - IMPLEMENTED with LangGraph
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
              content: `Extract and analyze trending X (Twitter) posts about blockchain and crypto related to "${query}" from the past 24 hours. Focus on SUI ecosystem if relevant. Provide analysis with URLs for citations.`
            }
          ],
          search_parameters: {
            mode: "on",
            from_date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString().split('T')[0],
            to_date: new Date().toISOString().split('T')[0],
            sources: [{ "type": "x" }],
          },
          model: API_CONFIG.XAI_API.MODELS.GROK_LATEST,
          stream: false,
        })
      });

      if (!response.ok) {
        throw new Error(`X.AI API error: ${response.status} ${response.statusText}`);
      }

      const data: XAIResponse = await response.json();
      const analysisResult = data.choices?.[0]?.message?.content || 'No analysis available';

      return `Twitter Analysis for "${query}":\n\n${analysisResult}`;

    } catch (error) {
      console.error('Error in Twitter analysis tool:', error);
      return `Twitter sentiment analysis for "${query}" - Unable to fetch real-time data. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your X.AI API configuration.`;
    }
  },
  {
    name: APP_CONSTANTS.LANGCHAIN.TOOL_NAMES.TWITTER_ANALYSIS,
    description: 'Analyze market news/trendd for blockchain and crypto topics using X.AI Grok. Provides trending X posts, engagement metrics, and sentiment analysis.',
    schema: z.object({
      query: z.string().describe('The search query for market analysis (e.g., "market news", "trending", "crypto")')
    })
  }
);

// #TODO-19.3: Market analysis tool - IMPLEMENTED with LangGraph
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

      // Format top 8 trending tokens for display
      const trendingTokensList = suiTokens.slice(0, 8).map(token => 
        `**${token.name} (${token.symbol.toUpperCase()})** - Price: $${token.current_price} | 24h: ${token.price_change_percentage_24h >= 0 ? '+' : ''}${token.price_change_percentage_24h?.toFixed(2)}% | Volume: $${(token.total_volume / 1000000).toFixed(1)}M | Market Cap: $${(token.market_cap / 1000000).toFixed(1)}M`
      );

      // Create market data URLs for citations
      const marketDataUrls = suiTokens.slice(0, 8).map(token => 
        `[${token.name}](${coinGeckoService.generateTokenUrl(token.id)})`
      );

      const marketAnalysisContext = `
SUI Ecosystem Market Analysis for "${query}":

TRENDING TOKENS: 
${trendingTokensList}

MARKET INSIGHTS:
- Total SUI ecosystem tokens analyzed: ${suiTokens.length}
- Top gainers: ${priceMovements.gainers.slice(0, 3).map(t => `${t.name} (+${t.price_change_percentage_24h?.toFixed(2)}%)`).join(', ')}
- High volume tokens: ${priceMovements.high_volume.slice(0, 3).map(t => `${t.name} ($${(t.total_volume / 1000000).toFixed(1)}M)`).join(', ')}

MARKET DATA SOURCES:
${marketDataUrls.join('\n')}

Analysis timestamp: ${new Date().toISOString()}
Data source: CoinGecko API with SUI ecosystem category filter
`;

      return `SUI Market Analysis for "${query}":\n\n${marketAnalysisContext}`;

    } catch (error) {
      console.error('Error in Market analysis tool:', error);
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

// #TODO-19.7: LangGraph ReactAgent orchestrator - IMPLEMENTED
export class LangGraphAgent {
  private agent: any;
  private checkpointer: MemorySaver;
  private chatModel: ChatOpenAI;

  constructor() {
    // Initialize OpenAI chat model with global config
    this.chatModel = new ChatOpenAI({
      openAIApiKey: API_CONFIG.OPENAI_API.API_KEY,
      modelName: API_CONFIG.OPENAI_API.MODELS.CHAT,
      temperature: API_CONFIG.OPENAI_API.PARAMETERS.TEMPERATURE,
      maxTokens: API_CONFIG.OPENAI_API.PARAMETERS.MAX_TOKENS,
      streaming: true,
      verbose: true,
    });

    // Initialize memory to persist state between graph runs
    this.checkpointer = new MemorySaver();

    // Import portfolio tool
    const { portfolioAnalysisTool } = require('./tools');

    // Create ReactAgent with tools
    this.agent = createReactAgent({
      llm: this.chatModel,
      tools: [twitterAnalysisTool, marketAnalysisTool, portfolioAnalysisTool],
      checkpointSaver: this.checkpointer,
    });
  }

  // Streaming method to process user requests with LangGraph ReactAgent
  async processUserRequestStream(
    message: string,
    conversationHistory: Array<{role: 'user' | 'assistant'; content: string}> = [],
    callbacks?: StreamingCallback
  ): Promise<void> {
    try {
      callbacks?.onStart?.();

      // Check if this is a portfolio analysis request and we have a wallet address
      let processedMessage = message;
      const isPortfolioRequest = /portfolio|holdings|wallet|balance|tokens|analyze.*my/i.test(message);

      if (isPortfolioRequest && callbacks?.walletAddress) {
        // Automatically inject wallet address for portfolio analysis
        processedMessage = `${message} (Use wallet address: ${callbacks.walletAddress})`;
        console.log('Portfolio request detected, injecting wallet address:', callbacks.walletAddress);
      } else if (isPortfolioRequest && !callbacks?.walletAddress) {
        // Portfolio request without wallet - inform user
        processedMessage = `${message} (Note: No wallet connected - please connect your wallet first for portfolio analysis)`;
        console.log('Portfolio request detected but no wallet address available');
      }

      // Create messages array with system prompt and conversation history
      const messages = [
        new SystemMessage(APP_CONSTANTS.LANGCHAIN.SYSTEM_PROMPTS.SUI_TRADING_ASSISTANT),
        ...conversationHistory.slice(-APP_CONSTANTS.LANGCHAIN.CONVERSATION_MEMORY_SIZE).map(msg =>
          new HumanMessage(msg.content)
        ),
        new HumanMessage(processedMessage)
      ];

      // Use ReactAgent with proper streaming mode for tokens
      const stream = await this.agent.stream(
        { messages },
        {
          configurable: { thread_id: "chat-session" },
          streamMode: "messages" // This is the key for token streaming
        }
      );

      // Process streaming tokens according to LangGraph documentation
      for await (const [messageChunk, _metadata] of stream) {
        if (messageChunk && messageChunk.content && typeof messageChunk.content === 'string' && messageChunk.content.length > 0) {
          callbacks?.onToken?.(messageChunk.content);
        }
      }

      callbacks?.onEnd?.();
    } catch (error) {
      console.error('Error in LangGraph agent streaming:', error);
      callbacks?.onError?.(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  // Non-streaming method to process user requests with LangGraph ReactAgent
  async processUserRequest(
    message: string,
    conversationHistory: Array<{role: 'user' | 'assistant'; content: string}> = []
  ): Promise<string> {
    try {
      // Create messages array with system prompt and conversation history
      const messages = [
        new SystemMessage(APP_CONSTANTS.LANGCHAIN.SYSTEM_PROMPTS.SUI_TRADING_ASSISTANT),
        ...conversationHistory.slice(-APP_CONSTANTS.LANGCHAIN.CONVERSATION_MEMORY_SIZE).map(msg => 
          new HumanMessage(msg.content)
        ),
        new HumanMessage(message)
      ];

      // Use ReactAgent
      const result = await this.agent.invoke(
        { messages },
        { configurable: { thread_id: "chat-session" } }
      );

      // Extract the final response
      const finalMessage = result.messages[result.messages.length - 1];
      return typeof finalMessage.content === 'string' 
        ? finalMessage.content 
        : 'I apologize, but I could not generate a response.';

    } catch (error) {
      console.error('Error in LangGraph agent:', error);
      return 'I apologize, but I encountered an error processing your message. Please try again.';
    }
  }

  // Helper method to check if the agent is properly configured
  isConfigured(): boolean {
    return !!API_CONFIG.OPENAI_API.API_KEY;
  }
}

// Export singleton instance
export const langGraphAgent = new LangGraphAgent();
