import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
vi.mock('../utils/api', () => ({
  login: vi.fn().mockResolvedValue({ access_token: 'fake' }),
  me: vi.fn().mockResolvedValue({ email: 'test@example.com' }),
  health: vi.fn().mockResolvedValue({ ok: true }),
  getToken: vi.fn().mockReturnValue(null),
}))
import App from '../App'
describe('Login', () => {
  it('faz login e navega para o dashboard', async () => {
    window.history.pushState({}, '', '/login')
    render(<App />)
    const btn = await screen.findByRole('button', { name: /entrar|login|iniciar/i })
    fireEvent.click(btn)
    await waitFor(() => { expect(screen.getByText(/dashboard/i)).toBeInTheDocument() })
  })
})
