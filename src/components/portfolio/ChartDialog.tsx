// #TODO-20.3: Chart dialog component for displaying DEX Screener charts in iframe - UPDATED
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { TrendingToken } from './TrendingTokensUI';

interface ChartDialogProps {
  token: TrendingToken | null;
  isOpen: boolean;
  onClose: () => void;
}

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

// Get color for price changes
const getChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-muted-foreground';
};

// Get icon for price changes
const getChangeIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="w-3 h-3" />;
  if (change < 0) return <TrendingDown className="w-3 h-3" />;
  return null;
};

export function ChartDialog({ token, isOpen, onClose }: ChartDialogProps) {
  if (!token) return null;

  // Use DEX Screener as primary chart source (chartUrl now points to DEX Screener with embed params)
  const chartUrl = token.chartUrl || token.dexScreenerUrl;

  // For external link, remove embed parameters to show full DEX Screener page
  const externalUrl = chartUrl ? chartUrl.split('?')[0] : undefined;

  if (!chartUrl) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5" />
              {token.name} ({token.symbol}) Chart
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Chart data not available for this token
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[70vw] h-[85vh] p-0" showCloseButton={false}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5" />
              <span>{token.name} ({token.symbol}) Chart</span>
            </div>
            <div className="flex items-center gap-2">
              {/* External link button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(externalUrl || chartUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Market Information Panel */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            {/* Price */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</div>
              <div className="text-lg font-bold">{formatPrice(token.price)}</div>
            </div>

            {/* 24h Change */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">24h Change</div>
              <div className={`text-lg font-bold flex items-center gap-1 ${getChangeColor(token.change24h)}`}>
                {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                {getChangeIcon(token.change24h)}
              </div>
            </div>

            {/* 24h Volume */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">24h Volume</div>
              <div className="text-lg font-bold">{formatNumber(token.volume24h)}</div>
            </div>

            {/* Market Cap */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Market Cap</div>
              <div className="text-lg font-bold">{formatNumber(token.marketCap)}</div>
            </div>
          </div>

          {/* Additional price changes row */}
          <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-white rounded-lg border border-gray-100">
            {/* 1h Change */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">1h Change:</span>
              <div className={`text-sm font-medium flex items-center gap-1 ${getChangeColor(token.change1h)}`}>
                {token.change1h > 0 ? '+' : ''}{token.change1h.toFixed(1)}%
                {getChangeIcon(token.change1h)}
              </div>
            </div>

            {/* 7d Change */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">7d Change:</span>
              <div className={`text-sm font-medium flex items-center gap-1 ${getChangeColor(token.change7d)}`}>
                {token.change7d > 0 ? '+' : ''}{token.change7d.toFixed(1)}%
                {getChangeIcon(token.change7d)}
              </div>
            </div>
          </div>
        </div>

        {/* Chart iframe */}
        <div className="flex-1 px-6 pb-6">
          <div className="w-full h-full rounded-lg overflow-hidden border bg-background">
            <iframe
              src={chartUrl}
              className="w-full h-full border-0"
              title={`${token.name} Chart`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
