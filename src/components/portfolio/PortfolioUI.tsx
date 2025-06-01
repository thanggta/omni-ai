// Portfolio UI Component - Beautiful design matching the reference
'use client';

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";
import { PortfolioUIData } from '@/src/lib/utils/portfolio-action-parser';
import { LPInfo } from './LPInfo';

// Re-export types for convenience
export interface TokenHolding {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change24h: number;
  amount: number;
  value: number;
  color: string;
}

export interface PortfolioData {
  netWorth: number;
  suiAmount: string | number;
  totalTokens: number;
  holdings: TokenHolding[];
  walletAddress?: string;
  analysisTimestamp?: string;
}

interface PortfolioUIProps {
  data?: PortfolioUIData['data'];
}

// Mock portfolio data
const mockPortfolioData: PortfolioData = {
  netWorth: 410.31,
  suiAmount: 126.64,
  totalTokens: 6,
  holdings: [
    {
      id: "swal",
      symbol: "SWAL",
      name: "SWAL",
      icon: "W",
      price: 0.538,
      change24h: -12.42,
      amount: 324.0958,
      value: 174.38,
      color: "#4F46E5"
    },
    {
      id: "ssui",
      symbol: "SSUI",
      name: "Spring SUI",
      icon: "S",
      price: 3.2848,
      change24h: -6.08,
      amount: 21.9523,
      value: 72.11,
      color: "#10B981"
    },
    {
      id: "hasui",
      symbol: "HASUI",
      name: "haSUI",
      icon: "H",
      price: 3.4238,
      change24h: -6.08,
      amount: 11.1457,
      value: 38.16,
      color: "#F59E0B"
    },
    {
      id: "wal",
      symbol: "WAL",
      name: "WAL Token",
      icon: "W",
      price: 0.4996,
      change24h: -9.68,
      amount: 72.43,
      value: 36.19,
      color: "#EF4444"
    },
    {
      id: "vsui",
      symbol: "VSUI",
      name: "Volo Staked SUI",
      icon: "V",
      price: 3.3918,
      change24h: -6.07,
      amount: 7.2828,
      value: 24.70,
      color: "#06B6D4"
    },
    {
      id: "ns",
      symbol: "NS",
      name: "SuiNS Token",
      icon: "N",
      price: 0.1825,
      change24h: -10.99,
      amount: 101.2026,
      value: 18.47,
      color: "#059669"
    }
  ]
};

// Portfolio allocation colors
const allocationColors = [
  "#4F46E5", // SWAL - Blue
  "#10B981", // SSUI - Green
  "#F59E0B", // HASUI - Yellow
  "#EF4444", // WAL - Red
  "#06B6D4", // VSUI - Cyan
  "#059669", // NS - Emerald
  "#8B5CF6", // USDC - Purple
  "#6B7280"  // Other - Gray
];

