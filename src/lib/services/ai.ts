// #TODO-13: Create OpenAI/Grok AI service integration - UPDATED TO USE LANGGRAPH

import { langGraphAgent, StreamingCallback } from '@/src/lib/langchain/langgraph-agent';
import { API_CONFIG, ENV_VARS, validateEnvironment } from '@/src/lib/config';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// #TODO-13.1: OpenAI service setup - IMPLEMENTED WITH LANGCHAIN
export class OpenAIService {
  constructor() {
    // Validate environment configuration
    if (!validateEnvironment()) {
      console.warn('Some required environment variables are missing. Please check your .env.local file.');
    }

    // Log current configuration (without sensitive data)
    if (ENV_VARS.NODE_ENV === 'development') {
      console.log('OpenAI Configuration:', {
        model: ENV_VARS.OPENAI_MODEL,
        maxTokens: ENV_VARS.OPENAI_MAX_TOKENS,
        temperature: ENV_VARS.OPENAI_TEMPERATURE,
        hasApiKey: !!ENV_VARS.OPENAI_API_KEY
      });
    }
  }

  // #TODO-13.4: Chat interaction - IMPLEMENTED WITH LANGCHAIN
  async processChatMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      // Convert ChatMessage format to the format expected by aiOrchestrator
      const formattedHistory = conversationHistory
        .filter(msg => msg.role !== 'system') // Remove system messages as they're handled by the orchestrator
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Use LangGraph ReactAgent instead of raw OpenAI API
      const response = await langGraphAgent.processUserRequest(message, formattedHistory);
      return response;
    } catch (error) {
      console.error('Error processing chat message:', error);
      return 'I apologize, but I encountered an error processing your message. Please try again.';
    }
  }

  // #TODO-13.4.1: Chat interaction with streaming - IMPLEMENTED WITH LANGCHAIN
  async processChatMessageStream(
    message: string,
    conversationHistory: ChatMessage[] = [],
    callbacks?: StreamingCallback
  ): Promise<void> {
    try {
      // Convert ChatMessage format to the format expected by aiOrchestrator
      const formattedHistory = conversationHistory
        .filter(msg => msg.role !== 'system') // Remove system messages as they're handled by the orchestrator
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Use LangGraph ReactAgent for streaming processing
      await langGraphAgent.processUserRequestStream(message, formattedHistory, callbacks);
    } catch (error) {
      console.error('Error processing streaming chat message:', error);
      callbacks?.onError?.(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  // Legacy method - kept for backward compatibility but now uses LangChain internally
  private async createChatCompletion(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<ChatCompletionResponse> {
    // Convert to the format expected by processChatMessage and use LangChain
    const userMessage = messages[messages.length - 1]?.content || '';
    const conversationHistory = messages.slice(0, -1);

    const response = await this.processChatMessage(userMessage, conversationHistory);

    return {
      content: response,
      usage: undefined // Usage tracking not implemented with LangChain wrapper
    };
  }

  // #TODO-13.2: Market analysis with GPT-4
  async analyzeMarketData(data: any) {
    // TODO: Implement market analysis using OpenAI GPT-4
    // - Multi-factor analysis combining price, volume, and social data
    // - Generate risk assessments and opportunity alerts
  }

  // #TODO-13.3: Generate recommendations
  async generateRecommendations(context: any) {
    // TODO: Implement AI-powered recommendation generation
  }

  // Helper method to check if service is configured
  isConfigured(): boolean {
    return langGraphAgent.isConfigured();
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();

// #TODO-13.5: Grok AI service setup
export class GrokAIService {
  // TODO: Initialize Grok AI client
  
  // #TODO-13.6: Twitter sentiment analysis
  async analyzeSentiment(posts: any[]) {
    // TODO: Implement Twitter sentiment analysis using Grok AI
    // - Send aggregated content to Grok AI API for sentiment and trend analysis
    // - Generate daily digest with key insights and sentiment score
  }
  
  // #TODO-13.7: Content classification
  async classifyContent(content: any) {
    // TODO: Implement AI-powered content classification for urgency and relevance
  }
}
