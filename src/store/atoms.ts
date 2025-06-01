import { atom } from 'jotai'

// Example atoms for demonstration (for demo component)
export const countAtom = atom(0)
export const nameAtom = atom('World')

// Derived atom example
export const greetingAtom = atom((get) => `Hello, ${get(nameAtom)}!`)

// #TODO-6: Chat state atoms for AI chat interface
export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isLoading?: boolean
}

export const chatMessagesAtom = atom<ChatMessage[]>([])
export const currentInputAtom = atom('')
export const isAIThinkingAtom = atom(false)

// #TODO-6: Derived atom for adding a new message
export const addMessageAtom = atom(
  null,
  (get, set, message: ChatMessage) => {
    const currentMessages = get(chatMessagesAtom)
    set(chatMessagesAtom, [...currentMessages, message])
  }
)

// #TODO-6: Derived atom for updating a specific message (for streaming)
export const updateMessageAtom = atom(
  null,
  (get, set, { id, content }: { id: string; content: string }) => {
    const currentMessages = get(chatMessagesAtom)
    const updatedMessages = currentMessages.map(msg =>
      msg.id === id ? { ...msg, content } : msg
    )
    set(chatMessagesAtom, updatedMessages)
  }
)

// #TODO-6: Derived atom for removing a specific message
export const removeMessageAtom = atom(
  null,
  (get, set, messageId: string) => {
    const currentMessages = get(chatMessagesAtom)
    const filteredMessages = currentMessages.filter(msg => msg.id !== messageId)
    set(chatMessagesAtom, filteredMessages)
  }
)

// #TODO-6: Derived atom for clearing chat
export const clearChatAtom = atom(
  null,
  (get, set) => {
    set(chatMessagesAtom, [])
    set(currentInputAtom, '')
    set(isAIThinkingAtom, false)
  }
)

// #TODO-21: Wallet state atoms for SUI wallet connectivity
export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  isConnecting: boolean
  error: string | null
}

export const walletStateAtom = atom<WalletState>({
  isConnected: false,
  address: null,
  balance: null,
  isConnecting: false,
  error: null
})

// #TODO-21: Portfolio state atoms
export interface TokenBalance {
  coinType: string
  symbol: string
  balance: string
  decimals: number
  name?: string
  iconUrl?: string
  usdPrice?: number
  usdValue?: number
}

export interface PortfolioData {
  totalValue: string
  tokens: TokenBalance[]
  nfts: any[]
  lastUpdated: string | null
  isLoading: boolean
}

export const portfolioDataAtom = atom<PortfolioData>({
  totalValue: '0',
  tokens: [],
  nfts: [],
  lastUpdated: null,
  isLoading: false
})

// #TODO-21: Derived atoms for wallet actions
export const connectWalletAtom = atom(
  null,
  (get, set, walletData: { address: string; balance: string }) => {
    set(walletStateAtom, {
      isConnected: true,
      address: walletData.address,
      balance: walletData.balance,
      isConnecting: false,
      error: null
    })
  }
)

export const disconnectWalletAtom = atom(
  null,
  (get, set) => {
    set(walletStateAtom, {
      isConnected: false,
      address: null,
      balance: null,
      isConnecting: false,
      error: null
    })
    set(portfolioDataAtom, {
      totalValue: '0',
      tokens: [],
      nfts: [],
      lastUpdated: null,
      isLoading: false
    })
  }
)

// #TODO-21: Additional wallet state management atoms
export const setWalletConnectingAtom = atom(
  null,
  (get, set, isConnecting: boolean) => {
    const currentState = get(walletStateAtom)
    set(walletStateAtom, {
      ...currentState,
      isConnecting
    })
  }
)

export const setWalletErrorAtom = atom(
  null,
  (get, set, error: string | null) => {
    const currentState = get(walletStateAtom)
    set(walletStateAtom, {
      ...currentState,
      error
    })
  }
)

// #TODO-27: Swap state atoms for token swap functionality
export interface SwapState {
  fromToken: string
  toToken: string
  amount: string
  isSwapping: boolean
  swapError: string | null
  lastSwapResult: SwapResult | null
}

export interface SwapResult {
  success: boolean
  transactionHash?: string
  amountReceived?: number
  gasFee?: number
  error?: string
}

export const swapStateAtom = atom<SwapState>({
  fromToken: '',
  toToken: '',
  amount: '',
  isSwapping: false,
  swapError: null,
  lastSwapResult: null
})

