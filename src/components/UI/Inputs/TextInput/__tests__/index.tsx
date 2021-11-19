import { renderWithTheme } from 'test/renderUtils';

import TextInput from '..';

describe('TextInput', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(TextInput, {
      value: 'Hi people',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a label', () => {
    const { container } = renderWithTheme(TextInput, {
      value: 'Hi people',
      label: 'Some input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a validation error', () => {
    const { container } = renderWithTheme(TextInput, {
      value: 'Hi people',
      label: 'Some input',
      error: 'You failed at this',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a help message', () => {
    const { container } = renderWithTheme(TextInput, {
      value: 'Hi people',
      label: 'Some input',
      help: 'This is a very cool input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with an info message', () => {
    const { container } = renderWithTheme(TextInput, {
      value: 'Hi people',
      label: 'Some input',
      info: 'You can set a cool value',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a disabled input', () => {
    const { container } = renderWithTheme(TextInput, {
      value: 'Hi people',
      label: 'Some input',
      disabled: true,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
