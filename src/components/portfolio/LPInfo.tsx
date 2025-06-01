// #TODO-28: LP Info Component - Simple text rendering for LP positions - IMPLEMENTED

'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import { LPPosition } from '@/src/lib/services/lp';

// #TODO-28.1: Define LP Info component interfaces
export interface LPInfoData {
  positions: LPPosition[];
  lastUpdated: string;
  isLoading: boolean;
}

interface LPInfoProps {
  data?: LPInfoData;
}

// #TODO-28.2: LP Info component implementation
export function LPInfo({ data }: LPInfoProps) {
  // Don't render if no data or no positions
  if (!data || data.positions.length === 0) {
    return null;
  }

  const { positions, lastUpdated } = data;

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 px-6">
      {/* LP Positions Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold">🏦 Liquidity Provider Positions</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">{positions.length} Position{positions.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* LP Positions List */}
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 px-4 py-3 text-xs font-bold text-gray-800 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">🏛️</span>
              VAULT
            </div>
            <div className="text-right flex items-center justify-end">
              <span className="text-gray-600 mr-1">💰</span>
              EQUITY
            </div>
            <div className="text-right flex items-center justify-end">
              <span className="text-gray-600 mr-1">🎯</span>
              YT BALANCE
            </div>
            <div className="text-right flex items-center justify-end">
              <span className="text-gray-600 mr-1">📈</span>
              APR
            </div>
            <div className="text-right flex items-center justify-end">
              <span className="text-gray-600 mr-1">🔄</span>
              APY
            </div>
            <div className="text-right flex items-center justify-end">
              <span className="text-gray-600 mr-1">🏦</span>
              TVL
            </div>
          </div>

          {/* LP Position Rows */}
          {positions.map((position, index) => (
            <div
              key={`${position.vaultSymbol}-${index}`}
              className="grid grid-cols-6 gap-4 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
            >
              {/* Vault Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                  {/* Check if vault symbol is SUI and use logo */}
                  {position.vaultSymbol.toLowerCase() === 'sui' ? (
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
                    className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold ${
                      position.vaultSymbol.toLowerCase() === 'sui' ? 'hidden' : 'flex'
                    }`}
                  >
                    {position.vaultSymbol.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="font-medium">{position.vaultName}</div>
                  <div className="text-sm text-muted-foreground">{position.vaultSymbol}</div>
                </div>
              </div>

              {/* Equity */}
              <div className="text-right">
                <div className="font-medium">
                  {parseFloat(position.equity).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </div>
                <div className="text-sm text-muted-foreground">{position.vaultSymbol}</div>
              </div>

              {/* YT Balance */}
              <div className="text-right">
                <div className="font-medium">
                  {parseFloat(position.ytBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </div>
                <div className="text-sm text-muted-foreground">YT Tokens</div>
              </div>

              {/* APR */}
              <div className="text-right">
                <div className="font-medium text-green-600">
                  {(position.apr * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Annual</div>
              </div>

              {/* APY */}
              <div className="text-right">
                <div className="font-medium text-blue-600">
                  {(position.apy * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Compound</div>
              </div>

              {/* TVL */}
              <div className="text-right">
                <div className="font-medium">
                  ${parseFloat(position.tvl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-muted-foreground">Total Locked</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with last updated */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        </div>
      </Card>
    </div>
  );
}
