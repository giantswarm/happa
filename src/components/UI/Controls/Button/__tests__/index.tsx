import { renderWithTheme } from 'testUtils/renderUtils';

import Button from '..';

type ComponentProps = React.ComponentPropsWithoutRef<typeof Button>;

describe('Button', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
    } as ComponentProps);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a primary button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      primary: true,
    } as ComponentProps);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a secondary button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      secondary: true,
    } as ComponentProps);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a danger button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      danger: true,
    } as ComponentProps);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a warning button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      warning: true,
    } as ComponentProps);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a link button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      link: true,
    } as ComponentProps);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a button with a loading animation', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      loading: true,
    } as ComponentProps);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a disabled button', () => {
    const { container } = renderWithTheme(Button, {
      children: 'Hi friends',
      disabled: true,
    } as ComponentProps);

    expect(container.firstChild).toMatchSnapshot();
  });
});
