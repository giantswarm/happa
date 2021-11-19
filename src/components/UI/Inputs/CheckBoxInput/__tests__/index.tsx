import { renderWithTheme } from 'test/renderUtils';

import CheckBoxInput from '..';

describe('CheckBoxInput', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(CheckBoxInput, {
      value: 'Hi people',
      label: 'Some input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a form field label', () => {
    const { container } = renderWithTheme(CheckBoxInput, {
      value: 'Hi people',
      label: 'Some input',
      fieldLabel: 'A brilliant input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a validation error', () => {
    const { container } = renderWithTheme(CheckBoxInput, {
      value: 'Hi people',
      label: 'Some input',
      error: 'You failed at this',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a help message', () => {
    const { container } = renderWithTheme(CheckBoxInput, {
      value: 'Hi people',
      label: 'Some input',
      help: 'This is a very cool input',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with an info message', () => {
    const { container } = renderWithTheme(CheckBoxInput, {
      value: 'Hi people',
      label: 'Some input',
      info: 'You can set a cool value',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a disabled input', () => {
    const { container } = renderWithTheme(CheckBoxInput, {
      value: 'Hi people',
      label: 'Some input',
      disabled: true,
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a toggle input', () => {
    const { container } = renderWithTheme(CheckBoxInput, {
      label: 'Hi friends',
      fieldLabel: 'A checkbox',
      info: 'Some info',
      help: 'A helpful message',
      toggle: true,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
