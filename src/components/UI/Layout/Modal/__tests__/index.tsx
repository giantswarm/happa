import { renderWithTheme } from 'test/renderUtils';

import { Simple } from '../stories/Simple';
import { WithFooter } from '../stories/WithFooter';

describe('Modal', () => {
  it('renders a closed modal', () => {
    const { container } = renderWithTheme(Simple, {
      title: 'Hello friend',
      children: 'Welcome to my new modal!',
      visible: false,
      onClose: jest.fn(),
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an opened modal', () => {
    const { container } = renderWithTheme(Simple, {
      title: 'Hello friend',
      children: 'Welcome to my new modal!',
      visible: true,
      onClose: jest.fn(),
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a modal with a footer', () => {
    const { container } = renderWithTheme(WithFooter, {
      title: 'Hello friend',
      children: 'Welcome to my new modal!',
      visible: true,
      footer: `I'm the footer around here`,
      onClose: jest.fn(),
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
