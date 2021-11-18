import { renderWithTheme } from 'test/renderUtils';

import Select from '..';

describe('Select', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(Select, {
      id: 'pet',
      options: ['A dog', 'A cat', 'A frog'],
      placeholder: 'Just select something...',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a label', () => {
    const { container } = renderWithTheme(Select, {
      id: 'pet',
      options: ['A dog', 'A cat', 'A frog'],
      placeholder: 'Just select something...',
      label: 'Which pet to get?',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a validation error', () => {
    const { container } = renderWithTheme(Select, {
      id: 'pet',
      options: ['A dog', 'A cat', 'A frog'],
      placeholder: 'Just select something...',
      label: 'Which pet to get?',
      error: 'You failed at this',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a help message', () => {
    const { container } = renderWithTheme(Select, {
      id: 'pet',
      options: ['A dog', 'A cat', 'A frog'],
      placeholder: 'Just select something...',
      label: 'Which pet to get?',
      help: 'This is a very cool input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with an info message', () => {
    const { container } = renderWithTheme(Select, {
      id: 'pet',
      options: ['A dog', 'A cat', 'A frog'],
      placeholder: 'Just select something...',
      label: 'Which pet to get?',
      info: 'You can set a cool value',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a disabled input', () => {
    const { container } = renderWithTheme(Select, {
      id: 'pet',
      options: ['A dog', 'A cat', 'A frog'],
      placeholder: 'Just select something...',
      value: 'A dog',
      label: 'Which pet to get?',
      disabled: true,
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input inside the dropdown, that can search through the options', () => {
    const { container } = renderWithTheme(Select, {
      id: 'pet',
      options: ['A dog', 'A cat', 'A frog'],
      searchPlaceholder: 'Search for a pet...',
      emptySearchMessage: 'No pets found.',
      disabled: true,
      dropHeight: 'medium',
      onSearch: jest.fn(),
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
