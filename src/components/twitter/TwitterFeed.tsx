'use client';

import { useState, useEffect } from 'react';
import type { TwitterPost } from '@/src/types';

// Example component showing how to use the Twitter API integration
export function TwitterFeed() {
  const [tweets, setTweets] = useState<TwitterPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTweets = async (action: 'trending' | 'realtime' = 'trending') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/twitter?action=${action}&maxResults=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tweets');
      }

      setTweets(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets('trending');
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">SUI Twitter Feed</h2>
        <div className="space-x-2">
          <button
            onClick={() => fetchTweets('trending')}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            Trending
          </button>
          <button
            onClick={() => fetchTweets('realtime')}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            Real-time
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tweets...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && tweets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No tweets found. Try refreshing or check your API configuration.
        </div>
      )}

      <div className="space-y-4">
        {tweets.map((tweet) => (
          <div key={tweet.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-blue-600">
                  @{tweet.author?.username || 'Unknown'}
                </span>
                {tweet.author?.verified && (
                  <span className="text-blue-500">✓</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(tweet.createdAt)}
              </div>
            </div>

            <div className="text-gray-800 mb-3 leading-relaxed">
              {tweet.text}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex space-x-4">
                <span className="flex items-center space-x-1">
                  <span>❤️</span>
                  <span>{tweet.likeCount}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>🔄</span>
                  <span>{tweet.retweetCount}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>💬</span>
                  <span>{tweet.replyCount}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>👁️</span>
                  <span>{tweet.viewCount}</span>
                </span>
              </div>
              <a
                href={tweet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                View on X →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
