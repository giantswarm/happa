import 'jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { renderRouteWithStore } from 'test_utils/renderRoute';
import { ThemeProvider } from 'emotion-theming';
import configureStore from 'stores/configureStore';
import initialState from 'test_utils/initialState';
import mockedNodePool from 'test_utils/mocked_node_pool';
import React from 'react';
import theme from 'styles/theme';

// Components
import ClusterDetailIndex from '../index';
import ClusterDetailNodePoolsTable from '../cluster_detail_node_pools_table';
import ClusterDetailView from '../cluster_detail_view';
import Layout from 'layout';
import NodePool from '../node_pool';
import NodePoolDropdownMenu from '../node_pool_dropdown_menu';

// Mocks
// jest.mock('utils/localStorageUtils');

jest.mock('actions/userActions', () => {
  return {
    refreshUserInfo: jest.fn(() => () => Promise.resolve()),
  };
});

jest.mock('actions/organizationActions', () => {
  return {
    organizationsLoad: jest.fn(() => () => Promise.resolve()),
    organizationCredentialsLoad: jest.fn(() => () => Promise.resolve()),
  };
});

jest.mock('actions/clusterActions', () => {
  return {
    clustersLoad: jest.fn(() => () => Promise.resolve()),
    clusterLoadDetails: jest.fn(() => () => Promise.resolve()),
    clusterLoadKeyPairs: jest.fn(() => () => Promise.resolve()),
  };
});

jest.mock('actions/releaseActions', () => {
  return {
    loadReleases: jest.fn(() => () => Promise.resolve()),
  };
});

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
  const store = configureStore(initialState);

  const { getAllByText, getByText } = renderRouteWithStore(
    '/organizations/acme/clusters/m0ckd/np',
    div
  );

  await wait(() => fireEvent.click(getAllByText('•••')[0]));
  fireEvent.click(getByText(/edit scaling limits/i));
  const modalTitle = getByText(/edit scaling settings for/i);
  expect(modalTitle).toBeInTheDocument();
});
