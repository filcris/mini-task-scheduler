import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

// mock da API usado pelo App/Login
vi.mock('../utils/api', () => ({
  login: vi.fn().mockResolvedValue({ access_token: 'fake' }),
  me: vi.fn().mockResolvedValue({ email: 'test@example.com' }),
  health: vi.fn().mockResolvedValue({ ok: true }),
  getToken: vi.fn().mockReturnValue(null), // arranca sem token
}))

import App from '../App'

describe('Login', () => {
  it('faz login e navega para o dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      // após login, App faz navigate('/dashboard')
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })
})


