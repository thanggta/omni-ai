'use client'

import { ReactNode } from 'react'
import { JotaiProvider } from './jotai-provider'
import { ToastProvider } from './toast-provider'
import { SuiProvider } from './sui-provider'
import { AlertSystem } from '../alerts/AlertSystem'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SuiProvider>
      <JotaiProvider>
        {children}
        <ToastProvider />
        <AlertSystem />
      </JotaiProvider>
    </SuiProvider>
  )
}
