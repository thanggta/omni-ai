// #TODO-11: ✅ Set up Twitter API integration (twitterapi.io)

import { API_CONFIG } from '../config';
import type { TwitterPost, TwitterSearchResponse, APIResponse } from '../../types';

// #TODO-11.1: ✅ Twitter API client setup
export class TwitterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = API_CONFIG.TWITTER_API.API_KEY;
    this.baseUrl = API_CONFIG.TWITTER_API.BASE_URL;

    if (!this.apiKey) {
      console.warn('Twitter API key not found. Please set TWITTER_API_KEY in environment variables.');
    }
  }

  // #TODO-11.2: ✅ Fetch trending SUI posts - REAL-TIME (NO CACHE)
  async fetchTrendingPosts(maxResults: number = 20): Promise<APIResponse<TwitterPost[]>> {
    try {
      console.log(`🔄 Fetching real-time trending posts (max: ${maxResults})...`);

      const query = 'SUI urgent';
      const url = `${this.baseUrl}${API_CONFIG.TWITTER_API.ENDPOINTS.ADVANCED_SEARCH}?queryType=Top&query=${query}&max_results=${maxResults}`;

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

      // Pass all raw data to AI for intelligent analysis
      console.log(`✅ Fetched ${data.tweets.length} real-time trending posts (raw data for AI)`);

      return {
        success: true,
        data: data.tweets,
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

  // #TODO-11.3: ✅ Monitor real-time content - REAL-TIME (NO CACHE)
  async monitorRealTimeContent(): Promise<APIResponse<TwitterPost[]>> {
    try {
      console.log('🔄 Monitoring real-time SUI content...');

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

      console.log(`✅ Found ${data.tweets.length} real-time posts`);

      return {
        success: true,
        data: data.tweets,
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

  // #TODO-11.4: ✅ Raw data processing - let AI handle ranking and filtering

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

}

// #TODO-11.5: ✅ Export Twitter service instance
export const twitterService = new TwitterService();
