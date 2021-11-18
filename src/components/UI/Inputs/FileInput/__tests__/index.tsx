import { renderWithTheme } from 'test/renderUtils';

import FileInput from '..';

describe('FileInput', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(FileInput, {});
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a label', () => {
    const { container } = renderWithTheme(FileInput, {
      id: 'input',
      label: 'Some input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a validation error', () => {
    const { container } = renderWithTheme(FileInput, {
      error: 'You failed at this',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a help message', () => {
    const { container } = renderWithTheme(FileInput, {
      help: 'This is a very cool input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with an info message', () => {
    const { container } = renderWithTheme(FileInput, {
      info: 'You can set a cool value',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a disabled input', () => {
    const { container } = renderWithTheme(FileInput, {
      disabled: true,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
