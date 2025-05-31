// #TODO-24: Alert notification system UI - IMPLEMENTED

'use client';

import React, { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { X, ExternalLink, AlertTriangle, TrendingUp, DollarSign, Shield, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  alertSystemAtom,
  addAlertAtom,
  notifyAlertAtom,
  showAlertModalAtom,
  hideAlertModalAtom,
  setAlertPollingAtom,
  AlertData
} from '@/src/store/atoms';
import { AlertResponse } from '@/src/types';

// #TODO-24.1: Alert type icons and colors
const getAlertIcon = (type: AlertData['type']) => {
  switch (type) {
    case 'breaking_news': return <AlertTriangle className="w-5 h-5" />;
    case 'price_alert': return <TrendingUp className="w-5 h-5" />;
    case 'opportunity': return <DollarSign className="w-5 h-5" />;
    case 'risk_alert': return <Shield className="w-5 h-5" />;
    case 'community_insight': return <Users className="w-5 h-5" />;
    default: return <AlertTriangle className="w-5 h-5" />;
  }
};

const getAlertColor = (type: AlertData['type']) => {
  switch (type) {
    case 'breaking_news': return 'bg-red-500';
    case 'price_alert': return 'bg-yellow-500';
    case 'opportunity': return 'bg-green-500';
    case 'risk_alert': return 'bg-orange-500';
    case 'community_insight': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

const getSeverityColor = (severity: AlertData['severity']) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// #TODO-24.2: Alert system main component
export function AlertSystem() {
  const [alertState] = useAtom(alertSystemAtom);
  const [, addAlert] = useAtom(addAlertAtom);
  const [, notifyAlert] = useAtom(notifyAlertAtom);
  const [, showAlertModal] = useAtom(showAlertModalAtom);
  const [, hideAlertModal] = useAtom(hideAlertModalAtom);
  const [, setPolling] = useAtom(setAlertPollingAtom);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // #TODO-24.3: Real-time alert polling function (no cache)
  const fetchAlerts = async () => {
    try {
      console.log('🔄 Fetching real-time alerts...');

      // Add timestamp to prevent any browser caching
      const timestamp = Date.now();
      const response = await fetch(`/api/alerts?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data: AlertResponse = await response.json();

      if (data.success && data.alerts.length > 0) {
        console.log(`📊 Processing ${data.alerts.length} real-time alerts...`);

        // Process new alerts with deduplication
        data.alerts.forEach((alert) => {
          // Add to state (this handles deduplication)
          addAlert(alert);

          // Check if we should notify about this alert (prevents spam)
          const shouldNotify = notifyAlert(alert);

          if (shouldNotify) {
            // Show toast notification only for new, non-duplicate alerts
            toast.success(`New ${alert.type.replace('_', ' ')} alert!`, {
              description: alert.title,
              action: {
                label: 'View',
                onClick: () => showAlertModal(alert)
              }
            });

            // Show modal for critical alerts
            if (alert.severity === 'critical') {
              showAlertModal(alert);
            }

            console.log(`🔔 Notified user about alert: ${alert.title}`);
          } else {
            console.log(`🔕 Skipped notification for alert: ${alert.title}`);
          }
        });
      } else if (data.success) {
        console.log('✅ Real-time check complete - no new alerts');
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  // #TODO-24.4: Start/stop polling
  useEffect(() => {
    if (alertState.settings.enabled) {
      setPolling(true);

      // Initial fetch
      fetchAlerts();

      // Set up polling interval
      intervalRef.current = setInterval(fetchAlerts, alertState.settings.pollInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setPolling(false);
      };
    }
  }, [alertState.settings.enabled, alertState.settings.pollInterval]);

  // #TODO-24.5: Handle modal close
  const handleCloseModal = () => {
    hideAlertModal();
  };

  // #TODO-24.6: Handle external link click
  const handleLinkClick = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* #TODO-24.7: Alert modal */}
      <Dialog open={alertState.showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          {alertState.currentAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getAlertColor(alertState.currentAlert.type)} text-white`}>
                    {getAlertIcon(alertState.currentAlert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{alertState.currentAlert.title}</span>
                      <Badge className={getSeverityColor(alertState.currentAlert.severity)}>
                        {alertState.currentAlert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {alertState.currentAlert.type.replace('_', ' ').toUpperCase()} •
                      Score: {alertState.currentAlert.relevanceScore}/100
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseModal}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Alert summary */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-sm">{alertState.currentAlert.summary}</p>
                </div>

                {/* Alert description */}
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <p className="text-sm text-muted-foreground">
                    {alertState.currentAlert.description}
                  </p>
                </div>

                {/* AI Analysis */}
                <div>
                  <h4 className="font-semibold mb-2">AI Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    {alertState.currentAlert.aiAnalysis}
                  </p>
                </div>

                {/* Twitter post info */}
                {alertState.currentAlert.twitterPost && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Source Tweet</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">@{alertState.currentAlert.twitterPost.author.username}</span>
                      {alertState.currentAlert.twitterPost.author.verified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {alertState.currentAlert.twitterPost.text}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>❤️ {alertState.currentAlert.twitterPost.likeCount}</span>
                      <span>🔄 {alertState.currentAlert.twitterPost.retweetCount}</span>
                      <span>👁️ {alertState.currentAlert.twitterPost.viewCount}</span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-4">
                  {alertState.currentAlert.url && (
                    <Button
                      onClick={() => handleLinkClick(alertState.currentAlert?.url)}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Source
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    Dismiss
                  </Button>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  Alert generated at {alertState.currentAlert.timestamp.toLocaleString()}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
