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
import nock from 'nock';
import React from 'react';
import theme from 'styles/theme';

// Components
import NodePoolDropdownMenu from 'cluster/detail/NodePoolDropdownMenu';

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
    {}
  );

  debug();
  await wait(() => findAllByTestId('node-pool-id'));

  nodePoolsResponse.forEach(nodePool => {
    expect(getByText(nodePool.id)).toBeInTheDocument();
  });
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

it('patches node pool name correctly and re-sort node pools accordingly', async () => {
  const newNodePoolName = 'New NP name';
  const nodePoolName = nodePoolsResponse[0].name;
  const nodePoolId = nodePoolsResponse[0].id;

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
  const { getAllByTestId, getByText, container } = renderRouteWithStore(
    ROUTE,
    div,
    {}
  );

  await wait(() => getByText(truncate(nodePoolName, 14)));

  // All mock node pools have the same first 14 characters.
  const nodePoolNameEl = getByText(truncate(nodePoolName, 14));
  const nodePools = getAllByTestId('node-pool-id');

  // Is this NP the first in the list?
  expect(nodePools[0]).toContainHTML(nodePoolNameEl);
  fireEvent.click(nodePoolNameEl);

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

  // Is it now the 2nd node pool in list?
  const reSortedNodePools = getAllByTestId('node-pool-id');
  expect(reSortedNodePools[1]).toHaveTextContent(nodePoolId);

  // Assert that the mocked responses got called, tell them to stop waiting for
  // a request.
  nodePoolPatchRequest.done();
});

// TO BE FINISHED YET
it(`shows the scaling modal when the button is clicked with default values and scales 
node pools correctly`, async () => {
  const nodePool = nodePoolsResponse[0];
  const newScaling = { min: 4, max: 11 };
  const nodePoolPatchResponse = {
    ...nodePoolsResponse[0],
    scaling: newScaling,
  };

  // Request
  const nodePoolPatchRequest = nock(API_ENDPOINT)
    .intercept(
      `/v5/clusters/${V5_CLUSTER.id}/nodepools/${nodePoolsResponse[0].id}/`,
      'PATCH'
    )
    .reply(200, nodePoolPatchResponse);

  const div = document.createElement('div');
  const {
    getByText,
    getAllByText,
    getAllByTestId,
    getByLabelText,
  } = renderRouteWithStore(ROUTE, div, {});

  await wait(() => getAllByTestId('node-pool-id'));

  // Expect first nodePool is
  const nodePoolId = getAllByTestId('node-pool-id')[0].textContent;
  expect(nodePoolId).toBe(nodePool.id);

  fireEvent.click(getAllByText('•••')[0]);
  fireEvent.click(getByText(/edit scaling limits/i));
  const modalTitle = getByText(/edit scaling settings for/i);
  expect(modalTitle).toHaveTextContent('3jx');

  // Is the modal in the document?
  expect(modalTitle).toBeInTheDocument();

  // Can't edit inputs because of bootstrap implementation of inputs, or at least
  // that' what I guess, so mocking the patch response and expecting to see the values
  // in the view:
});
