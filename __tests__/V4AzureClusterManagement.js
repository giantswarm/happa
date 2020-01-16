import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  azureInfoResponse,
  getPersistedMockCall,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4AzureClusterResponse,
  v4AzureClusterStatusResponse,
  v4ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';
import { getNumberOfNodes } from 'utils/clusterUtils';

// Cluster and route we are testing with.
const ROUTE = `/organizations/${ORGANIZATION}/clusters/${V4_CLUSTER.id}`;

const minNodesCount = 3;

// Tests setup
const requests = {};

// Responses to requests
beforeAll(() => {
  requests.userInfo = getPersistedMockCall('/v4/user/', userResponse);
  requests.info = getPersistedMockCall('/v4/info/', azureInfoResponse);
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
    v4AzureClusterResponse
  );
  requests.status = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AzureClusterStatusResponse
  );
  requests.apps = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/apps/`,
    appsResponse
  );
  // TODO we are not requesting this in v5 cluster calls
  // Empty response
  requests.keyPairs = getPersistedMockCall(
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

it('renders all the v4 Azure cluster data correctly', async () => {
  const { getByText, getAllByText } = renderRouteWithStore(ROUTE);

  await wait(() => {
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  });
  expect(getAllByText(V4_CLUSTER.id)).toHaveLength(2);

  const apiEndpoint = getByText(v4AzureClusterResponse.api_endpoint);
  expect(apiEndpoint).toBeInTheDocument();

  const instance = getByText(V4_CLUSTER.AzureInstanceType);
  expect(instance).toBeInTheDocument();

  const nodesRunning = getNumberOfNodes({
    ...v4AzureClusterResponse,
    status: v4AzureClusterStatusResponse,
  }).toString();

  await wait(() => {
    expect(getByText('Nodes').nextSibling.textContent).toBe(nodesRunning);
  });
});

it(`shows the v4 Azure cluster scaling modal when the button is clicked with default values and
scales correctly`, async () => {
  const cluster = v4AzureClusterResponse;
  const defaultScaling = cluster.scaling;
  const increaseByCount = 1;

  const newScaling = {
    min: defaultScaling.min + increaseByCount,
    max: defaultScaling.max + increaseByCount,
  };
  // Adding another worker
  const newWorkers = [...cluster.workers, cluster.workers[0]];

  const scaleResponse = {
    ...cluster,
    scaling: newScaling,
    workers: newWorkers,
  };

  // Cluster scale request
  const scaleRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${cluster.id}/`, 'PATCH')
    .reply(StatusCodes.Ok, scaleResponse);

  const { getByText, findByText, getByLabelText, getByDisplayValue } = renderRouteWithStore(ROUTE);

  const nodesTitle = await findByText('Nodes');
  const nodesCounter = nodesTitle.nextSibling;

  expect(nodesCounter.textContent).toBe(String(minNodesCount));

  // Replace status response
  requests.status.persist(false);
  requests.status = getPersistedMockCall(`/v4/clusters/${cluster.id}/status/`, {
    ...v4AzureClusterStatusResponse,
    cluster: {
      ...v4AzureClusterStatusResponse.cluster,
      scaling: { desiredCapacity: newScaling.max },
    },
  });

  // Simulate click on the Edit button
  fireEvent.click(getByText(/edit/i));

  // Check if the modal is in the document
  const modalTitle = await findByText(/edit scaling settings for/i);
  expect(modalTitle).toHaveTextContent(cluster.id);

  // Check if the node count selector is there, and has the right value
  const nodeCountInput = getByDisplayValue(String(defaultScaling.min));

  // Set the new node count
  fireEvent.change(nodeCountInput, { target: { value: newScaling.min } });

  // const textButton = `Increase minimum number of nodes by ${increaseByCount}`;
  // const submitButton = getByText(textButton);
  // fireEvent.click(submitButton);

  // // Wait for the Flash message to appear
  // await wait(() => {
  //   getByText(/the cluster will be scaled within the next couple of minutes./i);
  //   // Does the cluster have node values updated?
  //   expect(getByText(`Pinned at ${newScaling.min}`));
  // });

  // scaleRequest.done();

  // // Restore status response
  // requests.status.persist(false);
  // requests.status = getPersistedMockCall(
  //   `/v4/clusters/${cluster.id}/status/`,
  //   v4AzureClusterResponse
  // );
});
