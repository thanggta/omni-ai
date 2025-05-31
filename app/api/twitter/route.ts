// #TODO-11: ✅ Twitter API integration endpoint

import { NextRequest, NextResponse } from 'next/server';
import { twitterService } from '../../../src/lib/services/twitter';

// #TODO-11.1: ✅ Twitter data fetching API route handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'trending';
    const maxResults = parseInt(searchParams.get('maxResults') || '20');
    const query = searchParams.get('query');

    let result;

    switch (action) {
      case 'trending':
        // #TODO-11.2: ✅ Fetch trending SUI posts
        result = await twitterService.fetchTrendingPosts(maxResults);
        break;

      case 'realtime':
        // #TODO-11.3: ✅ Monitor real-time content
        result = await twitterService.monitorRealTimeContent();
        break;

      case 'search':
        // #TODO-11.5: ✅ Search specific posts
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter is required for search action' },
            { status: 400 }
          );
        }
        result = await twitterService.searchPosts(query, maxResults);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: trending, realtime, or search' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Twitter API request failed' },
        { status: 500 }
      );
    }

    // #TODO-11.4: ✅ Return formatted response
    return NextResponse.json({
      success: true,
      action,
      data: result.data,
      count: result.data?.length || 0,
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('Twitter API endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// #TODO-11.6: ✅ Cache management and utilities
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'healthCheck':
        // Check if Twitter API is accessible
        const testResult = await twitterService.searchPosts('test', 1);
        return NextResponse.json({
          success: testResult.success,
          message: testResult.success ? 'Twitter API is accessible' : 'Twitter API is not accessible',
          error: testResult.error
        });

      case 'realTimeStatus':
        // Check real-time status (no cache, always fresh)
        return NextResponse.json({
          success: true,
          message: 'Twitter service is running in real-time mode (no caching)',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: healthCheck or realTimeStatus' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Twitter POST endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
