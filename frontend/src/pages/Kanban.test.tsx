<Cimport { screen, waitFor } from '@testing-library/react'
import React from 'react'
import { renderWithProviders } from '../test/render'

// Mock da API (mantém)
vi.mock('../utils/api', () => ({
  get: vi.fn().mockResolvedValue([
    { id: 't1', title: 'A Fazer',      status: 'todo',  priority: 'high' },
    { id: 't2', title: 'Em Progresso', status: 'doing', priority: 'medium' },
    { id: 't3', title: 'Feita',        status: 'done',  priority: 'low' },
  ]),
  listTasks: vi.fn().mockResolvedValue([
    { id: 't1', title: 'A Fazer',      status: 'todo',  priority: 'high' },
    { id: 't2', title: 'Em Progresso', status: 'doing', priority: 'medium' },
    { id: 't3', title: 'Feita',        status: 'done',  priority: 'low' },
  ]),
  updateTask: vi.fn(),
}))

import Kanban from './Kanban'

// helper: matcher insensitive a acentos
const noDiacritics = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

describe('Kanban', () => {
  it('renderiza as três colunas', async () => {
    renderWithProviders(<Kanban />)

    await waitFor(() => {
      expect(screen.getByText(/Kanban/i)).toBeInTheDocument()
    })

    // headings de nível 3, ignorando acentos
    const byName = (target: string) => ({
      name: (name: string) => noDiacritics(name) === noDiacritics(target),
      level: 3 as const,
    })

    expect(screen.getByRole('heading', byName('Por fazer'))).toBeInTheDocument()
    expect(screen.getByRole('heading', byName('A fazer'))).toBeInTheDocument()
    expect(screen.getByRole('heading', byName('Concluídas'))).toBeInTheDocument()
  })
})
>
