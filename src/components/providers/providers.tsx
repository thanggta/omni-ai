'use client'

import { ReactNode } from 'react'
import { JotaiProvider } from './jotai-provider'
import { ToastProvider } from './toast-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <JotaiProvider>
      {children}
      <ToastProvider />
    </JotaiProvider>
  )
}
