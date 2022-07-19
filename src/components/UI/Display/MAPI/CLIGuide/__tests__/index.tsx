import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'test/renderUtils';

import CLIGuide from '..';
import CLIGuidesList from '../CLIGuidesList';

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

describe('CLIGuidesList', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(CLIGuidesList, {
      title: 'Use the API to …',
      children: '',
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders the contents when open', async () => {
    const { container } = renderWithTheme(CLIGuidesList, {
      title: 'Use the API to …',
      children: <CLIGuide title='Get something from somewhere' />,
    });

    fireEvent.click(screen.getByRole('tab', { name: /Use the API to …/ }));

    expect(
      await screen.findByText('Get something from somewhere')
    ).toBeInTheDocument();

    expect(container.firstChild).toMatchSnapshot();
  });
});
