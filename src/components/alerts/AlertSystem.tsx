// #TODO-24: Alert notification system UI - IMPLEMENTED

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { ExternalLink, AlertTriangle, TrendingUp, DollarSign, Shield, Users, BellRing, Zap } from 'lucide-react';
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
  markAlertsAsReadAtom,
  fetchAlertsManuallyAtom,
  AlertData
} from '@/src/store/atoms';
import { AlertResponse } from '@/src/types';

// #TODO-24.1: Alert type icons and colors with cyberpunk styling
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
    case 'breaking_news': return 'bg-gradient-to-r from-[#FF3333] to-[#FF69B4] shadow-[0_0_20px_rgba(255,51,51,0.5)]';
    case 'price_alert': return 'bg-gradient-to-r from-[#00FFFF] to-[#00BFFF] shadow-[0_0_20px_rgba(0,255,255,0.5)]';
    case 'opportunity': return 'bg-gradient-to-r from-[#39FF14] to-[#00FFFF] shadow-[0_0_20px_rgba(57,255,20,0.5)]';
    case 'risk_alert': return 'bg-gradient-to-r from-[#FF00FF] to-[#C71585] shadow-[0_0_20px_rgba(255,0,255,0.5)]';
    case 'community_insight': return 'bg-gradient-to-r from-[#00BFFF] to-[#FF00FF] shadow-[0_0_20px_rgba(0,191,255,0.5)]';
    default: return 'bg-gradient-to-r from-[#2E2E2E] to-[#1F1F1F] shadow-[0_0_20px_rgba(46,46,46,0.5)]';
  }
};

