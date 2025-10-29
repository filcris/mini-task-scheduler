import { renderWithProviders } from '../test/render'
import { screen } from '@testing-library/react'
import React from 'react'
import TaskList from './TaskList'
describe('TaskList', () => {
  it('mostra estado vazio', () => {
    renderWithProviders(<TaskList tasks={[]} />)
    expect(screen.getByText(/Sem tarefas/i)).toBeInTheDocument()
  })
})
