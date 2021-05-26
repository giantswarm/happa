import { renderWithTheme } from 'testUtils/renderUtils';

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
});
