import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';

describe('TaskForm', () => {
  it('permite escrever título e submeter', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<TaskForm onCreate={onCreate} />);

    await user.type(screen.getByTestId('task-title'), 'Nova Task');
    await user.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nova Task' })
    );
  });
});