const getSeverityColor = (severity: AlertData['severity']) => {
  switch (severity) {
    case 'critical': return 'bg-gradient-to-r from-[#FF3333]/20 to-[#FF69B4]/20 text-[#FF3333] border border-[#FF3333]/30 shadow-[0_0_10px_rgba(255,51,51,0.3)]';
    case 'high': return 'bg-gradient-to-r from-[#FF00FF]/20 to-[#C71585]/20 text-[#FF00FF] border border-[#FF00FF]/30 shadow-[0_0_10px_rgba(255,0,255,0.3)]';
    case 'medium': return 'bg-gradient-to-r from-[#00FFFF]/20 to-[#00BFFF]/20 text-[#00FFFF] border border-[#00FFFF]/30 shadow-[0_0_10px_rgba(0,255,255,0.3)]';
    case 'low': return 'bg-gradient-to-r from-[#00BFFF]/20 to-[#39FF14]/20 text-[#00BFFF] border border-[#00BFFF]/30 shadow-[0_0_10px_rgba(0,191,255,0.3)]';
    default: return 'bg-gradient-to-r from-[#2E2E2E]/20 to-[#1F1F1F]/20 text-gray-400 border border-gray-600/30 shadow-[0_0_10px_rgba(46,46,46,0.3)]';
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
  const [, markAlertsAsRead] = useAtom(markAlertsAsReadAtom);
  const [, fetchAlertsManually] = useAtom(fetchAlertsManuallyAtom);

  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // #TODO-24.3: Real-time alert polling function with enhanced deduplication
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
        console.log(`📊 Processing ${data.alerts.length} real-time alerts with deduplication...`);

        // Process new alerts with enhanced deduplication
        // The system now uses deterministic IDs and content hashes to prevent duplicates
        data.alerts.forEach((alert, index) => {
          console.log(`\n--- Processing Alert ${index + 1}/${data.alerts.length} ---`);

          // Add to state (this handles both ID and content hash deduplication)
          addAlert(alert);

          // Check if we should notify about this alert (prevents notification spam)
          const shouldNotify = notifyAlert(alert);

          if (shouldNotify) {
            // Show toast notification only for new, non-duplicate alerts
            // But DON'T automatically show modal - just show the alert button
            toast.success(`New ${alert.type.replace('_', ' ')} alert!`, {
              description: alert.title,
              action: {
                label: 'View',
                onClick: () => showAlertModal(alert)
              }
            });

            console.log(`🔔 USER NOTIFIED: "${alert.title}" - Alert button will appear`);
          } else {
            console.log(`🔕 NOTIFICATION SKIPPED: "${alert.title}"`);
          }
        });
      } else if (data.success) {
        console.log('✅ Real-time check complete - no new alerts');
      }
    } catch (error) {
      console.error('❌ Failed to fetch alerts:', error);
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
  }, [alertState.settings.enabled, alertState.settings.pollInterval, setPolling, addAlert, notifyAlert, showAlertModal]);

  // #TODO-24.5: Handle alert button click - fetch alerts manually
  const handleAlertButtonClick = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAlertsManually();
      if (result.success && result.count > 0) {
        toast.success(`Found ${result.count} new alert${result.count > 1 ? 's' : ''}!`);

        // Show the latest alert in modal if there are any
        if (alertState.alerts.length > 0) {
          showAlertModal(alertState.alerts[0]);
        }
      } else if (result.success) {
        toast.info('No new alerts found');
      } else {
        toast.error('Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  };

  // #TODO-24.6: Handle showing alerts list (show modal with latest alert)
  const handleShowAlerts = () => {
    if (alertState.alerts.length > 0) {
      // Mark all alerts as read
      markAlertsAsRead();
      // Show the latest alert
      showAlertModal(alertState.alerts[0]);
    }
  };

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
      {/* #TODO-24.6: Alert button - only show when there are unread alerts or for manual fetch */}
      {(alertState.hasUnreadAlerts || alertState.alerts.length > 0) && (
        <div className="fixed top-5 right-40 z-50">
          <div className="flex gap-2">
            {/* Unread alerts button */}
            {alertState.hasUnreadAlerts && (
              <Button
                onClick={handleShowAlerts}
                className="relative bg-gradient-to-r from-[#FF3333] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF00FF] text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(255,51,51,0.6)] hover:shadow-[0_0_30px_rgba(255,0,255,0.8)] border-0 animate-pulse"
                size="lg"
              >
                <BellRing className="w-5 h-5 mr-2" />
                {alertState.unreadAlerts.size} Alert{alertState.unreadAlerts.size > 1 ? 's' : ''}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39FF14] rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39FF14] rounded-full"></div>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* #TODO-24.7: Alert modal with cyberpunk styling */}
      <Dialog open={alertState.showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-[#1F1F1F] via-[#2E2E2E] to-[#1F1F1F] border border-[#00FFFF]/30 shadow-[0_0_50px_rgba(0,255,255,0.3)] backdrop-blur-xl" showCloseButton={false}>
          {alertState.currentAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${getAlertColor(alertState.currentAlert.type)} text-white animate-glow`}>
                    {getAlertIcon(alertState.currentAlert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-lg">{alertState.currentAlert.title}</span>
                      <Badge className={getSeverityColor(alertState.currentAlert.severity)}>
                        {alertState.currentAlert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-[#00BFFF] font-normal">
                      {alertState.currentAlert.type.replace('_', ' ').toUpperCase()} •
                      <span className="text-[#00FFFF] ml-1">Score: {alertState.currentAlert.relevanceScore}/100</span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Alert summary */}
                <div className="p-4 bg-gradient-to-r from-[#00FFFF]/10 to-[#00BFFF]/10 rounded-lg border border-[#00FFFF]/20 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                  <h4 className="font-semibold mb-2 text-[#00FFFF] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00FFFF] rounded-full animate-pulse"></span>
                    Summary
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{alertState.currentAlert.summary}</p>
                </div>

                {/* Alert description */}
                <div className="p-4 bg-gradient-to-r from-[#FF00FF]/10 to-[#C71585]/10 rounded-lg border border-[#FF00FF]/20 shadow-[0_0_15px_rgba(255,0,255,0.2)]">
                  <h4 className="font-semibold mb-2 text-[#FF00FF] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF00FF] rounded-full animate-pulse"></span>
                    Details
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {alertState.currentAlert.description}
                  </p>
                </div>

                {/* AI Analysis */}
                <div className="p-4 bg-gradient-to-r from-[#39FF14]/10 to-[#00FFFF]/10 rounded-lg border border-[#39FF14]/20 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  <h4 className="font-semibold mb-2 text-[#39FF14] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></span>
                    AI Analysis
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {alertState.currentAlert.aiAnalysis}
                  </p>
                </div>

                {/* Twitter post info */}
                {alertState.currentAlert.twitterPost && (
                  <div className="p-4 bg-gradient-to-r from-[#00BFFF]/10 to-[#FF69B4]/10 rounded-lg border border-[#00BFFF]/20 shadow-[0_0_15px_rgba(0,191,255,0.2)]">
                    <h4 className="font-semibold mb-3 text-[#00BFFF] flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#00BFFF] rounded-full animate-pulse"></span>
                      Source Tweet
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium text-white">@{alertState.currentAlert.twitterPost.author.username}</span>
                      {alertState.currentAlert.twitterPost.author.verified && (
                        <Badge className="bg-gradient-to-r from-[#00FFFF]/20 to-[#00BFFF]/20 text-[#00FFFF] border border-[#00FFFF]/30">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-4 leading-relaxed bg-black/20 p-3 rounded border border-gray-600/30">
                      {alertState.currentAlert.twitterPost.text}
                    </p>
                    <div className="flex items-center gap-6 text-xs">
                      <span className="text-[#FF69B4] flex items-center gap-1">
                        <span className="text-lg">❤️</span>
                        {alertState.currentAlert.twitterPost.likeCount.toLocaleString()}
                      </span>
                      <span className="text-[#00FFFF] flex items-center gap-1">
                        <span className="text-lg">🔄</span>
                        {alertState.currentAlert.twitterPost.retweetCount.toLocaleString()}
                      </span>
                      <span className="text-[#39FF14] flex items-center gap-1">
                        <span className="text-lg">👁️</span>
                        {alertState.currentAlert.twitterPost.viewCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-6">
                  {alertState.currentAlert.url && (
                    <Button
                      onClick={() => handleLinkClick(alertState.currentAlert?.url)}
                      className="flex-1 bg-gradient-to-r from-[#00FFFF] to-[#00BFFF] hover:from-[#00BFFF] hover:to-[#FF00FF] text-black font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,0,255,0.6)] border-0"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Source
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1 bg-transparent border border-[#FF00FF]/50 text-[#FF00FF] hover:bg-[#FF00FF]/20 hover:border-[#FF00FF] transition-all duration-300 shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,255,0.5)]"
                  >
                    Dismiss
                  </Button>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-[#00BFFF] text-center pt-4 border-t border-[#00FFFF]/20 bg-gradient-to-r from-transparent via-[#00FFFF]/10 to-transparent">
                  <span className="bg-[#1F1F1F] px-3 py-1 rounded-full border border-[#00FFFF]/30 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                    Alert generated at {alertState.currentAlert.timestamp.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
