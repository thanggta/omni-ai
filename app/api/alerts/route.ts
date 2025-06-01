// #TODO-24: Alert detection API endpoint - IMPLEMENTED

import { NextRequest, NextResponse } from 'next/server';
import { twitterService } from '../../../src/lib/services/twitter';
import { API_CONFIG } from '../../../src/lib/config';
import { AlertData, AlertResponse, TwitterPost } from '../../../src/types';

// #TODO-24.1: Alert detection system prompt for OpenAI
const ALERT_DETECTION_PROMPT = `You are an expert cryptocurrency alert system analyzing ALL RAW Twitter posts for SUI ecosystem.

You will receive UNFILTERED Twitter data. Your job is to intelligently:
1. FILTER through all posts to find SUI-relevant content
2. RANK posts by trading importance and market impact
3. ANALYZE content quality, credibility, and actionability
4. DETERMINE which posts warrant user alerts

INTELLIGENT FILTERING (you decide what's relevant):
- SUI ecosystem content (direct mentions, indirect implications)
- Urgent alerts for trading and investing
- Trading/investment signals and opportunities
- Market-moving announcements and news
- Technical developments and protocol updates
- Price movements, predictions, and analysis

SMART RANKING FACTORS (you evaluate):
- Information actionability for traders
- Content uniqueness and exclusivity
- Market impact potential and timing

ALERT CATEGORIES:
- breaking_news: Major protocol updates, partnerships, listings, market-moving announcements
- price_alert: Significant price movements, technical analysis, trading signals
- opportunity: Investment opportunities, new projects, airdrops, yield farming
- risk_alert: Security issues, rugpulls, market manipulation warnings, regulatory concerns
- community_insight: Viral content, influential trader commentary, sentiment shifts
- urgent_alert: Urgent alerts for trading and investing

SEVERITY LEVELS:
- critical: Immediate action required, major market impact
- high: Important information, significant impact
- medium: Notable information, moderate impact
- low: Interesting but minor impact

RELEVANCE SCORING (1-100):
- 90-100: Must-know information, immediate trading impact
- 70-89: Important updates, significant market relevance
- 50-69: Notable information, moderate trading value
- 30-49: Interesting content, minor market impact
- Below 50: Filter out, not relevant enough

ONLY return posts that score 50+ and are truly valuable to SUI traders/investors.
Return ONLY a JSON array of alerts. If no posts meet the criteria, return an empty array.

Format:
[
  {
    "type": "breaking_news|price_alert|opportunity|risk_alert|community_insight",
    "severity": "critical|high|medium|low",
    "title": "Brief, compelling title (max 60 chars)",
    "description": "Detailed explanation (max 200 chars)",
    "summary": "Key takeaway for traders (max 100 chars)",
    "aiAnalysis": "Your analysis of why this is important (max 300 chars)",
    "relevanceScore": 85,
    "postId": "twitter_post_id"
  }
]`;

