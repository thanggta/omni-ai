// Trending Tokens UI Component - Clean design matching reference image and PortfolioUI style
'use client';

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { ChartDialog } from './ChartDialog';

// Token data interface
export interface TrendingToken {
  rank: number;
  id: string;
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  // #TODO-20.2: Add chart URLs for dialog functionality - UPDATED TO PRIORITIZE DEX SCREENER
  chartUrl?: string; // Primary chart URL (DEX Screener preferred)
  dexScreenerUrl?: string; // DEX Screener URL (same as chartUrl for consistency)
}

interface TrendingTokensUIProps {
  data?: TrendingToken[];
  title?: string;
}

// Mock trending tokens data
const mockTrendingTokens: TrendingToken[] = [
  {
    rank: 7,
    id: "usdc",
    symbol: "USDC",
    name: "USDC",
    icon: "💵",
    price: 0.9998,
    change1h: 0.0,
    change24h: 0.0,
    change7d: 0.0,
    volume24h: 4923095501,
    marketCap: 60940388487
  },
  {
    rank: 70,
    id: "fdusd",
    symbol: "FDUSD",
    name: "First Digital USD",
    icon: "🏦",
    price: 0.9995,
    change1h: 0.1,
    change24h: -0.2,
    change7d: 0.0,
    volume24h: 2456856551,
    marketCap: 1658147653
  },
  {
    rank: 14,
    id: "sui",
    symbol: "SUI",
    name: "Sui",
    icon: "🌊",
    price: 3.28,
    change1h: 0.8,
    change24h: 4.3,
    change7d: -9.6,
    volume24h: 834640433,
    marketCap: 10954019710
  },
  {
    rank: 946,
    id: "navx",
    symbol: "NAVX",
    name: "NAVI Protocol",
    icon: "🧭",
    price: 0.0506,
    change1h: 0.5,
    change24h: 0.0,
    change7d: -12.1,
    volume24h: 36169355,
    marketCap: 29151754
  },
  {
    rank: 406,
    id: "usdt-sui",
    symbol: "USDT",
    name: "Sui Bridged USDT (Sui)",
    icon: "💰",
    price: 1.00,
    change1h: 0.0,
    change24h: 0.0,
    change7d: 0.0,
    volume24h: 30462423,
    marketCap: 117907964
  },
  {
    rank: 465,
    id: "cetus",
    symbol: "CETUS",
    name: "Cetus Protocol",
    icon: "🐋",
    price: 0.1368,
    change1h: -0.1,
    change24h: 3.0,
    change7d: -14.3,
    volume24h: 27967780,
    marketCap: 99175807
  },
  {
    rank: 390,
    id: "ausd",
    symbol: "AUSD",
    name: "AUSD",
    icon: "💎",
    price: 0.9991,
    change1h: 0.0,
    change24h: -0.1,
    change7d: 0.2,
    volume24h: 26155835,
    marketCap: 124327611
  },
  {
    rank: 1036,
    id: "hippo",
    symbol: "HIPPO",
    name: "sudeng",
    icon: "🦛",
    price: 0.002474,
    change1h: 2.4,
    change24h: -3.8,
    change7d: -11.2,
    volume24h: 25533471,
    marketCap: 24645818
  },
  {
    rank: 133,
    id: "wal",
    symbol: "WAL",
    name: "Walrus",
    icon: "🦭",
    price: 0.5016,
    change1h: 0.9,
    change24h: 0.3,
    change7d: -6.8,
    volume24h: 21915587,
    marketCap: 659826545
  }
];

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(0)}M`;
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(0)}K`;
  }
  return `$${num.toFixed(2)}`;
};

// Format price with appropriate decimal places
const formatPrice = (price: number): string => {
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
};

