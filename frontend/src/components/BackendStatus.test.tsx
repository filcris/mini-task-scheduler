// src/components/BackendStatus.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// mocka ANTES de importar o componente
vi.mock('../lib/api', () => ({
  ping: vi.fn(),
}));

import { ping } from '../lib/api';
import BackendStatus from './BackendStatus';

describe('BackendStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra ✅ quando a API responde OK', async () => {
    (ping as unknown as vi.Mock).mockResolvedValueOnce(undefined);

    render(<BackendStatus />);

    // começa com ⏳
    expect(screen.getByLabelText('backend-status').textContent).toMatch(/⏳/);

    await waitFor(() => {
      expect(screen.getByLabelText('backend-status').textContent).toMatch(/✅/i);
    });
  });

  it('mostra ❌ quando a API falha', async () => {
    (ping as unknown as vi.Mock).mockRejectedValueOnce(new Error('down'));

    render(<BackendStatus />);

    await waitFor(() => {
      expect(screen.getByLabelText('backend-status').textContent).toMatch(/❌/i);
    });
  });
});