export function PortfolioUI({ data }: PortfolioUIProps = {}) {
  // Use provided data or fall back to mock data
  const portfolioData = data ? {
    netWorth: data.netWorth,
    suiAmount: data.suiAmount,
    totalTokens: data.totalTokens,
    holdings: data.holdings,
    walletAddress: data.walletAddress,
    analysisTimestamp: data.analysisTimestamp
  } : mockPortfolioData;

  const { netWorth, suiAmount, holdings } = portfolioData;
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculate portfolio allocation percentages
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const allocations = holdings.map((holding, index) => ({
    ...holding,
    percentage: (holding.value / totalValue) * 100,
    color: allocationColors[index] || "#6B7280"
  }));

  // Handle mouse events for tooltip
  const handleMouseEnter = (tokenId: string, event: React.MouseEvent) => {
    setHoveredToken(tokenId);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredToken(null);
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
        {/* Net Worth Section */}
        <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">Net Worth</h2>
            <div className="text-3xl font-bold">${netWorth.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">{typeof suiAmount === 'string' ? parseFloat(suiAmount).toFixed(2) : suiAmount.toFixed(2)} SUI</div>
          </div>
          
          {/* Portfolio Allocation Legend */}
          <div className="flex flex-wrap gap-2 text-xs">
            {allocations.slice(0, 8).map((token) => (
              <div key={token.id} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: token.color }}
                />
                <span className="font-medium">{token.symbol}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-400" />
              <span className="font-medium">Other</span>
            </div>
          </div>
        </div>

        {/* Portfolio Allocation Bar */}
        <div className="relative">
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {allocations.map((token) => (
              <div
                key={token.id}
                className={`h-full cursor-pointer transition-all duration-200 ${
                  hoveredToken === null
                    ? 'hover:brightness-110 hover:scale-y-125'
                    : hoveredToken === token.id
                      ? 'brightness-110 scale-y-125 z-10'
                      : 'blur-md opacity-30'
                }`}
                style={{
                  backgroundColor: token.color,
                  width: `${token.percentage}%`
                }}
                onMouseEnter={(e) => handleMouseEnter(token.id, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </div>

          {/* Tooltip */}
          {hoveredToken && (
            <div
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
              style={{
                left: mousePosition.x + 10,
                top: mousePosition.y - 10,
                transform: 'translateY(-100%)'
              }}
            >
              {(() => {
                const token = allocations.find(t => t.id === hoveredToken);
                if (!token) return null;

                return (
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center overflow-hidden">
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
                          className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            (token.icon && (token.icon.startsWith('data:image') || token.icon.startsWith('http'))) || token.symbol === 'SUI' ? 'hidden' : 'flex'
                          }`}
                          style={{ backgroundColor: token.color }}
                        >
                          {typeof token.icon === 'string' && !token.icon.startsWith('data:image') && !token.icon.startsWith('http')
                            ? token.icon
                            : token.symbol.charAt(0).toUpperCase()
                          }
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {token.name} ({token.symbol})
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Balance</span>
                        <span className="font-medium">{token.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Value</span>
                        <span className="font-medium">${token.value.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ratio</span>
                        <span className="font-medium">{token.percentage.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </Card>

      {/* Holdings Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold">Holding</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">${netWorth.toFixed(2)}</div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="space-y-1">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-4 text-xs font-bold text-gray-800 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm mb-2">
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">📊</span>
              ASSETS
            </div>
            <div className="text-right flex items-center justify-end">
              <span className="text-gray-600 mr-1">📈</span>
              PRICE/24H CHANGE
            </div>
            <div className="text-right flex items-center justify-end">
              <span className="text-gray-600 mr-1">💰</span>
              AMOUNT
            </div>
            <div className="text-right flex items-center justify-end">
              <span className="text-gray-600 mr-1">💵</span>
              VALUE
            </div>
          </div>

          {/* Holdings Rows */}
          {holdings.map((holding) => (
            <div
              key={holding.id}
              className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {/* Asset Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                  {/* Check for actual image URLs first */}
                  {holding.icon && (holding.icon.startsWith('data:image') || holding.icon.startsWith('http')) ? (
                    <img
                      src={holding.icon}
                      alt={holding.symbol}
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
                  ) : holding.symbol === 'SUI' ? (
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
                    className={`w-full h-full rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      (holding.icon && (holding.icon.startsWith('data:image') || holding.icon.startsWith('http'))) || holding.symbol === 'SUI' ? 'hidden' : 'flex'
                    }`}
                    style={{ backgroundColor: holding.color }}
                  >
                    {typeof holding.icon === 'string' && !holding.icon.startsWith('data:image') && !holding.icon.startsWith('http')
                      ? holding.icon
                      : holding.symbol.charAt(0).toUpperCase()
                    }
                  </div>
                </div>
                <div>
                  <div className="font-medium">{holding.name}</div>
                  <div className="text-sm text-muted-foreground">{holding.symbol}</div>
                </div>
              </div>

              {/* Price and Change */}
              <div className="text-right">
                <div className="font-medium">${holding.price.toFixed(4)}</div>
                <div className={`text-sm flex items-center justify-end gap-1 ${
                  holding.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                  {holding.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right font-medium">
                {holding.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4
                })}
              </div>

              {/* Value */}
              <div className="text-right font-medium">
                ${holding.value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </Card>
      </div>

      {/* LP Info Component - Display below Portfolio UI */}
      {data?.lpData && <LPInfo data={data.lpData} />}
    </>
  );
}
