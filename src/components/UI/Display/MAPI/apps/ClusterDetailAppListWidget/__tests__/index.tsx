import { Text } from 'grommet';
import * as React from 'react';
import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailAppListWidget from '..';

describe('ClusterDetailAppListWidget', () => {
  it('renders a simple widget', () => {
    const { container } = renderWithTheme(ClusterDetailAppListWidget, {
      title: 'Some widget',
      children: <Text>Some content</Text>,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
