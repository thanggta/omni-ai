// #TODO-16: Implement AI chat API endpoint (FOCUS: 3 core features only) - IMPLEMENTED

import { NextRequest, NextResponse } from 'next/server';
import { openAIService } from '@/src/lib/services/ai';

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// #TODO-16.1: Chat API route handler (simplified for 3 core features) - IMPLEMENTED
export async function POST(request: NextRequest) {
  try {
    // #TODO-16.2: Parse request body - IMPLEMENTED
    const body: ChatRequest = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // #TODO-16.3: Determine intent and route to appropriate service - SIMPLIFIED
    // For now, we'll use general chat for all messages
    // TODO: Later implement intent detection for:
    // 1. Twitter sentiment analysis (keywords: "sentiment", "twitter", "social")
    // 2. Market intelligence (keywords: "market", "price", "token", "analysis")
    // 3. General SUI insights (default fallback)

    // #TODO-16.4: Process with appropriate AI service - IMPLEMENTED
    if (!openAIService.isConfigured()) {
      return NextResponse.json({
        message: 'I apologize, but the AI service is not properly configured. Please check the OpenAI API key.',
        type: 'error',
        timestamp: new Date().toISOString()
      });
    }

    // Convert conversation history to the format expected by OpenAI service
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const aiResponse = await openAIService.processChatMessage(message, formattedHistory);

    // #TODO-16.5: Format response for chat interface - IMPLEMENTED
    return NextResponse.json({
      message: aiResponse,
      type: 'general',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // #TODO-16.6: Error handling - IMPLEMENTED
    console.error('Chat API error:', error);

    return NextResponse.json({
      message: 'I apologize, but I encountered an error processing your message. Please try again.',
      type: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
