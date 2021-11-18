import { renderWithTheme } from 'test/renderUtils';

import TextArea from '..';

describe('TextArea', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(TextArea, {
      value: 'The quick brown fox jumps over the lazy dog',
      placeholder: 'Please write a story',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a label', () => {
    const { container } = renderWithTheme(TextArea, {
      value: 'The quick brown fox jumps over the lazy dog',
      label: 'A helpful area of text',
      id: 'some-text',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a validation error', () => {
    const { container } = renderWithTheme(TextArea, {
      value: 'The quick brown fox jumps over the lazy dog',
      error: 'There is something very wrong!',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with a help message', () => {
    const { container } = renderWithTheme(TextArea, {
      value: 'The quick brown fox jumps over the lazy dog',
      help: 'A helpful message',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an input with an info message', () => {
    const { container } = renderWithTheme(TextArea, {
      value: 'The quick brown fox jumps over the lazy dog',
      info: 'Some useful information',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a disabled input', () => {
    const { container } = renderWithTheme(TextArea, {
      value: 'The quick brown fox jumps over the lazy dog',
      disabled: true,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
