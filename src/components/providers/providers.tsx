'use client'

import { ReactNode } from 'react'
import { JotaiProvider } from './jotai-provider'
import { ToastProvider } from './toast-provider'
import { SuiProvider } from './sui-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SuiProvider>
      <JotaiProvider>
        {children}
        <ToastProvider />
      </JotaiProvider>
    </SuiProvider>
  )
}
