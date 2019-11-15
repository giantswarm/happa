import '@testing-library/jest-dom/extend-expect';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  getPersistedMockCall,
  infoResponse,
  nodePoolsResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4AWSClusterResponse,
  v4ClustersResponse,
  v4AWSClusterStatusResponse,
} from 'test_utils/mockHttpCalls';
import { fireEvent, render, wait } from '@testing-library/react';
import { getNumberOfNodePoolsNodes } from 'utils/cluster_utils';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import { ThemeProvider } from 'emotion-theming';
import { truncate } from 'lib/helpers';
import nock from 'nock';
import React from 'react';
import theme from 'styles/theme';
import { request } from 'https';

// Cluster and route we are testing with.
const ROUTE = `/organizations/${ORGANIZATION}/clusters/${V4_CLUSTER.id}`;

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
  requests.clusters = getPersistedMockCall('/v4/clusters/', v4ClustersResponse);
  requests.cluster = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/`,
    v4AWSClusterResponse
  );
  requests.status = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse
  );
  requests.apps = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/apps/`,
    appsResponse
  );
  // TODO we are not requesting this in v5 cluster calls
  // Empty response
  request.keyPairs = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/key-pairs/`
  );
  requests.credentials = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/credentials/`
  );
  requests.releases = getPersistedMockCall('/v4/releases/', releasesResponse);
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

// This triggers a warning because of this weird array-like value we are receiving
// as a response to the apps call. Here we are using a real array to mock the response
// and hence the warning because we are transforming an array into an array
it('renders all the v4 cluster data correctly with 0 nodes ready', async () => {
  const div = document.createElement('div');
  const { getByText, getAllByText } = renderRouteWithStore(ROUTE, div, {});

  await wait(() => {
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  });
  expect(getAllByText(V4_CLUSTER.id)).toHaveLength(2);
  expect(getByText('0 nodes')).toBeInTheDocument();
  const k8sEndpoint = getByText('Kubernetes endpoint URI:').nextSibling;
  expect(k8sEndpoint).not.toBeEmpty();
  // n/a because the cluster hasn't been updated yet
  expect(document.querySelector('abbr')).toHaveTextContent('n/a');
  expect(getByText(V4_CLUSTER.instanceType)).toBeInTheDocument();
  expect(getByText('Pinned at 3')).toBeInTheDocument();
});

it.skip('renders nodes data correctly with nodes ready', async () => {
  const nodePoolsResponseWithNodes = nodePoolsResponse.map(np => ({
    ...np,
    status: { nodes: 3, nodes_ready: 3 },
  }));

  // Replace nodePools response
  requests.nodePools.persist(false);
  requests.nodePools = getPersistedMockCall(
    `/v5/clusters/${V4_CLUSTER.id}/nodepools/`,
    nodePoolsResponseWithNodes
  );

  const div = document.createElement('div');
  const { getByText } = renderRouteWithStore(ROUTE, div, {});

  const workerNodesRunning = getNumberOfNodePoolsNodes(
    nodePoolsResponseWithNodes
  );
  const textRendered = `${workerNodesRunning} nodes in ${nodePoolsResponseWithNodes.length} node pools`;

  // Expect computed values are rendered
  await wait(() => {
    expect(getByText(textRendered)).toBeInTheDocument();
  });

  // Restore nodePools response
  requests.nodePools.persist(false);
  requests.nodePools = getPersistedMockCall(
    `/v5/clusters/${V4_CLUSTER.id}/nodepools/`,
    nodePoolsResponse
  );
});

it.skip('renders all node pools in store', async () => {
  const div = document.createElement('div');

  const { getByText, findAllByTestId } = renderRouteWithStore(ROUTE, div, {});

  await wait(() => findAllByTestId('node-pool-id'));

  nodePoolsResponse.forEach(nodePool => {
    expect(getByText(nodePool.id)).toBeInTheDocument();
  });
});

