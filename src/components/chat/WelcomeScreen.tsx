// #TODO-7: Welcome screen component - Simplified without quick starters (now in fixed prompt templates)

'use client';

import React from 'react';
import Image from 'next/image';

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 px-4 pt-16">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Omni Logo"
              width={200}
              height={200}
              className="rounded-lg"
              priority
            />
          </div>

          {/* Title and taglines */}
          <div className="space-y-3 -mt-16">
            <p className="text-xl text-muted-foreground font-medium">
              Your intelligent SUI companion
            </p>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Navigate markets, optimize portfolios, and unlock SUI's potential—all in one conversation ✨
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Use the prompt templates below to get started, or ask me anything about SUI!
        </p>
      </div>
    </div>
  );
}
