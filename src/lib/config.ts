// #TODO-5: Application configuration and environment variables

// #TODO-5.7: Define API endpoints and configuration
export const API_CONFIG = {
  // General API configuration
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  NODE_ENV: process.env.NODE_ENV || 'development',

  TWITTER_API: {
    BASE_URL: 'https://api.twitterapi.io',
    API_KEY: process.env.TWITTER_API_KEY || '',
    ENDPOINTS: {
      ADVANCED_SEARCH: '/twitter/tweet/advanced_search',
      USER_TWEETS: '/twitter/user/tweets',
      TRENDING: '/twitter/trending'
    }
  },
  COINGECKO_API: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    PRO_BASE_URL: 'https://pro-api.coingecko.com/api/v3',
    API_KEY: process.env.COINGECKO_API_KEY || '',
    ENDPOINTS: {
      COINS_MARKETS: '/coins/markets',
      ASSET_PLATFORMS: '/asset_platforms',
      TRENDING: '/search/trending',
      COIN_DATA: '/coins',
      SIMPLE_PRICE: '/simple/price'
    },
    PARAMETERS: {
      VS_CURRENCY: 'usd',
      ORDER: 'market_cap_desc',
      PER_PAGE: 50,
      PAGE: 1,
      SPARKLINE: false,
      PRICE_CHANGE_PERCENTAGE: '24h'
    },
    SUI_PLATFORM_ID: 'sui-network', // SUI blockchain platform identifier
    SUI_ECOSYSTEM_CATEGORY: 'sui-ecosystem' // SUI ecosystem category for filtering
  },
  OPENAI_API: {
    API_KEY: process.env.OPENAI_API_KEY || '',
    BASE_URL: 'https://api.openai.com/v1',
    DEFAULT_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    MODELS: {
      CHAT: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      ANALYSIS: 'gpt-4',
      FAST: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    },
    PARAMETERS: {
      TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS || '800'),
      TOP_P: 1,
      FREQUENCY_PENALTY: 0,
      PRESENCE_PENALTY: 0
    }
  },
  XAI_API: {
    API_KEY: process.env.XAI_API_KEY || 'xai-DNVinLhlmSOAUdNq0uhoByC0LGj1qASyx4Fqe4KX63D2cbp3ASLwxYld1oKckHZLVXRAD7qIk79TVmCW',
    BASE_URL: 'https://api.x.ai/v1',
    MODELS: {
      GROK_LATEST: 'grok-3-latest',
      GROK_BETA: 'grok-beta'
    },
    PARAMETERS: {
      TEMPERATURE: 0.7,
      MAX_TOKENS: 4000
    }
  },
  GROK_API: {
    API_KEY: process.env.GROK_API_KEY || '',
    BASE_URL: process.env.GROK_BASE_URL || '',
    DEFAULT_MODEL: 'grok-beta'
  },
  SUI_RPC: {
    // TODO: SUI RPC configuration
  }
};

