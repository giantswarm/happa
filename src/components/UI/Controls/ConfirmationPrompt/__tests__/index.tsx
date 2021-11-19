import { renderWithTheme } from 'test/renderUtils';

import ConfirmationPrompt from '..';

describe('ConfirmationPrompt', () => {
  it('renders a simple component', () => {
    const { container } = renderWithTheme(ConfirmationPrompt, {
      children: 'Hi friends',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a component with buttons', () => {
    const { container } = renderWithTheme(ConfirmationPrompt, {
      children: 'Hi friends',
      onConfirm: () => {},
      onCancel: () => {},
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a component with a title', () => {
    const { container } = renderWithTheme(ConfirmationPrompt, {
      children: 'Welcome to my prompt',
      title: 'Hi friends',
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
