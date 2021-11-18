import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from 'test/renderUtils';

import CLIGuide from '..';

describe('CLIGuide', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(CLIGuide, {
      title: 'Get something from somewhere',
      children: '',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders the contents when open', async () => {
    const { container } = renderWithTheme(CLIGuide, {
      title: 'Get something from somewhere',
      children: 'Just some content',
    });

    fireEvent.click(
      screen.getByRole('tab', { name: /Get something from somewhere/ })
    );

    expect(await screen.findByText('Just some content')).toBeInTheDocument();

    expect(container.firstChild).toMatchSnapshot();
  });
});
