import 'jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
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
jest.mock('utils/localStorageUtils');

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

/** TODO This test is failing because ClusterDetailView is not loading.
 * Steps I think we should folow to solve this:
 *  1. Learn how to mock the redux store because I think that this is the problem here
 *  2. Extract providers and mocked data into reusable wrapping functions
 * *
 * Alternative approach: use Cypress for these kind of testing where different
 * components are involved.
 */
it('shows the modal when the button is clicked', async () => {
  const div = document.createElement('div');
  const store = configureStore(initialState);

  // localStorageUtils.fetchSelectedOrganizationFromStorage = jest.fn(
  //   () => 'acme'
  // );

  const { getAllByText, getByText, getByRole, getAllByRole, debug } = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter
          initialEntries={['/organizations/acme/clusters/m0ckd/np']}
        >
          <Layout>
            <ClusterDetailIndex
            // cluster={initialState.entities.clusters.items['m0ckd']}
            // clusterId='m0ckd'
            // nodePools={initialState.entities.nodePools}
            // organizationId='acme'
            >
              <ClusterDetailView>
                {/* <ClusterDetailNodePoolsTable
                  nodePool={mockedNodePool}
                ></ClusterDetailNodePoolsTable> */}
              </ClusterDetailView>
            </ClusterDetailIndex>
          </Layout>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
    div
  );

  // await wait(() => debug(store.getState()));
  await wait(() => fireEvent.click(getAllByText('•••')[0]));
  fireEvent.click(getByText(/edit scaling limits/i));
  const modalTitle = getByText(/edit scaling settings for/i);
  expect(modalTitle).toBeInTheDocument();
});
