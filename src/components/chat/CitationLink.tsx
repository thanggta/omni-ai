// Citation link component for displaying source links in chat messages

'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface CitationLinkProps {
  href: string;
  children: React.ReactNode;
  index?: number;
}

export function CitationLink({ href, children, index }: CitationLinkProps) {
  return (
    <Badge 
      variant="outline" 
      className="inline-flex items-center gap-1 mx-1 my-0.5 px-2 py-1 text-xs hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
    >
      <ExternalLink className="w-3 h-3" />
      <span className="truncate max-w-[120px]">
        {typeof children === 'string' ? children : `Source ${index || ''}`}
      </span>
    </Badge>
  );
}

// Helper function to detect and extract citation links from text
export function extractCitations(text: string): Array<{
  text: string;
  url: string;
  title: string;
}> {
  // Regex to match markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const citations: Array<{ text: string; url: string; title: string }> = [];
  
  let match;
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    const [fullMatch, title, url] = match;
    
    // Check if this looks like a citation (contains x.com, twitter.com, or other social media)
    if (url.includes('x.com') || url.includes('twitter.com') || url.includes('status/')) {
      citations.push({
        text: fullMatch,
        url: url,
        title: title
      });
    }
  }
  
  return citations;
}

// Helper function to replace citations in text with citation components
export function replaceCitationsWithComponents(
  text: string, 
  onCitationClick?: (url: string) => void
): React.ReactNode[] {
  const citations = extractCitations(text);
  
  if (citations.length === 0) {
    return [text];
  }
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  citations.forEach((citation, index) => {
    const citationIndex = text.indexOf(citation.text, lastIndex);
    
    // Add text before citation
    if (citationIndex > lastIndex) {
      parts.push(text.substring(lastIndex, citationIndex));
    }
    
    // Add citation component
    parts.push(
      <CitationLink 
        key={`citation-${index}`}
        href={citation.url}
        index={index + 1}
      >
        {citation.title}
      </CitationLink>
    );
    
    lastIndex = citationIndex + citation.text.length;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts;
}
