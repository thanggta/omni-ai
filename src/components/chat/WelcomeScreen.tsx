// #TODO-7: Welcome screen component - Simplified without quick starters (now in fixed prompt templates)

'use client';

import React from 'react';
import Image from 'next/image';

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow space-y-6 px-4">
      <div className="text-center space-y-6 relative z-10">
        <div className="space-y-4">
          {/* Logo with glow effect */}
          <div className="flex justify-center relative">
            <div className="absolute inset-0 rounded-full blur-2xl animate-pulse-slow"></div>
            <Image
              src="/logo.png"
              alt="Omni Logo"
              width={200}
              height={200}
              className="rounded-lg relative z-10"
              priority
            />
          </div>

          {/* Title and taglines with cyberpunk styling */}
          <div className="space-y-4 -mt-12">
            <p className="text-2xl text-gray-300 font-medium">
              Your intelligent <span className="text-electric-cyan font-bold">SUI</span> companion
            </p>
            <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
              Navigate markets, optimize portfolios, and unlock SUI's potential—all in one conversation
              <span className="text-electric-cyan ml-2">⚡</span>
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Use the prompt templates below to get started, or ask me anything about SUI!
        </p>
      </div>
    </div>
  );
}
