import { Text } from 'grommet';
import * as React from 'react';
import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailWidget from '..';

describe('ClusterDetailWidget', () => {
  it('renders a simple widget', () => {
    const { container } = renderWithTheme(ClusterDetailWidget, {
      title: 'Some widget',
      children: <Text>Some content</Text>,
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a inline widget', () => {
    const { container } = renderWithTheme(ClusterDetailWidget, {
      title: 'Some widget',
      inline: true,
      children: <Text>Some content</Text>,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
