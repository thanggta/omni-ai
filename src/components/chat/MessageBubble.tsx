// #TODO-7: Individual message bubble component for better reusability - UPDATED WITH MARKDOWN

'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import { ChatMessage } from '@/src/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CitationLink } from './CitationLink';
import { cleanMessageContent } from '@/src/lib/utils/swap-action-parser';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  // Clean message content to remove hidden swap action data
  const displayContent = message.role === 'assistant' ? cleanMessageContent(message.content) : message.content;

  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <Card className={`max-w-[80%] p-4 ${
        message.role === 'user'
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted'
      }`}>
        <div className="space-y-2">
          {/* Render message content with markdown support */}
          <div className="text-sm">
            {message.role === 'assistant' ? (
              <div className="chat-markdown">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for markdown elements
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold mb-1 first:mt-0">{children}</h3>,
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc mb-2 space-y-1 pl-6">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal mb-2 space-y-1 pl-6">{children}</ol>,
                    li: ({ children }) => <li className="text-sm ml-0 pl-1">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-2 text-muted-foreground">
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
                          className="text-primary hover:underline"
                        >
                          {children}
                        </a>
                      );
                    },
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-2">
                        <table className="min-w-full border-collapse border border-border text-xs">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-border px-2 py-1 bg-muted font-semibold text-left">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-border px-2 py-1">
                        {children}
                      </td>
                    ),
                    hr: () => <hr className="border-border my-3" />,
                  }}
                >
                  {displayContent}
                </ReactMarkdown>
              </div>
            ) : (
              // User messages don't need markdown rendering
              <p className="leading-relaxed">{message.content}</p>
            )}
          </div>

          {/* Citations section for assistant messages */}
          {/* {citations.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground mb-2">Sources:</p>
              <div className="flex flex-wrap gap-1">
                {citations.map((citation, index) => (
                  <CitationLink
                    key={index}
                    href={citation.url}
                    index={index + 1}
                  >
                    {citation.title}
                  </CitationLink>
                ))}
              </div>
            </div>
          )} */}

          {/* Timestamp */}
          <p className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </Card>
    </div>
  );
}