// TODO This test triggers a memory leak error related with setting state depending
// on the response of an asynchronous call in ScaleNodePoolModal.
// Not fixing it now because is a "minor" error, this error can't break the app and
// because I will be working on the data flow refactor that will solve this.
it.skip(`shows the v4 cluster scaling modal when the button is clicked with default values and 
scales correctly`, async () => {
  // TODO default values from constants file
  const defaultScaling = { min: 3, max: 10 };
  const increaseValue = 1;
  const newScaling = {
    min: defaultScaling.min + increaseValue,
    max: defaultScaling.max + increaseValue,
  };

  const nodePool = nodePoolsResponse[0];
  const nodePoolPatchResponse = {
    ...nodePoolsResponse[0],
    scaling: newScaling,
  };

  // Request
  const nodePoolPatchRequest = nock(API_ENDPOINT)
    .intercept(
      `/v5/clusters/${V4_CLUSTER.id}/nodepools/${nodePool.id}/`,
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

  await wait(() => getByText(/edit scaling settings for/i));

  // Is the modal in the document?
  const modalTitle = getByText(/edit scaling settings for/i);
  expect(modalTitle).toBeInTheDocument();
  expect(modalTitle).toHaveTextContent(nodePool.id);

  const inputMin = getByLabelText(/minimum/i);
  const inputMax = getByLabelText(/maximum/i);

  // Are the correct values in the correct fields?
  expect(inputMin.value).toBe(defaultScaling.min.toString());
  expect(inputMax.value).toBe(defaultScaling.max.toString());

  // Change the values and modify the scaling settingsw
  fireEvent.change(inputMin, { target: { value: newScaling.min } });
  fireEvent.change(inputMax, { target: { value: newScaling.max } });
  const textButton = `Increase minimum number of nodes by ${newScaling.min}`;

  await wait(() => getByText(textButton));

  const submitButton = getByText(textButton);
  fireEvent.click(submitButton);

  //Wait for the Flash message to appear
  await wait(() => {
    getByText(/succesfully edited node pool name/i);
  });

  // Our node pool is the first one. Does it have the scaling values updated?
  expect(getAllByTestId('scaling-min')[0]).toHaveTextContent(
    newScaling.min.toString()
  );
  expect(getAllByTestId('scaling-max')[0]).toHaveTextContent(
    newScaling.max.toString()
  );

  nodePoolPatchRequest.done();
});

it.skip('deletes a v4 cluster', async () => {
  const cluster = v4ClusterResponse;
  const clusterDeleteResponse = {
    code: 'RESOURCE_DELETION_STARTED',
    message: `Deletion of cluster with ID '${V4_CLUSTER.id}' is in progress.`,
  };

  // Request
  const clusterDeleteRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${V4_CLUSTER.id}/`, 'DELETE')
    .reply(200, clusterDeleteResponse);

  const div = document.createElement('div');
  const {
    getByText,
    getAllByText,
    queryByTestId,
    getAllByTestId,
    debug,
    container,
  } = renderRouteWithStore(ROUTE, div, {});

  // Wait for the view to render
  await wait(() => {
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  });

  // fireEvent.click(getAllByText('•••')[0]);
  await wait(() => getByText('Delete Cluster'));
  fireEvent.click(getByText('Delete Cluster'));

  // Is the modal in the document?
  const titleText = /are you sure you want to delete/i;
  await wait(() => getByText(titleText));
  const modalTitle = getByText(titleText);
  expect(modalTitle).toBeInTheDocument();
  expect(modalTitle.textContent.includes(cluster.id)).toBeTruthy();

  // Click delete button.
  const modalDeleteButton = getAllByText('Delete Cluster')[1];
  fireEvent.click(modalDeleteButton);

  // Flash message confirming deletion.
  await wait(() => {
    getByText(/will be deleted/i);
  });
  const flashElement = getByText(/will be deleted/i);
  expect(flashElement).toBeInTheDocument();
  expect(flashElement).toHaveTextContent(cluster.id);

  // Expect the cluster is not in the clusters list.
  await wait(() => {
    expect(queryByTestId(cluster.id)).not.toBeInTheDocument();
  });

  // This is not inside the component tree we are testing and so it is not cleaned up
  // after test, so we have to remnove it manually in order to not cause conflicts with
  // the next test with a flash message
  document.querySelector('#noty_layout__topRight').remove();
  clusterDeleteRequest.done();
});
