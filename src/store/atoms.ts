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
  settings: {
    enabled: true,
    pollInterval: 3000, // 3 seconds
    severityThreshold: 'medium',
    deduplicationWindow: 60 // 60 minutes
  }
})

// #TODO-24: Helper function to generate content hash for deduplication
const generateContentHash = (alert: AlertData): string => {
  // Create a hash based on title and key content to detect similar alerts
  const content = `${alert.title.toLowerCase()}_${alert.type}_${alert.summary.toLowerCase()}`
  return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
}

// #TODO-24: Enhanced add alert atom with deduplication
export const addAlertAtom = atom(
  null,
  (get, set, alert: AlertData) => {
    const currentState = get(alertSystemAtom)

    // Generate content hash for deduplication
    const contentHash = generateContentHash(alert)
    alert.contentHash = contentHash

    // Check if we've already seen this content recently
    if (currentState.seenContentHashes.has(contentHash)) {
      console.log(`🔄 Skipping duplicate alert: ${alert.title}`)
      return
    }

    // Check if alert already exists by ID
    const existingAlert = currentState.alerts.find(a => a.id === alert.id)
    if (existingAlert) {
      console.log(`🔄 Skipping existing alert: ${alert.title}`)
      return
    }

    // Add to state with deduplication tracking
    const newSeenHashes = new Set(currentState.seenContentHashes)
    newSeenHashes.add(contentHash)

    // Clean up old hashes (older than deduplication window)
    const cutoffTime = new Date(Date.now() - currentState.settings.deduplicationWindow * 60 * 1000)
    const recentAlerts = currentState.alerts.filter(a => a.timestamp > cutoffTime)
    const recentHashes = new Set(recentAlerts.map(a => a.contentHash).filter((hash): hash is string => Boolean(hash)))

    set(alertSystemAtom, {
      ...currentState,
      alerts: [alert, ...currentState.alerts].slice(0, 50), // Keep only last 50 alerts
      seenContentHashes: recentHashes
    })

    console.log(`✅ Added new alert: ${alert.title}`)
  }
)

// #TODO-24: Enhanced notification atom with deduplication
export const notifyAlertAtom = atom(
  null,
  (get, set, alert: AlertData) => {
    const currentState = get(alertSystemAtom)

    // Check if we've already notified about this alert
    if (currentState.notifiedAlerts.has(alert.id)) {
      console.log(`🔕 Skipping notification for already notified alert: ${alert.title}`)
      return false
    }

    // Check if alert meets severity threshold
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
    const alertLevel = severityLevels[alert.severity]
    const thresholdLevel = severityLevels[currentState.settings.severityThreshold]

    if (alertLevel < thresholdLevel) {
      console.log(`🔕 Alert below severity threshold: ${alert.severity} < ${currentState.settings.severityThreshold}`)
      return false
    }

    // Add to notified alerts
    const newNotifiedAlerts = new Set(currentState.notifiedAlerts)
    newNotifiedAlerts.add(alert.id)

    // Clean up old notifications (older than deduplication window)
    const cutoffTime = new Date(Date.now() - currentState.settings.deduplicationWindow * 60 * 1000)
    const recentAlerts = currentState.alerts.filter(a => a.timestamp > cutoffTime)
    const recentNotifications = new Set(recentAlerts.map(a => a.id))

    // Keep only recent notifications
    const cleanedNotifications = new Set([...newNotifiedAlerts].filter(id => recentNotifications.has(id)))

    set(alertSystemAtom, {
      ...currentState,
      notifiedAlerts: cleanedNotifications
    })

    console.log(`🔔 Notification allowed for alert: ${alert.title}`)
    return true
  }
)

export const showAlertModalAtom = atom(
  null,
  (get, set, alert: AlertData) => {
    const currentState = get(alertSystemAtom)
    set(alertSystemAtom, {
      ...currentState,
      currentAlert: alert,
      showModal: true
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
      seenContentHashes: new Set<string>()
    })
  }
)