export function TrendingTokensUI({
  data,
  title = "Trending Tokens"
}: TrendingTokensUIProps) {
  // Use provided data or fall back to mock data
  const tokens = data || mockTrendingTokens;
  console.log(tokens);
  
  // #TODO-20.5: Chart dialog state management - IMPLEMENTED
  const [selectedToken, setSelectedToken] = useState<TrendingToken | null>(null);
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);

  // Handle row click to open chart dialog
  const handleRowClick = (token: TrendingToken) => {
    // Only open chart if token has chart URLs
    if (token.chartUrl || token.dexScreenerUrl) {
      setSelectedToken(token);
      setIsChartDialogOpen(true);
    }
  };

  // Close chart dialog
  const handleCloseChart = () => {
    setIsChartDialogOpen(false);
    setSelectedToken(null);
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="text-sm text-muted-foreground">
            Real-time market data
          </div>
        </div>

        {/* Table */}
        <div className="space-y-1">
          {/* Table Header */}
          <div className="grid grid-cols-8 gap-4 px-4 py-4 text-xs font-bold text-gray-800 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm mb-2">
            <div className="col-span-2">Token</div>
            <div className="text-right">Price</div>
            <div className="text-right">1h</div>
            <div className="text-right">24h</div>
            <div className="text-right">7d</div>
            <div className="text-right">24h Volume</div>
            <div className="text-right">Market Cap</div>
          </div>

          {/* Table Rows */}
          {tokens.map((token) => {
            const hasChart = !!(token.chartUrl || token.dexScreenerUrl);
            return (
              <div
                key={token.id}
                className={`grid grid-cols-8 gap-4 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors ${
                  hasChart ? 'cursor-pointer' : ''
                }`}
                onClick={() => hasChart && handleRowClick(token)}
                title={hasChart ? 'Click to view chart' : undefined}
              >
                {/* Coin Info */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                      {/* Check for actual image URLs first */}
                      {token.icon && (token.icon.startsWith('data:image') || token.icon.startsWith('http')) ? (
                        <img
                          src={token.icon}
                          alt={token.symbol}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            // Fallback to text icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextElement = target.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : token.symbol === 'SUI' ? (
                        /* SUI token specific icon */
                        <img
                          src="/sui-logo.png"
                          alt="SUI"
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            // Fallback to text icon if SUI image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextElement = target.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center text-white text-sm font-bold bg-gray-500 ${
                          (token.icon && (token.icon.startsWith('data:image') || token.icon.startsWith('http'))) || token.symbol === 'SUI' ? 'hidden' : 'flex'
                        }`}
                      >
                        {typeof token.icon === 'string' && !token.icon.startsWith('data:image') && !token.icon.startsWith('http')
                          ? token.icon
                          : token.symbol.charAt(0).toUpperCase()
                        }
                      </div>
                    </div>
                    {/* Chart indicator for clickable rows */}
                    {hasChart && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-muted-foreground">{token.symbol}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex items-center justify-end font-medium">
                  {formatPrice(token.price)}
                </div>

                {/* 1h Change */}
                <div className={`text-right flex items-center justify-end gap-1 font-medium ${getChangeColor(token.change1h)}`}>
                  {token.change1h > 0 ? '+' : ''}{token.change1h.toFixed(1)}%
                  {getChangeIcon(token.change1h)}
                </div>

                {/* 24h Change */}
                <div className={`text-right flex items-center justify-end gap-1 font-medium ${getChangeColor(token.change24h)}`}>
                  {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                  {getChangeIcon(token.change24h)}
                </div>

                {/* 7d Change */}
                <div className={`text-right flex items-center justify-end gap-1 font-medium ${getChangeColor(token.change7d)}`}>
                  {token.change7d > 0 ? '+' : ''}{token.change7d.toFixed(1)}%
                  {getChangeIcon(token.change7d)}
                </div>

                {/* 24h Volume */}
                <div className="text-right flex items-center justify-end font-medium text-muted-foreground">
                  {formatNumber(token.volume24h)}
                </div>

                {/* Market Cap */}
                <div className="text-right flex items-center justify-end font-medium text-muted-foreground">
                  {formatNumber(token.marketCap)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* #TODO-20.6: Chart dialog component - IMPLEMENTED */}
      <ChartDialog
        token={selectedToken}
        isOpen={isChartDialogOpen}
        onClose={handleCloseChart}
      />
    </div>
  );
}
