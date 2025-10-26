import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import * as api from '../lib/api';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('faz login com sucesso e guarda token', async () => {
    const loginSpy = vi.spyOn(api, 'login').mockResolvedValue({ access_token: 'fake.jwt.token' });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // limpar porque os inputs vêm pré-preenchidos
    await userEvent.clear(screen.getByLabelText(/email/i));
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');

    await userEvent.clear(screen.getByLabelText(/password/i));
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(localStorage.getItem('token')).toBe('fake.jwt.token');
    });
  });

  it('mostra erro quando a API devolve 401', async () => {
    vi.spyOn(api, 'login').mockRejectedValue(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    await userEvent.clear(screen.getByLabelText(/email/i));
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');

    await userEvent.clear(screen.getByLabelText(/password/i));
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');

    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    // espera pelo alerta renderizado
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid|credenciais|unauthorized/i);
  });
});