// #TODO-27: Derived atoms for swap actions
export const setSwapTokensAtom = atom(
  null,
  (get, set, { fromToken, toToken }: { fromToken: string; toToken: string }) => {
    const currentState = get(swapStateAtom)
    set(swapStateAtom, {
      ...currentState,
      fromToken,
      toToken
    })
  }
)

export const setSwapAmountAtom = atom(
  null,
  (get, set, amount: string) => {
    const currentState = get(swapStateAtom)
    set(swapStateAtom, {
      ...currentState,
      amount
    })
  }
)

export const setSwapLoadingAtom = atom(
  null,
  (get, set, isSwapping: boolean) => {
    const currentState = get(swapStateAtom)
    set(swapStateAtom, {
      ...currentState,
      isSwapping
    })
  }
)

export const setSwapErrorAtom = atom(
  null,
  (get, set, swapError: string | null) => {
    const currentState = get(swapStateAtom)
    set(swapStateAtom, {
      ...currentState,
      swapError
    })
  }
)

export const setSwapResultAtom = atom(
  null,
  (get, set, lastSwapResult: SwapResult | null) => {
    const currentState = get(swapStateAtom)
    set(swapStateAtom, {
      ...currentState,
      lastSwapResult,
      isSwapping: false
    })
  }
)

export const clearSwapStateAtom = atom(
  null,
  (get, set) => {
    set(swapStateAtom, {
      fromToken: '',
      toToken: '',
      amount: '',
      isSwapping: false,
      swapError: null,
      lastSwapResult: null
    })
  }
)

// #TODO-24: Alert system state atoms with deduplication
export interface AlertData {
  id: string
  type: 'breaking_news' | 'price_alert' | 'opportunity' | 'risk_alert' | 'community_insight'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  summary: string
  url?: string
  timestamp: Date
  twitterPost?: any
  aiAnalysis: string
  relevanceScore: number
  contentHash?: string // For deduplication based on content similarity
}

export interface AlertSystemState {
  alerts: AlertData[]
  isPolling: boolean
  lastCheck: Date | null
  currentAlert: AlertData | null
  showModal: boolean
  notifiedAlerts: Set<string> // Track which alerts have been notified to prevent spam
  seenContentHashes: Set<string> // Track content hashes to prevent duplicate content
  unreadAlerts: Set<string> // Track unread alerts for button display
  hasUnreadAlerts: boolean // Quick flag for unread alerts
  settings: {
    enabled: boolean
    pollInterval: number
    severityThreshold: 'low' | 'medium' | 'high' | 'critical'
    deduplicationWindow: number // Time window in minutes for deduplication
  }
}

export const alertSystemAtom = atom<AlertSystemState>({
  alerts: [],
  isPolling: false,
  lastCheck: null,
  currentAlert: null,
  showModal: false,
  notifiedAlerts: new Set<string>(),
  seenContentHashes: new Set<string>(),
  unreadAlerts: new Set<string>(),
  hasUnreadAlerts: false,
  settings: {
    enabled: true,
    pollInterval: 3000, // 3 seconds
    severityThreshold: 'medium',
    deduplicationWindow: 60 // 60 minutes
  }
})

// #TODO-24: Helper function to generate content hash for deduplication (matches API logic)
const generateContentHash = (alert: AlertData): string => {
  // Create a hash based on title, type, summary, and post ID to detect identical alerts
  const postId = alert.twitterPost?.id || 'no_post';
  const content = `${alert.title}_${alert.type}_${alert.summary}_${postId}`;
  const cleanContent = content.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

  // Use same logic as API for consistency
  try {
    return Buffer.from(cleanContent).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  } catch {
    // Fallback for browser environments
    return btoa(cleanContent).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }
}

