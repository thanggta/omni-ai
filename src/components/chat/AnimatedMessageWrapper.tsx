// Component to handle animation isolation for messages
'use client';

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedMessageWrapperProps {
  messageId: string;
  children: React.ReactNode;
  animationClass?: string;
  animationDuration?: number;
}

// Global set to track animated messages
const animatedMessageIds = new Set<string>();

export function AnimatedMessageWrapper({ 
  messageId, 
  children, 
  animationClass = '',
  animationDuration = 500 
}: AnimatedMessageWrapperProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only animate if this message hasn't been animated before
    if (!animatedMessageIds.has(messageId)) {
      animatedMessageIds.add(messageId);
      setShouldAnimate(true);
      
      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, animationDuration);
      
      return () => clearTimeout(timer);
    }
  }, [messageId, animationDuration]);

  return (
    <div 
      ref={wrapperRef}
      className={shouldAnimate ? animationClass : ''}
    >
      {children}
    </div>
  );
}

// Utility function to clean up animation classes from HTML content
export function removeAnimationClasses(htmlContent: string): string {
  return htmlContent
    .replace(/animate-slide-in-left/g, '')
    .replace(/animate-slide-in-right/g, '')
    .replace(/animate-vibrate/g, '')
    .replace(/animate-fade-in/g, '')
    .replace(/animate-slide-up/g, '')
    .replace(/class="(\s*)"/g, '') // Remove empty class attributes
    .replace(/class="\s+/g, 'class="') // Clean up extra spaces
    .replace(/\s+class=""/g, ''); // Remove empty class attributes with spaces
}
