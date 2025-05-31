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