// #TODO-24: Enhanced add alert atom with deduplication
export const addAlertAtom = atom(
  null,
  (get, set, alert: AlertData) => {
    const currentState = get(alertSystemAtom)

    // Generate content hash for deduplication
    const contentHash = generateContentHash(alert)
    alert.contentHash = contentHash

    console.log(`🔍 Processing alert: "${alert.title}" (ID: ${alert.id}, Hash: ${contentHash})`)

    // Check if we've already seen this content recently
    if (currentState.seenContentHashes.has(contentHash)) {
      console.log(`🔄 DUPLICATE CONTENT - Skipping alert with hash: ${contentHash}`)
      console.log(`   Title: "${alert.title}"`)
      console.log(`   Existing hashes: [${Array.from(currentState.seenContentHashes).join(', ')}]`)
      return
    }

    // Check if alert already exists by ID
    const existingAlert = currentState.alerts.find(a => a.id === alert.id)
    if (existingAlert) {
      console.log(`🔄 DUPLICATE ID - Skipping alert with ID: ${alert.id}`)
      console.log(`   Title: "${alert.title}"`)
      console.log(`   Existing alert: "${existingAlert.title}"`)
      return
    }

    // Add to state with deduplication tracking
    const newSeenHashes = new Set(currentState.seenContentHashes)
    newSeenHashes.add(contentHash)

    // Clean up old hashes (older than deduplication window)
    const cutoffTime = new Date(Date.now() - currentState.settings.deduplicationWindow * 60 * 1000)
    const recentAlerts = currentState.alerts.filter(a => a.timestamp > cutoffTime)
    const recentHashes = new Set(recentAlerts.map(a => a.contentHash).filter((hash): hash is string => Boolean(hash)))

    // Add the new hash to recent hashes
    recentHashes.add(contentHash)

    // Add to unread alerts
    const newUnreadAlerts = new Set(currentState.unreadAlerts)
    newUnreadAlerts.add(alert.id)

    set(alertSystemAtom, {
      ...currentState,
      alerts: [alert, ...currentState.alerts].slice(0, 50), // Keep only last 50 alerts
      seenContentHashes: recentHashes,
      unreadAlerts: newUnreadAlerts,
      hasUnreadAlerts: true
    })

    console.log(`✅ ADDED NEW ALERT: "${alert.title}"`)
    console.log(`   ID: ${alert.id}`)
    console.log(`   Hash: ${contentHash}`)
    console.log(`   Total alerts: ${currentState.alerts.length + 1}`)
    console.log(`   Tracked hashes: ${recentHashes.size}`)
  }
)

// #TODO-24: Enhanced notification atom with deduplication
export const notifyAlertAtom = atom(
  null,
  (get, set, alert: AlertData) => {
    const currentState = get(alertSystemAtom)

    console.log(`🔔 Checking notification for: "${alert.title}" (ID: ${alert.id})`)

    // Check if we've already notified about this alert
    if (currentState.notifiedAlerts.has(alert.id)) {
      console.log(`🔕 ALREADY NOTIFIED - Skipping notification for alert ID: ${alert.id}`)
      console.log(`   Title: "${alert.title}"`)
      console.log(`   Notified alerts: [${Array.from(currentState.notifiedAlerts).join(', ')}]`)
      return false
    }

    // Check if alert meets severity threshold
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
    const alertLevel = severityLevels[alert.severity]
    const thresholdLevel = severityLevels[currentState.settings.severityThreshold]

    if (alertLevel < thresholdLevel) {
      console.log(`🔕 BELOW THRESHOLD - Alert severity ${alert.severity} (${alertLevel}) < threshold ${currentState.settings.severityThreshold} (${thresholdLevel})`)
      return false
    }

    // Add to notified alerts
    const newNotifiedAlerts = new Set(currentState.notifiedAlerts)
    newNotifiedAlerts.add(alert.id)

    // Clean up old notifications (older than deduplication window)
    const cutoffTime = new Date(Date.now() - currentState.settings.deduplicationWindow * 60 * 1000)
    const recentAlerts = currentState.alerts.filter(a => a.timestamp > cutoffTime)
    const recentNotifications = new Set(recentAlerts.map(a => a.id))

    // Keep only recent notifications and add the new one
    const cleanedNotifications = new Set([...newNotifiedAlerts].filter(id => recentNotifications.has(id)))
    cleanedNotifications.add(alert.id)

    set(alertSystemAtom, {
      ...currentState,
      notifiedAlerts: cleanedNotifications
    })

    console.log(`🔔 NOTIFICATION APPROVED: "${alert.title}"`)
    console.log(`   ID: ${alert.id}`)
    console.log(`   Severity: ${alert.severity} (${alertLevel})`)
    console.log(`   Total notified: ${cleanedNotifications.size}`)
    return true
  }
)

export const showAlertModalAtom = atom(
  true,
  (get, set, alert: AlertData) => {
    const currentState = get(alertSystemAtom)

    // Mark this alert as read when showing modal
    const newUnreadAlerts = new Set(currentState.unreadAlerts)
    newUnreadAlerts.delete(alert.id)

    set(alertSystemAtom, {
      ...currentState,
      currentAlert: alert,
      showModal: true,
      unreadAlerts: newUnreadAlerts,
      hasUnreadAlerts: newUnreadAlerts.size > 0
    })
  }
)

