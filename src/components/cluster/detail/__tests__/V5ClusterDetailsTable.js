import '@testing-library/jest-dom/extend-expect';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  getPersistedMockCall,
  infoResponse,
  nodePoolsResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V5_CLUSTER,
  v5ClusterResponse,
  v5ClustersResponse,
} from 'test_utils/mockHttpCalls';
import { fireEvent, render, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import { ThemeProvider } from 'emotion-theming';
import { truncate } from 'lib/helpers';
import initialState from 'test_utils/initialState';
import nock from 'nock';
import React from 'react';
import theme from 'styles/theme';

// Components
import NodePoolDropdownMenu from '../NodePoolDropdownMenu';

// Cluster and route we are testing with.
const ROUTE = `/organizations/${ORGANIZATION}/clusters/${V5_CLUSTER.id}`;

// Tests setup
const requests = {};

// Responses to requests
beforeAll(() => {
  requests.userInfo = getPersistedMockCall('/v4/user/', userResponse);
  requests.info = getPersistedMockCall('/v4/info/', infoResponse);
  requests.organizations = getPersistedMockCall(
    '/v4/organizations/',
    orgsResponse
  );
  requests.organization = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/`,
    orgResponse
  );
  requests.clusters = getPersistedMockCall('/v4/clusters/', v5ClustersResponse);
  requests.cluster = getPersistedMockCall(
    `/v5/clusters/${V5_CLUSTER.id}/`,
    v5ClusterResponse
  );
  requests.credentials = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/credentials/`
  );
  requests.releases = getPersistedMockCall('/v4/releases/', releasesResponse);
  requests.nodePools = getPersistedMockCall(
    `/v5/clusters/${V5_CLUSTER.id}/nodepools/`,
    nodePoolsResponse
  );
  requests.appcatalogs = getPersistedMockCall(
    '/v4/appcatalogs/',
    appCatalogsResponse
  );
});

// Stop persisting responses
afterAll(() => {
  Object.keys(requests).forEach(req => {
    requests[req].persist(false);
  });
});

/************ TESTS ************/

it('renders all node pools in store', async () => {
  const div = document.createElement('div');

  const { getByText, findAllByTestId, debug } = renderRouteWithStore(
    ROUTE,
    div,
    {},
    {
      user:
        '"{"email":"developer@giantswarm.io","auth":{"scheme":"giantswarm","token":"a-valid-token"},"isAdmin":true}"',
    }
  );

  debug();
  await wait(() => findAllByTestId('node-pool-id'));

  nodePoolsResponse.forEach(nodePool => {
    expect(getByText(nodePool.id)).toBeInTheDocument();
  });

  // TODO. Find out why we are performing two calls for each endpoint
  // requests.clusterRequest.persist(false);
  // requests.nodePoolsRequest.persist(false);
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

it('patches node pool name correctly', async () => {
  const newNodePoolName = 'New NP name';
  const nodePoolName = nodePoolsResponse[0].name;

  // Response to request should be the exact same NP with the new name
  const nodePoolPatchResponse = {
    ...nodePoolsResponse[0],
    name: newNodePoolName,
  };

  // Request
  const nodePoolPatchRequest = nock(API_ENDPOINT)
    .intercept(
      `/v5/clusters/${V5_CLUSTER.id}/nodepools/${nodePoolsResponse[0].id}/`,
      'PATCH'
    )
    .reply(200, nodePoolPatchResponse);

  // Mounting
  const div = document.createElement('div');
  const { getAllByText, getByText, container, debug } = renderRouteWithStore(
    ROUTE,
    div,
    {},
    {
      user:
        '"{"email":"developer@giantswarm.io","auth":{"scheme":"giantswarm","token":"a-valid-token"},"isAdmin":true}"',
    }
  );

  await wait(() => {
    // All mock node pools have the same first 14 characters.
    const nodePoolNameEl = getAllByText(truncate(nodePoolName, 14));
    fireEvent.click(nodePoolNameEl[0]);
  });

  // Write the new name and submit it
  container.querySelector(
    `input[value="${nodePoolName}"]`
  ).value = newNodePoolName;

  const submitButton = getByText(/ok/i);
  fireEvent.click(submitButton);

  //Wait for the Flash message to appear
  await wait(() => {
    getByText(/succesfully edited node pool name/i);
  });

  // Is the new NP name in the document?
  expect(getByText(newNodePoolName)).toBeInTheDocument();

  // Assert that the mocked responses got called, tell them to stop waiting for
  // a request.
  nodePoolPatchRequest.done();
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
    state,
    {
      user:
        '"{"email":"developer@giantswarm.io","auth":{"scheme":"giantswarm","token":"a-valid-token"},"isAdmin":true}"',
    }
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
