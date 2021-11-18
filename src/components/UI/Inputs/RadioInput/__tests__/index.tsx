import { renderWithTheme } from 'test/renderUtils';

import RadioInput from '..';

describe('RadioInput', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(RadioInput, {
      name: 'some-input',
      label: 'Some input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a form field label', () => {
    const { container } = renderWithTheme(RadioInput, {
      name: 'some-input',
      label: 'Some input',
      fieldLabel: 'A brilliant input',
      id: 'some-input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a validation error', () => {
    const { container } = renderWithTheme(RadioInput, {
      name: 'some-input',
      label: 'Some input',
      error: 'You failed at this',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a help message', () => {
    const { container } = renderWithTheme(RadioInput, {
      name: 'some-input',
      label: 'Some input',
      help: 'This is a very cool input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with an info message', () => {
    const { container } = renderWithTheme(RadioInput, {
      name: 'some-input',
      label: 'Some input',
      info: 'You can set a cool value',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a disabled input', () => {
    const { container } = renderWithTheme(RadioInput, {
      name: 'some-input',
      label: 'Some input',
      disabled: true,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