// #TODO-24.2: Main alert detection endpoint
export async function GET(request: NextRequest) {
  try {
    console.log('🚨 Starting alert detection...');

    // #TODO-24.3: Fetch ALL recent Twitter posts for AI analysis
    const twitterResult = await twitterService.fetchTrendingPosts(20); // Get more posts for AI to analyze

    if (!twitterResult.success || !twitterResult.data) {
      return NextResponse.json({
        success: false,
        alerts: [],
        timestamp: new Date(),
        error: 'Failed to fetch Twitter data'
      } as AlertResponse);
    }

    const posts = twitterResult.data;
    console.log(`📊 Fetched ${posts.length} raw Twitter posts for AI analysis...`);

    // #TODO-24.4: Filter posts from last 1 hour (let AI handle further filtering)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentPosts = posts.filter((post: TwitterPost) => {
      const postDate = new Date(post.createdAt);
      return postDate > oneHourAgo;
    });

    console.log(`⏰ Found ${recentPosts.length} posts from last hour for AI analysis`);

    if (recentPosts.length === 0) {
      return NextResponse.json({
        success: true,
        alerts: [],
        timestamp: new Date(),
      } as AlertResponse);
    }

    // #TODO-24.5: Prepare posts data for AI analysis
    const postsForAnalysis = recentPosts.map((post: TwitterPost) => ({
      id: post.id,
      text: post.text,
      author: {
        username: post.author.username,
        name: post.author.name,
        verified: post.author.verified,
        followers: post.author.followers_count
      },
      engagement: {
        likes: post.likeCount,
        retweets: post.retweetCount,
        replies: post.replyCount,
        views: post.viewCount
      },
      createdAt: post.createdAt,
      url: post.url
    }));

    // #TODO-24.6: Call OpenAI for alert detection (separate from LangChain)
    // Check if OpenAI API key is available
    if (!API_CONFIG.OPENAI_API.API_KEY) {
      console.warn('OpenAI API key not configured, using development fallback');

      // Development fallback: Create mock alerts for testing
      if (recentPosts.length > 0 && process.env.NODE_ENV === 'development') {
        const mockAlert: AlertData = {
          id: `mock_${recentPosts[0]?.id || 'dev'}_${Date.now()}`,
          type: 'community_insight',
          severity: 'medium',
          title: 'Mock Alert: SUI Community Activity',
          description: 'This is a mock alert generated for testing purposes when OpenAI API is not configured.',
          summary: 'Development mode alert to test the system functionality.',
          url: recentPosts[0]?.url,
          timestamp: new Date(),
          twitterPost: recentPosts[0],
          aiAnalysis: 'This is a mock AI analysis for development testing. In production, this would contain real AI insights about the Twitter post relevance and implications.',
          relevanceScore: 75
        };

        return NextResponse.json({
          success: true,
          alerts: [mockAlert],
          timestamp: new Date(),
        } as AlertResponse);
      }

      return NextResponse.json({
        success: true,
        alerts: [],
        timestamp: new Date(),
      } as AlertResponse);
    }

    // Use a more accessible model and add better error handling
    const modelToUse = API_CONFIG.OPENAI_API.MODELS.CHAT; // Use gpt-3.5-turbo instead of gpt-4

    const openAIResponse = await fetch(`${API_CONFIG.OPENAI_API.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.OPENAI_API.API_KEY}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: ALERT_DETECTION_PROMPT
          },
          {
            role: 'user',
            content: `Analyze these RAW, UNFILTERED Twitter posts. Apply your intelligent filtering and ranking to identify important SUI alerts:\n\nTotal posts to analyze: ${postsForAnalysis.length}\n\n${JSON.stringify(postsForAnalysis, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
      // Return empty alerts instead of failing completely
      return NextResponse.json({
        success: true,
        alerts: [],
        timestamp: new Date(),
        error: `OpenAI API error: ${openAIResponse.status}. Check API key and model access.`
      } as AlertResponse);
    }

    const aiResult = await openAIResponse.json();
    const aiContent = aiResult.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from OpenAI');
    }

    // #TODO-24.7: Parse AI response and create alert objects
    let alertsFromAI: any[] = [];
    try {
      alertsFromAI = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({
        success: true,
        alerts: [],
        timestamp: new Date(),
      } as AlertResponse);
    }

    // #TODO-24.8: Transform AI alerts to AlertData format with deterministic IDs
    const alerts: AlertData[] = alertsFromAI.map((alert: any, index: number) => {
      const relatedPost = recentPosts.find((post: TwitterPost) => post.id === alert.postId);

      // Generate deterministic ID based on content hash (no timestamp for deduplication)
      const contentForId = `${alert.title}_${alert.type}_${alert.summary}_${relatedPost?.id || 'no_post'}`;
      const contentHash = Buffer.from(contentForId.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      const alertId = `alert_${contentHash}`;

      console.log(`🔍 Generated alert ID: ${alertId} for content: "${alert.title}"`);

      return {
        id: alertId,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        summary: alert.summary,
        url: relatedPost?.url,
        timestamp: new Date(),
        twitterPost: relatedPost,
        aiAnalysis: alert.aiAnalysis,
        relevanceScore: alert.relevanceScore
      } as AlertData;
    });

    console.log(`✅ Generated ${alerts.length} alerts`);

    return NextResponse.json({
      success: true,
      alerts,
      timestamp: new Date(),
    } as AlertResponse);

  } catch (error) {
    console.error('Alert detection error:', error);
    return NextResponse.json({
      success: false,
      alerts: [],
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as AlertResponse, { status: 500 });
  }
}

// #TODO-24.9: Health check endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'healthCheck') {
      // Test Twitter API connectivity
      const twitterTest = await twitterService.searchPosts('SUI', 1);
      
      return NextResponse.json({
        success: true,
        message: 'Alert system is operational',
        services: {
          twitter: twitterTest.success,
          openai: !!API_CONFIG.OPENAI_API.API_KEY
        },
        timestamp: new Date()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Alert health check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Health check failed'
    }, { status: 500 });
  }
}
