import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../test/render'
import TaskForm from './TaskForm'

describe('TaskForm', () => {
  it('permite escrever título e submeter', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    renderWithProviders(<TaskForm onCreate={onCreate} />)

    await user.type(screen.getByLabelText(/título/i), 'Nova Task')
    await user.click(screen.getByRole('button', { name: /criar|adicionar/i }))

    expect(onCreate).toHaveBeenCalled()
  })
})

