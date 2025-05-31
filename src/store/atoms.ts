import { atom } from 'jotai'
import { ChatMessage } from '@/src/types'

// #TODO-6: Chat state atoms for simple chat interface
export const chatMessagesAtom = atom<ChatMessage[]>([])
export const isAIThinkingAtom = atom<boolean>(false)
export const currentInputAtom = atom<string>('')

// #TODO-6: Derived atom for adding new messages
export const addMessageAtom = atom(
  null,
  (get, set, newMessage: ChatMessage) => {
    const currentMessages = get(chatMessagesAtom)
    set(chatMessagesAtom, [...currentMessages, newMessage])
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

export const setWalletConnectingAtom = atom(
  null,
  (get, set, isConnecting: boolean) => {
    const currentState = get(walletStateAtom)
    set(walletStateAtom, { ...currentState, isConnecting })
  }
)

export const setWalletErrorAtom = atom(
  null,
  (get, set, error: string | null) => {
    const currentState = get(walletStateAtom)
    set(walletStateAtom, { ...currentState, error, isConnecting: false })
  }
)
