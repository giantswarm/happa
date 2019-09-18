import 'jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import theme from 'styles/theme';

// Components
import NodePoolDropdownMenu from '../node_pool_dropdown_menu';

// Mock actions to return nothing, we don't want them perform API calls and we don't
// want them to return any values either cause we are using a mocked store.
jest.mock('actions/userActions');
jest.mock('actions/organizationActions');
jest.mock('actions/clusterActions');
jest.mock('actions/releaseActions');

it('shows the dropdown when the three dots button is clicked', () => {
  const div = document.createElement('div');
  const { getByText, getByRole } = render(
    <ThemeProvider theme={theme}>
      <NodePoolDropdownMenu render={{ isOpen: true }} />
    </ThemeProvider>,
    div
  );
  fireEvent.click(getByText('•••'));
  const menu = getByRole('menu');
  expect(menu).toBeInTheDocument();
});

it('renders all node pools passed as props', () => {
  // To be implemented
});

it('patches node pool name correctly', () => {
  // To be implemented
});

// The modal is opened calling a function that lives in the parent component of
// <NodePoolDropdownMenu>, so we can't test it in isolation, we need to render
// the full tree.
it('shows the modal when the button is clicked', async () => {
  const div = document.createElement('div');
  const { getAllByText, getByText } = renderRouteWithStore(
    '/organizations/acme/clusters/m0ckd/np',
    div
  );

  await wait(() => fireEvent.click(getAllByText('•••')[0]));
  fireEvent.click(getByText(/edit scaling limits/i));
  const modalTitle = getByText(/edit scaling settings for/i);
  expect(modalTitle).toBeInTheDocument();
});
