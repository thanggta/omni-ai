// #TODO-16.8: Streaming chat API endpoint - IMPLEMENTED

import { NextRequest } from 'next/server';
import { openAIService } from '@/src/lib/services/ai';

// #TODO-16.8.1: Streaming chat endpoint
export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [], walletAddress } = await request.json();

    // #TODO-16.8.2: Validate request
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // #TODO-16.8.3: Check AI service configuration
    if (!openAIService.isConfigured()) {
      return new Response(
        JSON.stringify({ 
          error: 'AI service is not properly configured. Please check the OpenAI API key.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // #TODO-16.8.4: Set up Server-Sent Events stream
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`)
        );

        // Process streaming chat message
        openAIService.processChatMessageStream(
          message,
          conversationHistory,
          {
            walletAddress, // Pass wallet address to AI service
            onStart: () => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`)
              );
            },
            onToken: (token: string) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'token',
                  content: token
                })}\n\n`)
              );
            },
            onEnd: () => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'end' })}\n\n`)
              );
              controller.close();
            },
            onError: (error: Error) => {
              console.error('Streaming error in callback:', error);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'error',
                  error: error.message
                })}\n\n`)
              );
              controller.close();
            }
          }
        ).catch((error) => {
          console.error('Streaming promise error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: 'Internal streaming error'
            })}\n\n`)
          );
          controller.close();
        });
      },
      cancel() {
        // Cleanup on stream cancel
      }
    });

    // #TODO-16.8.5: Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat streaming endpoint error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// #TODO-16.8.6: Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
