import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render } from '@testing-library/react';
// Components
import NodePoolDropdownMenu from 'Cluster/ClusterDetail/NodePoolDropdownMenu';
import React from 'react';
import theme from 'styles/theme';
import ThemeProvider from 'ThemeProvider';
// Not really needed actually. Keeping it by now as an example of simple test without store.
it('shows the dropdown when the three dots button is clicked', () => {
  const { getByText, getByRole } = render(
    <ThemeProvider theme={theme}>
      <NodePoolDropdownMenu render={{ isOpen: true }} />
    </ThemeProvider>
  );
  fireEvent.click(getByText('•••'));
  const menu = getByRole('menu');
  expect(menu).toBeInTheDocument();
});