export const hideAlertModalAtom = atom(
  null,
  (get, set) => {
    const currentState = get(alertSystemAtom)
    set(alertSystemAtom, {
      ...currentState,
      currentAlert: null,
      showModal: false
    })
  }
)

export const setAlertPollingAtom = atom(
  null,
  (get, set, isPolling: boolean) => {
    const currentState = get(alertSystemAtom)
    set(alertSystemAtom, {
      ...currentState,
      isPolling,
      lastCheck: isPolling ? new Date() : currentState.lastCheck
    })
  }
)

export const updateAlertSettingsAtom = atom(
  null,
  (get, set, settings: Partial<AlertSystemState['settings']>) => {
    const currentState = get(alertSystemAtom)
    set(alertSystemAtom, {
      ...currentState,
      settings: {
        ...currentState.settings,
        ...settings
      }
    })
  }
)

export const clearAlertsAtom = atom(
  null,
  (get, set) => {
    const currentState = get(alertSystemAtom)
    set(alertSystemAtom, {
      ...currentState,
      alerts: [],
      notifiedAlerts: new Set<string>(),
      seenContentHashes: new Set<string>(),
      unreadAlerts: new Set<string>(),
      hasUnreadAlerts: false
    })
  }
)

// #TODO-24: Mark alerts as read atom
export const markAlertsAsReadAtom = atom(
  null,
  (get, set, alertIds?: string[]) => {
    const currentState = get(alertSystemAtom)

    if (alertIds) {
      // Mark specific alerts as read
      const newUnreadAlerts = new Set(currentState.unreadAlerts)
      alertIds.forEach(id => newUnreadAlerts.delete(id))

      set(alertSystemAtom, {
        ...currentState,
        unreadAlerts: newUnreadAlerts,
        hasUnreadAlerts: newUnreadAlerts.size > 0
      })
    } else {
      // Mark all alerts as read
      set(alertSystemAtom, {
        ...currentState,
        unreadAlerts: new Set<string>(),
        hasUnreadAlerts: false
      })
    }
  }
)

// #TODO-24: Manual fetch alerts atom (for button trigger)
export const fetchAlertsManuallyAtom = atom(
  null,
  async (get, set) => {
    try {
      console.log('🔄 Manual alert fetch triggered...');

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
      const data = await response.json();

      if (data.success && data.alerts.length > 0) {
        console.log(`📊 Processing ${data.alerts.length} manual alerts...`);

        // Process new alerts using the existing logic
        data.alerts.forEach((alert: any) => {
          const currentState = get(alertSystemAtom);

          // Generate content hash for deduplication
          const contentHash = generateContentHash(alert);
          alert.contentHash = contentHash;

          // Check if we've already seen this content recently
          if (currentState.seenContentHashes.has(contentHash)) {
            console.log(`🔄 DUPLICATE CONTENT - Skipping alert with hash: ${contentHash}`);
            return;
          }

          // Check if alert already exists by ID
          const existingAlert = currentState.alerts.find(a => a.id === alert.id);
          if (existingAlert) {
            console.log(`🔄 DUPLICATE ID - Skipping alert with ID: ${alert.id}`);
            return;
          }

          // Add to state with deduplication tracking
          const newSeenHashes = new Set(currentState.seenContentHashes);
          newSeenHashes.add(contentHash);

          // Clean up old hashes
          const cutoffTime = new Date(Date.now() - currentState.settings.deduplicationWindow * 60 * 1000);
          const recentAlerts = currentState.alerts.filter(a => a.timestamp > cutoffTime);
          const recentHashes = new Set(recentAlerts.map(a => a.contentHash).filter((hash): hash is string => Boolean(hash)));
          recentHashes.add(contentHash);

          // Add to unread alerts
          const newUnreadAlerts = new Set(currentState.unreadAlerts);
          newUnreadAlerts.add(alert.id);

          set(alertSystemAtom, {
            ...currentState,
            alerts: [alert, ...currentState.alerts].slice(0, 50),
            seenContentHashes: recentHashes,
            unreadAlerts: newUnreadAlerts,
            hasUnreadAlerts: true
          });

          console.log(`✅ ADDED NEW ALERT: "${alert.title}"`);
        });

        return { success: true, count: data.alerts.length };
      } else {
        console.log('✅ Manual check complete - no new alerts');
        return { success: true, count: 0 };
      }
    } catch (error) {
      console.error('❌ Failed to fetch alerts manually:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
)
