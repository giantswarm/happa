import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from 'test/renderUtils';

import MultiSelect from '..';

describe('MultiSelect', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(MultiSelect, {
      id: 'pet',
      options: [
        'A dog',
        'A cat',
        'A frog',
        'A shark',
        'A ghost',
        'A snake',
        'A camel',
      ],
      placeholder: 'Just select something...',
      label: 'Pets I want to get',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('displays all the selected values, and a placeholder if the number of selected values is above the given limit', () => {
    renderWithTheme(MultiSelect, {
      id: 'pet',
      options: [
        'A dog',
        'A cat',
        'A frog',
        'A shark',
        'A ghost',
        'A snake',
        'A camel',
      ],
      placeholder: 'Just select something...',
      label: 'Pets I want to get',
      selected: ['A dog', 'A cat', 'A frog', 'A shark'],
      maxVisibleValues: 2,
    });

    expect(screen.getByText('A dog')).toBeInTheDocument();
    expect(screen.getByText('A cat')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('can remove selected values', () => {
    const onRemoveValueMockFn = jest.fn();

    renderWithTheme(MultiSelect, {
      id: 'pet',
      options: [
        'A dog',
        'A cat',
        'A frog',
        'A shark',
        'A ghost',
        'A snake',
        'A camel',
      ],
      placeholder: 'Just select something...',
      label: 'Pets I want to get',
      selected: ['A dog', 'A cat', 'A frog', 'A shark'],
      maxVisibleValues: 2,
      onRemoveValue: onRemoveValueMockFn,
    });

    const value = screen.getByText('A cat');
    expect(value).toBeInTheDocument();
    fireEvent.click(value);

    expect(onRemoveValueMockFn).toHaveBeenCalledWith('A cat');
  });
});
