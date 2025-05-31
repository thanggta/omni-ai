// #TODO-5: Define core TypeScript types for the application

// #TODO-5.1: ✅ Define Twitter-related types (Updated for twitterapi.io)
export interface TwitterPost {
  type: 'tweet';
  id: string;
  url: string;
  twitterUrl: string;
  text: string;
  source: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount: number;
  createdAt: string;
  lang: string;
  bookmarkCount: number;
  isReply: boolean;
  inReplyToId: string | null;
  conversationId: string;
  inReplyToUserId: string | null;
  inReplyToUsername: string | null;
  author: TwitterAuthor;
  extendedEntities: any;
  card: any;
  place: any;
  entities: any;
  quoted_tweet: any;
  retweeted_tweet: any;
}

export interface TwitterAuthor {
  id: string;
  username: string;
  name: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  created_at: string;
  description: string;
  location: string;
  profile_image_url: string;
  profile_banner_url?: string;
  url?: string;
  protected: boolean;
}

export interface TwitterSentiment {
  score: number; // -1 to 1 (negative to positive)
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
}

export interface TwitterSearchResponse {
  tweets: TwitterPost[];
  has_next_page: boolean;
  next_cursor?: string;
}

// #TODO-5.2: Define market data types - IMPLEMENTED
export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
  platform?: {
    id: string;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  };
}

export interface CoinGeckoMarketResponse {
  data: TokenData[];
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
}

export interface MarketAnalysis {
  summary: string;
  trending_tokens: TokenData[];
  market_sentiment: 'bullish' | 'bearish' | 'neutral';
  key_insights: string[];
  risk_assessment: 'low' | 'medium' | 'high';
  opportunities: string[];
  timestamp: Date;
  data_sources: {
    coingecko_url: string;
    analysis_model: string;
  };
}

// #TODO-5.3: Define AI and chat types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

export interface AIResponse {
  content: string;
  type: 'twitter_sentiment' | 'market_intelligence' | 'general_insight';
  metadata?: {
    sources?: string[];
    confidence?: number;
    timestamp?: Date;
  };
}

// #TODO-5.4: Define alert and notification types - IMPLEMENTED
export interface AlertData {
  id: string;
  type: 'breaking_news' | 'price_alert' | 'opportunity' | 'risk_alert' | 'community_insight';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  summary: string;
  url?: string;
  timestamp: Date;
  twitterPost?: TwitterPost;
  aiAnalysis: string;
  relevanceScore: number;
}

export interface AlertResponse {
  success: boolean;
  alerts: AlertData[];
  timestamp: Date;
  error?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  categories: {
    breaking_news: boolean;
    price_alert: boolean;
    opportunity: boolean;
    risk_alert: boolean;
    community_insight: boolean;
  };
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';
}

// #TODO-5.5: Define SUI blockchain types
export interface WalletConnection {
  // TODO: Define wallet connection structure
}

export interface SwapTransaction {
  // TODO: Define swap transaction structure
}

// #TODO-5.6: Define API response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: Date;
}
