import { screen, waitFor } from '@testing-library/react'
import React from 'react'
import { renderWithProviders } from '../test/render'
vi.mock('../utils/api', () => ({
  listTasks: vi.fn().mockResolvedValue([
    { id: 't1', title: 'A Fazer', status: 'todo', priority: 'high' },
    { id: 't2', title: 'Em Progresso', status: 'doing', priority: 'medium' },
    { id: 't3', title: 'Feita', status: 'done', priority: 'low' },
  ]),
  updateTask: vi.fn(),
}))
import Kanban from './Kanban'
describe('Kanban', () => {
  it('renderiza as três colunas e tarefas', async () => {
    renderWithProviders(<Kanban />)
    await waitFor(() => { expect(screen.getByText(/Kanban/i)).toBeInTheDocument() })
    expect(screen.getByText(/Por fazer|Todo/i)).toBeInTheDocument()
    expect(screen.getByText(/A fazer|Doing/i)).toBeInTheDocument()
    expect(screen.getByText(/Concluídas|Done/i)).toBeInTheDocument()
    expect(screen.getByText('A Fazer')).toBeInTheDocument()
    expect(screen.getByText('Em Progresso')).toBeInTheDocument()
    expect(screen.getByText('Feita')).toBeInTheDocument()
  })
})
