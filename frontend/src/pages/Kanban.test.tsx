import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

// mock do api.get usado no Kanban
vi.mock('../utils/api', () => ({
  get: vi.fn().mockResolvedValue([
    { id: 't1', title: 'A Fazer', status: 'todo', priority: 'high' },
    { id: 't2', title: 'Em Progresso', status: 'doing', priority: 'medium' },
    { id: 't3', title: 'Feita', status: 'done', priority: 'low' },
  ]),
}))

import Kanban from './Kanban'

describe('Kanban', () => {
  it('renderiza as três colunas e tarefas', async () => {
    render(<Kanban />)

    await waitFor(() => {
      expect(screen.getByText(/Kanban/i)).toBeInTheDocument()
    })

    expect(screen.getByText('Por fazer')).toBeInTheDocument()
    expect(screen.getByText('A fazer')).toBeInTheDocument()
    expect(screen.getByText('Concluídas')).toBeInTheDocument()

    expect(screen.getByText('A Fazer')).toBeInTheDocument()
    expect(screen.getByText('Em Progresso')).toBeInTheDocument()
    expect(screen.getByText('Feita')).toBeInTheDocument()
  })
})
