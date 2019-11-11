import '@testing-library/jest-dom/extend-expect';
import * as localStorageUtils from 'utils/localStorageUtils';
import {
  getMockCall,
  getPersistedMockCall,
  postMockCall,
  appCatalogsResponse,
  authTokenResponse,
  infoResponse,
  nodePoolsResponse,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  v5ClusterResponse,
  v5ClustersResponse,
  ORGANIZATION,
  V5_CLUSTER,
  USER_EMAIL,
} from 'test_utils/mockHttpCalls';
import {
  fireEvent,
  render,
  wait,
  waitForDomChange,
} from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import { ThemeProvider } from 'emotion-theming';
import { truncate } from 'lib/helpers';
import initialState from 'test_utils/initialState';
import React from 'react';
import theme from 'styles/theme';

// Components
import NodePoolDropdownMenu from '../NodePoolDropdownMenu';

// Mocking localStorage utils, otherwise no way to refreshUser and to set data
// to loca storage
jest.mock('utils/localStorageUtils');

// Cluster and route we are testing with.
const ROUTE = `/organizations/${ORGANIZATION}/clusters/${V5_CLUSTER.id}`;

it('renders all node pools in store', async () => {
  // Responses to requests
  const userInfoRequest = getMockCall('/v4/user/', userResponse);
  const infoRequest = getMockCall('/v4/info/', infoResponse);
  const organizationsRequest = getMockCall('/v4/organizations/', orgsResponse);
  const organizationRequest = getMockCall(
    `/v4/organizations/${ORGANIZATION}/`,
    orgResponse
  );
  const clustersRequest = getMockCall('/v4/clusters/', v5ClustersResponse);
  const clusterRequest = getPersistedMockCall(
    `/v5/clusters/${V5_CLUSTER.id}/`,
    v5ClusterResponse
  );
  const credentialsRequest = getMockCall(
    `/v4/organizations/${ORGANIZATION}/credentials/`
  );
  const releasesRequest = getMockCall('/v4/releases/', releasesResponse);
  const nodePoolsRequest = getPersistedMockCall(
    `/v5/clusters/${V5_CLUSTER.id}/nodepools/`,
    nodePoolsResponse
  );
  const appcatalogsRequest = getMockCall(
    '/v4/appcatalogs/',
    appCatalogsResponse
  );

  const div = document.createElement('div');
  const { getByText, findAllByTestId } = renderRouteWithStore(ROUTE, div, {});

  await wait(() => findAllByTestId('node-pool-id'));

  nodePoolsResponse.forEach(nodePool => {
    expect(getByText(nodePool.id)).toBeInTheDocument();
  });

  // Assert that the mocked responses got called, tell them to stop waiting for
  // a request.
  userInfoRequest.done();
  infoRequest.done();
  organizationsRequest.done();
  organizationRequest.done();
  clustersRequest.done();
  clusterRequest.done();
  credentialsRequest.done();
  releasesRequest.done();
  nodePoolsRequest.done();
  appcatalogsRequest.done();

  // TODO. Find out why we are performing two calls for each endpoint
  clusterRequest.persist(false);
  nodePoolsRequest.persist(false);
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

it.skip('patches node pool name correctly', async () => {
  const div = document.createElement('div');
  const { getAllByText, getByText, container } = renderRouteWithStore(
    ROUTE,
    div
  );

  const nodePools = Object.keys(initialState().entities.nodePools.items);
  const nodePool = initialState().entities.nodePools.items[nodePools[0]];
  const nodePoolName = initialState().entities.nodePools.items[nodePools[0]]
    .name;
  const newNodePoolName = 'New NP name';

  await wait(() => {
    // All mock node pools have the same first 14 characters.
    const nodePoolNameEls = getAllByText(truncate(nodePoolName, 14));
    fireEvent.click(nodePoolNameEls[0]);
  });

  container.querySelector(
    `input[value="${nodePoolName}"]`
  ).value = newNodePoolName;

  // TODO change it and look for rendered changes once we have API calls mocked
  // instead of mocked action creators
  const submitButton = getByText(/ok/i);
  fireEvent.click(submitButton);
  // expect(mockNodePoolPatch).toHaveBeenCalledTimes(1);
  // expect(mockNodePoolPatch).toHaveBeenCalledWith(V5_CLUSTER.id, nodePool, {
  //   name: newNodePoolName,
  // });
});

// The modal is opened calling a function that lives in the parent component of
// <NodePoolDropdownMenu>, so we can't test it in isolation, we need to render
// the full tree.
it.skip(`shows the modal when the button is clicked with default values and calls
  the action creator with the correct arguments`, async () => {
  const div = document.createElement('div');
  const state = initialState();

  const { getByText, getAllByText, getAllByTestId } = renderRouteWithStore(
    ROUTE,
    div,
    state
  );

  await wait(() => {
    getAllByTestId('node-pool-id')[0];
  });

  const nodePoolId = getAllByTestId('node-pool-id')[0].textContent;
  const nodePool = state.entities.nodePools.items[nodePoolId];
  fireEvent.click(getAllByText('•••')[0]);

  fireEvent.click(getByText(/edit scaling limits/i));
  const modalTitle = getByText(/edit scaling settings for/i);

  // Is the modal in the document?
  expect(modalTitle).toBeInTheDocument();

  // TODO expect correct values and call to action creator.
  // Continue when scaling modal development for NPs is finished.
});
