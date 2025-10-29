import { screen, waitFor } from '@testing-library/react'
import React from 'react'
import { renderWithProviders } from '../test/render'
vi.mock('../utils/api', () => ({
  listTasks: vi.fn().mockResolvedValue([
    { id: 't1', title: 'Primeira', status: 'todo', priority: 'medium', description: null, dueAt: null, createdAt: new Date().toISOString() },
  ]),
  createTask: vi.fn(), updateTask: vi.fn(), deleteTask: vi.fn(),
}))
import TasksPage from './TasksPage'
describe('TasksPage', () => {
  it('mostra a lista com pelo menos uma tarefa e o bot�o Exportar CSV', async () => {
    renderWithProviders(<TasksPage />)
    await waitFor(() => { expect(screen.getByText('Tasks')).toBeInTheDocument() })
    expect(await screen.findByText('Primeira')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Exportar CSV/i })).toBeInTheDocument()
  })
})
