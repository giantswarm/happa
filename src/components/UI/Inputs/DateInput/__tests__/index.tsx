import { renderWithTheme } from 'test/renderUtils';

import DateInput from '..';

describe('DateInput', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(DateInput, {
      format: 'yyyy-mm-dd',
      value: '',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a label', () => {
    const { container } = renderWithTheme(DateInput, {
      id: 'dob',
      label: 'Date of birth',
      format: 'yyyy-mm-dd',
      value: '',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a validation error', () => {
    const { container } = renderWithTheme(DateInput, {
      id: 'dob',
      label: 'Date of birth',
      error: 'You failed at this',
      format: 'yyyy-mm-dd',
      value: '',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a help message', () => {
    const { container } = renderWithTheme(DateInput, {
      id: 'dob',
      label: 'Date of birth',
      help: 'This is a very cool input',
      format: 'yyyy-mm-dd',
      value: '',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with an info message', () => {
    const { container } = renderWithTheme(DateInput, {
      id: 'dob',
      label: 'Date of birth',
      info: 'You can set a cool value',
      format: 'yyyy-mm-dd',
      value: '',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a disabled input', () => {
    const { container } = renderWithTheme(DateInput, {
      id: 'dob',
      label: 'Date of birth',
      disabled: true,
      format: 'yyyy-mm-dd',
      value: '',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a button that triggers the calendar', () => {
    const { container } = renderWithTheme(DateInput, {
      id: 'dob',
      buttonProps: {
        label: 'Pick a date and call me Jim',
      },
      value: '',
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
