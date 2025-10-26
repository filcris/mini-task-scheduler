import { render, screen } from '@testing-library/react';
import TaskList from './TaskList';

describe('TaskList', () => {
  it('mostra tarefas', () => {
    render(<TaskList tasks={[
      { id: '1', title: 'A', status: 'TODO' },
      { id: '2', title: 'B', status: 'DONE' },
    ]} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
