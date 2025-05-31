// Test page for Portfolio UI component
'use client';

import React from 'react';
import { PortfolioUI } from '@/src/components/portfolio/PortfolioUI';

export default function TestPortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portfolio UI Test Page
          </h1>
          <p className="text-gray-600">
            Testing the beautiful Portfolio UI component with mock data
          </p>
        </div>
        
        <PortfolioUI />
      </div>
    </div>
  );
}
