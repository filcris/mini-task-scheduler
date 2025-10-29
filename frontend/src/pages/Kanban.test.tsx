import { screen, waitFor } from '@testing-library/react'
import React from 'react'
import { renderWithProviders } from '../test/render'

vi.mock('../utils/api', () => ({
  get: vi.fn().mockResolvedValue([
    { id: 't1', title: 'A Fazer', status: 'todo',  priority: 'high'   },
    { id: 't2', title: 'Em Progresso', status: 'doing', priority: 'medium' },
    { id: 't3', title: 'Feita',   status: 'done',  priority: 'low'    },
  ]),
  listTasks: vi.fn().mockResolvedValue([
    { id: 't1', title: 'A Fazer', status: 'todo',  priority: 'high'   },
    { id: 't2', title: 'Em Progresso', status: 'doing', priority: 'medium' },
    { id: 't3', title: 'Feita',   status: 'done',  priority: 'low'    },
  ]),
  updateTask: vi.fn(),
}))

import Kanban from './Kanban'

describe('Kanban', () => {
  it('renderiza as três colunas', async () => {
    renderWithProviders(<Kanban />)

    await waitFor(() => {
      expect(screen.getByText(/Kanban/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Por fazer',  level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'A fazer',    level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Concluídas', level: 3 })).toBeInTheDocument()
  })
})
