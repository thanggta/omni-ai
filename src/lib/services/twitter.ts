// #TODO-11: ✅ Set up Twitter API integration (twitterapi.io)

import { API_CONFIG, APP_CONSTANTS } from '../config';
import type { TwitterPost, TwitterSearchResponse, APIResponse } from '../../types';

// #TODO-11.1: ✅ Twitter API client setup
export class TwitterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private lastFetchTime: number = 0;
  private cache: Map<string, { data: TwitterPost[]; timestamp: number }> = new Map();

  constructor() {
    this.apiKey = API_CONFIG.TWITTER_API.API_KEY;
    this.baseUrl = API_CONFIG.TWITTER_API.BASE_URL;

    if (!this.apiKey) {
      console.warn('Twitter API key not found. Please set TWITTER_API_KEY in environment variables.');
    }
  }

  // #TODO-11.2: ✅ Fetch trending SUI posts
  async fetchTrendingPosts(maxResults: number = 20): Promise<APIResponse<TwitterPost[]>> {
    try {
      const cacheKey = `trending_${maxResults}`;
      const cached = this.cache.get(cacheKey);

      // Check cache (30 minutes)
      if (cached && Date.now() - cached.timestamp < APP_CONSTANTS.REFRESH_INTERVALS.TWITTER_TRENDING) {
        return {
          success: true,
          data: cached.data,
          timestamp: new Date()
        };
      }

      const query = 'SUI trending OR $SUI OR "SUI blockchain" OR "SUI network"';
      const url = `${this.baseUrl}${API_CONFIG.TWITTER_API.ENDPOINTS.ADVANCED_SEARCH}?queryType=Top&query=${encodeURIComponent(query)}&max_results=${maxResults}`;

      const options = {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
      }

      const data: TwitterSearchResponse = await response.json();

      if (!data.tweets || !Array.isArray(data.tweets)) {
        throw new Error('Invalid response format from Twitter API');
      }

      // Rank and filter content
      const rankedPosts = this.rankContent(data.tweets);

      // Cache the results
      this.cache.set(cacheKey, {
        data: rankedPosts,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: rankedPosts,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error fetching trending posts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  // #TODO-11.3: ✅ Monitor real-time content
  async monitorRealTimeContent(): Promise<APIResponse<TwitterPost[]>> {
    try {
      // Prevent too frequent calls (1 minute minimum)
      const now = Date.now();
      if (now - this.lastFetchTime < APP_CONSTANTS.REFRESH_INTERVALS.TWITTER_REALTIME) {
        const cached = this.cache.get('realtime');
        if (cached) {
          return {
            success: true,
            data: cached.data,
            timestamp: new Date()
          };
        }
      }

      const query = 'SUI OR $SUI -is:retweet';
      const url = `${this.baseUrl}${API_CONFIG.TWITTER_API.ENDPOINTS.ADVANCED_SEARCH}?queryType=Top&query=${encodeURIComponent(query)}&max_results=10`;

      const options = {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
      }

      const data: TwitterSearchResponse = await response.json();

      if (!data.tweets || !Array.isArray(data.tweets)) {
        return {
          success: true,
          data: [],
          timestamp: new Date()
        };
      }

      // Filter for high-engagement content
      const filteredPosts = data.tweets.filter((post: TwitterPost) =>
        post.likeCount > 5 ||
        post.retweetCount > 2 ||
        post.author.verified ||
        post.author.followers_count > 1000
      );

      this.lastFetchTime = now;
      this.cache.set('realtime', {
        data: filteredPosts,
        timestamp: now
      });

      return {
        success: true,
        data: filteredPosts,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error monitoring real-time content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  // #TODO-11.4: ✅ Content ranking algorithm
  private rankContent(posts: TwitterPost[]): TwitterPost[] {
    return posts
      .map(post => ({
        ...post,
        engagementScore: this.calculateEngagementScore(post)
      }))
      .sort((a, b) => (b as any).engagementScore - (a as any).engagementScore)
      .slice(0, 20); // Top 20 posts
  }

  private calculateEngagementScore(post: TwitterPost): number {
    const authorScore = post.author.verified ? 2 : 1;
    const followerBonus = Math.min(post.author.followers_count / 10000, 5); // Max 5 bonus points

    return (
      post.likeCount * 1 +
      post.retweetCount * 3 +
      post.replyCount * 2 +
      post.quoteCount * 2 +
      post.viewCount * 0.1 // Views are less valuable but still count
    ) * authorScore + followerBonus;
  }

  // #TODO-11.5: ✅ Additional utility methods
  async searchPosts(query: string, maxResults: number = 10): Promise<APIResponse<TwitterPost[]>> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.TWITTER_API.ENDPOINTS.ADVANCED_SEARCH}?queryType=Top&query=${encodeURIComponent(query)}&max_results=${maxResults}`;

      const options = {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
      }

      const data: TwitterSearchResponse = await response.json();

      return {
        success: true,
        data: data.tweets || [],
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error searching posts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
    this.lastFetchTime = 0;
  }
}

// #TODO-11.5: ✅ Export Twitter service instance
export const twitterService = new TwitterService();
