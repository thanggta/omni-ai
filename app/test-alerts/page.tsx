// Test page for Alert System
'use client';

import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  alertSystemAtom, 
  showAlertModalAtom, 
  AlertData 
} from '@/src/store/atoms';
import { AlertResponse } from '@/src/types';

export default function TestAlertsPage() {
  const [alertState] = useAtom(alertSystemAtom);
  const [, showAlertModal] = useAtom(showAlertModalAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AlertResponse | null>(null);

  // Test alert API
  const testAlertAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/alerts');
      const data: AlertResponse = await response.json();
      setLastResponse(data);
      console.log('Alert API Response:', data);
    } catch (error) {
      console.error('Alert API Error:', error);
      setLastResponse({
        success: false,
        alerts: [],
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test modal with mock alert
  const testModal = () => {
    const mockAlert: AlertData = {
      id: `test_${Date.now()}`,
      type: 'breaking_news',
      severity: 'high',
      title: 'Test Alert: SUI Major Partnership Announced',
      description: 'This is a test alert to demonstrate the modal functionality. In a real scenario, this would contain important information about SUI ecosystem developments.',
      summary: 'Major partnership announcement could impact SUI price significantly.',
      url: 'https://twitter.com/example',
      timestamp: new Date(),
      aiAnalysis: 'This test alert demonstrates how the AI analysis would appear in the modal. The system would provide context and implications for traders.',
      relevanceScore: 85,
      twitterPost: {
        id: 'test123',
        text: 'BREAKING: Major partnership announcement for SUI ecosystem! This could be huge for the future of the network. #SUI #Blockchain',
        author: {
          username: 'suinetwork',
          name: 'SUI Network',
          verified: true,
          followers_count: 150000,
          profile_image_url: ''
        },
        likeCount: 1250,
        retweetCount: 890,
        viewCount: 45000,
        url: 'https://twitter.com/example/status/123'
      }
    };

    showAlertModal(mockAlert);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Alert System Test Page
          </h1>
          <p className="text-gray-600">
            Testing the alert detection API and modal functionality
          </p>
        </div>

        <div className="grid gap-6">
          {/* Alert System Status */}
          <Card>
            <CardHeader>
              <CardTitle>Alert System Status</CardTitle>
              <CardDescription>
                Current state of the alert monitoring system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Polling Status:</span>
                  <Badge variant={alertState.isPolling ? "default" : "secondary"} className="ml-2">
                    {alertState.isPolling ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Total Alerts:</span>
                  <Badge variant="outline" className="ml-2">
                    {alertState.alerts.length}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Poll Interval:</span>
                  <Badge variant="outline" className="ml-2">
                    {alertState.settings.pollInterval / 1000}s
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Severity Threshold:</span>
                  <Badge variant="outline" className="ml-2">
                    {alertState.settings.severityThreshold}
                  </Badge>
                </div>
              </div>
              
              {alertState.lastCheck && (
                <div>
                  <span className="text-sm font-medium">Last Check:</span>
                  <span className="ml-2 text-sm text-gray-600">
                    {alertState.lastCheck.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>
                Manually test alert system functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={testAlertAPI} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Testing...' : 'Test Alert API'}
                </Button>
                <Button 
                  onClick={testModal} 
                  variant="outline"
                  className="flex-1"
                >
                  Test Modal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Response */}
          {lastResponse && (
            <Card>
              <CardHeader>
                <CardTitle>Last API Response</CardTitle>
                <CardDescription>
                  Response from /api/alerts endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge variant={lastResponse.success ? "default" : "destructive"}>
                      {lastResponse.success ? 'Success' : 'Error'}
                    </Badge>
                  </div>
                  
                  {lastResponse.error && (
                    <div>
                      <span className="font-medium">Error:</span>
                      <span className="ml-2 text-red-600">{lastResponse.error}</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">Alerts Found:</span>
                    <span className="ml-2">{lastResponse.alerts.length}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {lastResponse.timestamp.toLocaleString()}
                    </span>
                  </div>

                  {lastResponse.alerts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Alerts:</h4>
                      <div className="space-y-2">
                        {lastResponse.alerts.map((alert, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{alert.title}</span>
                              <Badge variant="outline">{alert.type}</Badge>
                              <Badge variant="outline">{alert.severity}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{alert.summary}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              Score: {alert.relevanceScore}/100
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Alerts */}
          {alertState.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>
                  Alerts received by the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alertState.alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.title}</span>
                        <Badge variant="outline">{alert.type}</Badge>
                        <Badge variant="outline">{alert.severity}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{alert.summary}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {alert.timestamp.toLocaleString()} • Score: {alert.relevanceScore}/100
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
