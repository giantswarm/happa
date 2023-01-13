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
      screen.getByRole('button', { name: /Get something from somewhere/ })
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
      children: [
        // eslint-disable-next-line react/jsx-key
        <CLIGuide title='Get something from somewhere' />,
        // eslint-disable-next-line react/jsx-key
        <CLIGuide title='Get something else from somewhere else' />,
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: /Use the API to …/ }));

    expect(
      await screen.findByText('Get something from somewhere')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Get something else from somewhere else')
    ).toBeInTheDocument();

    expect(container.firstChild).toMatchSnapshot();
  });

  it(`renders the children as-is if there is only one`, () => {
    const { container } = renderWithTheme(CLIGuidesList, {
      title: 'Use the API to …',
      children: (
        <>
          {null}
          <CLIGuide title='Get something from somewhere' />
          {false}
        </>
      ),
    });

    expect(
      screen.queryByRole('button', { name: /Use the API to …/ })
    ).not.toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
