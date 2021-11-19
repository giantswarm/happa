import { renderWithTheme } from 'test/renderUtils';

import Button from '..';

describe('Button', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a primary button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      primary: true,
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a secondary button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      secondary: true,
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a danger button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      danger: true,
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a warning button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      warning: true,
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a link button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      link: true,
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a button with a loading animation', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      loading: true,
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a disabled button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      disabled: true,
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