// #TODO-5.8: Define application constants
export const APP_CONSTANTS = {
  REFRESH_INTERVALS: {
    TWITTER_TRENDING: 30 * 60 * 1000, // 30 minutes
    TWITTER_REALTIME: 1 * 60 * 1000,  // 1 minute
    MARKET_DATA: 5 * 60 * 1000,       // 5 minutes
  },
  ALERT_THRESHOLDS: {
    // TODO: Define alert threshold configurations
  },
  UI_SETTINGS: {
    // TODO: Define UI-related constants
  },
  LANGCHAIN: {
    CONVERSATION_MEMORY_SIZE: 10,
    SYSTEM_PROMPTS: {
      SUI_TRADING_ASSISTANT: `STEP 1: CHECK FOR SWAP REQUESTS FIRST

If user message contains words like "swap", "exchange", "trade", "convert" with token amounts:
→ Use the swap_execution tool
→ Do NOT use market_intelligence tool
→ IMPORTANT: After using swap_execution tool, DO NOT add any additional commentary or explanation. The tool response is complete and final.

Examples:
- "swap 10 SUI to USDC" = use swap_execution (then STOP)
- "swap 10 SUI to USDC for me" = use swap_execution (then STOP)
- "exchange 50 DEEP for SUI" = use swap_execution (then STOP)
- "trade 100 SUI for USDT" = use swap_execution (then STOP)

You are a helpful AI assistant for SUI cryptocurrency trading.

Available tools:
- swap_execution: For token swaps/exchanges/trades
- market_intelligence: For price analysis and market data
- twitter_sentiment_analysis: For social media sentiment
- portfolio_analysis: For wallet analysis

You can help with:
- Market sentiment analysis
- Trading insights and strategies
- Technical analysis
- General cryptocurrency knowledge
- Real-time Twitter sentiment analysis
- Live market data and trending tokens
- Personal portfolio analysis
- Token swapping and DEX transactions

FORMATTING RULES:
- Use **bold headings** to organize information
- Add blank lines between sections
- Use bullet points for lists only

      **TWITTER ANALYSIS & CITATIONS:**
      When Twitter Analysis Context is provided in your input:
      - ALWAYS include a **Sources** section at the end of your response
      - Preserve ALL URLs from the Twitter analysis context
      - Format source links as: [Brief Description](URL) - @username
      - Include both your analysis AND the source citations
      - Example format:
        **Sources:**
        - [SUI ecosystem update](https://x.com/username/status/123) - @suifoundation
        - [DeFi protocol launch](https://x.com/username/status/456) - @defiprotocol

      **MARKET ANALYSIS & CITATIONS:**
      When Market Analysis Context is provided in your input:
      - Follow this EXACT structure for market analysis responses:

      1. **Start with trending tokens list:**
         "Here's top trending tokens in the past 24 hours:"
         - List each token with: **Token Name (TICKER)** - Price: $X.XX | 24h: ±X.XX% | Volume: $X.XXM | Market Cap: $X.XXM

      2. **Provide your analysis:**
         - Give your own thoughts and insights about the market trends
         - Analyze what's driving the movements
         - Discuss ecosystem developments

      3. **Make recommendations:**
         - Recommend checking 1-2 tokens you find most potential
         - Explain WHY these tokens are worth watching
         - Include specific reasons (technology, partnerships, metrics, etc.)

      4. **End with Market Data Sources:**
         - Preserve ALL CoinGecko URLs from the market analysis context
         - Format as: [Token Name](CoinGecko URL)

      Example format:
      Here's top trending tokens in the past 24 hours:
      - **Walrus (WAL)** - Price: $0.50 | 24h: -5.44% | Volume: $51.4M | Market Cap: $659M
      - **DeepBook (DEEP)** - Price: $0.14 | 24h: -9.61% | Volume: $35.5M | Market Cap: $360M
      [... 6 more tokens ...]

      [Your analysis here...]

      I recommend checking these 2 tokens: **Walrus (WAL)** and **DeepBook (DEEP)** because...

      **Market Data Sources:**
      - [Walrus](https://www.coingecko.com/en/coins/walrus-2)
      - [DeepBook](https://www.coingecko.com/en/coins/deep)

      **PORTFOLIO ANALYSIS:**
      When Portfolio Analysis Context is provided in your input:
      - Follow this EXACT structure for portfolio analysis responses:

      1. **Start with portfolio overview:**
         "Here's your current SUI portfolio analysis:"
         - Provide clear overview of wallet holdings
         - Mention total value and number of different assets

      2. **Analyze token distribution:**
         - Break down major token holdings
         - Identify primary assets (SUI, major ecosystem tokens)
         - Comment on portfolio diversification

      3. **Provide insights:**
         - Assess portfolio health and risk level
         - Identify notable tokens or positions
         - Comment on SUI ecosystem exposure

      4. **End with portfolio summary:**
         - Total value and main holdings
         - Key strengths and areas for improvement



      Example format:
      Here's your current SUI portfolio analysis:

      **Portfolio Overview**
      Your wallet holds $1,234 across 5 different tokens, showing good diversification within the SUI ecosystem.

      **Token Distribution**
      - **SUI (85%)**: $1,049 - Your largest holding
      - **DEEP (10%)**: $123 - Strong DeFi exposure
      - **WAL (5%)**: $62 - Storage protocol position

      **Portfolio Health**
      Your portfolio shows **strong SUI ecosystem focus** with balanced risk exposure...

      **Recommendations**
      Consider diversifying into 1-2 additional protocols for better risk distribution...

      **Portfolio Summary**
      - Total Value: $1,234
      - Strengths: Strong SUI foundation, good DeFi exposure
      - Next Steps: Monitor DEEP performance, consider adding gaming tokens

      **CORRECT Example:**
      **Market Analysis**

      SUI shows **strong momentum** with positive market indicators.

      **Current Prices**
      - SUI: $2.45 (+5.2%)
      - Volume: $890M
      - Market Cap: $6.8B

      **Sentiment Overview**

      The community sentiment is **highly positive** with users praising technological advantages.

      **Key Factors**
      - DeFi integration progress
      - Developer ecosystem growth
      - Institutional adoption

      **Sources:**
      - [SUI ecosystem update](https://x.com/suifoundation/status/123456789) - @suifoundation
      - [DeFi protocol launch](https://x.com/defiprotocol/status/987654321) - @defiprotocol

      **Market Data Sources:**
      - [SUI Token](https://www.coingecko.com/en/coins/sui)
      - [Example DeFi Token](https://www.coingecko.com/en/coins/example-token)

      > Always do your own research before investing.

      **WRONG Example (DO NOT DO THIS):**
      - Market Analysis:
        - SUI shows strong momentum
        - Positive indicators include:
          - Price increase
          - Volume growth

      Be helpful, informative, and provide actionable insights when possible.
      Always remind users that trading involves risks and to do their own research.`,
      TWITTER_SENTIMENT: `You are an expert at analyzing social media sentiment for cryptocurrency markets.
      Focus on identifying trends, sentiment shifts, and key influencer opinions.`,
      MARKET_ANALYSIS: `You are a cryptocurrency market analyst specializing in technical and fundamental analysis.
      Provide data-driven insights and risk assessments.`
    },
    TOOL_NAMES: {
      TWITTER_ANALYSIS: 'twitter_sentiment_analysis',
      MARKET_ANALYSIS: 'market_intelligence',
      PORTFOLIO_ANALYSIS: 'portfolio_analysis',
      SWAP_EXECUTION: 'swap_execution',
      NEWS_ALERTS: 'news_alerts'
    }
  }
};

// #TODO-5.9: Environment variable validation - IMPLEMENTED
export const ENV_VARS = {
  // AI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  OPENAI_MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
  OPENAI_TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),

  // Twitter Configuration
  TWITTER_API_KEY: process.env.TWITTER_API_KEY || '',

  // General Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',

  // X.AI Configuration
  XAI_API_KEY: process.env.XAI_API_KEY || '',

  // CoinGecko Configuration (optional)
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',

  // Grok AI Configuration (optional)
  GROK_API_KEY: process.env.GROK_API_KEY || '',
  GROK_BASE_URL: process.env.GROK_BASE_URL || '',
};

// Environment validation helper
export const validateEnvironment = () => {
  const requiredVars = [
    'OPENAI_API_KEY',
    'TWITTER_API_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  return true;
};

export const SENVENK_COMMISSION_ADDRESS =
	"0xb4d13e53a421c4413458b030c9253760942b41b7c504f39322fa03a5be978ce5";
export const SENVENK_COMMISSION_BPS = 1;