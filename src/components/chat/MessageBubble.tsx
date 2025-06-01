// #TODO-7: Individual message bubble component for better reusability - UPDATED WITH MARKDOWN

'use client';

import React from 'react';
import { ChatMessage } from '@/src/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CitationLink } from './CitationLink';
import { cleanMessageContent } from '@/src/lib/utils/swap-action-parser';
import { cleanLPDepositMessageContent } from '@/src/lib/utils/lp-deposit-action-parser';
import { cleanPortfolioMessageContent, extractPortfolioUIData } from '@/src/lib/utils/portfolio-action-parser';
import { cleanTrendingTokensMessageContent, extractTrendingTokensUIData } from '@/src/lib/utils/trending-tokens-action-parser';
import { PortfolioUI } from '@/src/components/portfolio/PortfolioUI';
import { TrendingTokensUI } from '@/src/components/portfolio/TrendingTokensUI';
import { AnimatedMessageWrapper, removeAnimationClasses } from './AnimatedMessageWrapper';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  // Check if this message contains portfolio UI data
  const portfolioUIData = extractPortfolioUIData(message.content);

  // Check if this message contains trending tokens UI data
  const trendingTokensUIData = extractTrendingTokensUIData(message.content);

  // Clean message content to remove hidden action data
  let displayContent = message.content;
  if (message.role === 'assistant') {
    displayContent = cleanMessageContent(displayContent);
    displayContent = cleanLPDepositMessageContent(displayContent);
    displayContent = cleanPortfolioMessageContent(displayContent);
    displayContent = cleanTrendingTokensMessageContent(displayContent);
  }

  // Check if content contains HTML (for enhanced swap messages)
  const isHTMLContent = displayContent.includes('<div class="animate-');

  // Extract animation class from HTML content for wrapper
  let animationClass = '';
  if (isHTMLContent) {
    const slideInLeftMatch = displayContent.match(/animate-slide-in-left/);
    const slideInRightMatch = displayContent.match(/animate-slide-in-right/);

    if (slideInLeftMatch) animationClass = 'animate-slide-in-left';
    else if (slideInRightMatch) animationClass = 'animate-slide-in-right';

    // Remove animation classes from HTML content since wrapper will handle them
    displayContent = removeAnimationClasses(displayContent);
  }

  // If this message contains portfolio UI data, render only the portfolio component
  if (portfolioUIData) {
    return (
      <div className="flex justify-start w-full">
        <div className="w-full max-w-5xl">
          <PortfolioUI data={portfolioUIData.data} />
        </div>
      </div>
    );
  }

  // If this message contains trending tokens UI data, render only the trending tokens component
  if (trendingTokensUIData) {
    return (
      <div className="flex justify-start w-full">
        <div className="w-full max-w-6xl">
          <TrendingTokensUI
            data={trendingTokensUIData}
            title="SUI Ecosystem Trending Tokens"
          />
        </div>
      </div>
    );
  }

  const messageContent = (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'user' ? (
        // User Message - Purple/Magenta theme
        <div className="flex-1 max-w-3xl">
          <div className="bg-gradient-to-r from-darker-gray/80 to-darker-gray/60 backdrop-blur-sm p-5 rounded-2xl border border-vivid-purple/30 shadow-lg relative overflow-hidden group ml-auto">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-vivid-purple/5 to-magenta/5 opacity-70"></div>
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-vivid-purple to-magenta"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-vivid-purple opacity-10 rounded-full blur-xl"></div>

            {/* Message Content */}
            <p className="text-gray-100 relative z-10 leading-relaxed">{message.content}</p>
          </div>
        </div>
      ) : (
        // AI Message - Cyan/Blue theme
        <div className="flex-1">
          {isHTMLContent ? (
            // Render enhanced HTML content directly (already styled)
            <div
              className="chat-html"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          ) : (
            // Render normal AI message with default styling
            <div className="bg-gradient-to-r from-darker-gray/90 to-darker-gray/70 backdrop-blur-sm p-5 rounded-2xl border border-electric-cyan/30 shadow-lg relative overflow-hidden group">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan/5 to-neon-blue/5 opacity-70"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-electric-cyan to-neon-blue"></div>
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-electric-cyan opacity-10 rounded-full blur-xl"></div>

              {/* Message Header */}
              <div className="flex items-center mb-2">
                <div className="h-2 w-2 rounded-full bg-electric-cyan mr-2 animate-pulse"></div>
                <span className="text-electric-cyan font-bold text-sm tracking-wide">OMNI AI</span>
              </div>

              {/* Message Content */}
              <div className="text-sm relative z-10">
                <div className="chat-markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom styling for markdown elements with cyberpunk theme
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2 first:mt-0 text-electric-cyan">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2 first:mt-0 text-electric-cyan">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1 first:mt-0 text-electric-cyan">{children}</h3>,
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-100">{children}</p>,
                      strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc mb-2 space-y-1 pl-6 text-gray-100">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal mb-2 space-y-1 pl-6 text-gray-100">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-electric-cyan/50 pl-4 italic my-2 text-gray-200">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }) => {
                        // Check if this is a citation link (Twitter/X.com links)
                        const isCitation = href && (
                          href.includes('x.com') ||
                          href.includes('twitter.com') ||
                          href.includes('status/')
                        );

                        if (isCitation) {
                          return (
                            <CitationLink href={href || '#'}>
                              {children}
                            </CitationLink>
                          );
                        }

                        // Regular link
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-electric-cyan hover:text-neon-blue hover:underline transition-colors duration-200"
                          >
                            {children}
                          </a>
                        );
                      },
                      table: ({ children }) => (
                        <div className="overflow-x-auto mb-2">
                          <table className="min-w-full border border-gray-700">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-darker-gray">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="border border-gray-700 px-2 py-1 text-left font-semibold text-electric-cyan">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-gray-700 px-2 py-1 text-gray-100">
                          {children}
                        </td>
                      ),
                      hr: () => <hr className="border-gray-700 my-3" />,
                    }}
                  >
                    {displayContent}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Timestamp for AI messages */}
              <div className="mt-3 flex justify-start">
                <p className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Wrap with animation wrapper if needed
  if (animationClass) {
    return (
      <AnimatedMessageWrapper
        messageId={message.id}
        animationClass={animationClass}
        animationDuration={500}
      >
        {messageContent}
      </AnimatedMessageWrapper>
    );
  }

  return messageContent;
}
