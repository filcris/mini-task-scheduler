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
    const email = await screen.findByLabelText(/email/i).catch(async () => {
      return await screen.findByPlaceholderText(/email/i)
    })
    const pwd = screen.queryByLabelText(/password|senha/i) || screen.getByPlaceholderText(/password|senha/i)
    fireEvent.change(email as HTMLInputElement, { target: { value: 'test@example.com' } })
    fireEvent.change(pwd as HTMLInputElement, { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar|login|iniciar/i }))
    await waitFor(() => { expect(screen.getByText(/dashboard/i)).toBeInTheDocument() })
  })
})
