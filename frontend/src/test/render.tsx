import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '../theme/ThemeProvider'
import { ToastProvider } from '../ui/Toast'

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(
    <ThemeProvider>
      <ToastProvider>{ui}</ToastProvider>
    </ThemeProvider>,
    options
  )
}
