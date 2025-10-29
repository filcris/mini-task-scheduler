import { renderWithProviders } from '../test/render'
import { screen } from '@testing-library/react'
import React from 'react'
import TaskList from './TaskList'
describe('TaskList', () => {
  it('mostra tarefas', () => {
    renderWithProviders(<TaskList tasks={[
      { id: '1', title: 'A', status: 'todo', priority: 'low' } as any,
      { id: '2', title: 'B', status: 'done', priority: 'high' } as any,
    ]} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})
