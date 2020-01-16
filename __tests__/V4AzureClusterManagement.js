import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  azureInfoResponse,
  getMockCall,
  getMockCallTimes,
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

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

// Responses to requests
beforeEach(() => {
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/info/', azureInfoResponse);
  getMockCall('/v4/organizations/', orgsResponse);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/`, orgResponse, 2);
  getMockCall('/v4/clusters/', v4ClustersResponse);
  // eslint-disable-next-line no-magic-numbers
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/`, v4AzureClusterResponse, 4);
  getMockCallTimes(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AzureClusterStatusResponse,
    // eslint-disable-next-line no-magic-numbers
    4
  );
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`, [], 2);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
  getMockCall('/v4/releases/', releasesResponse);
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
});

// Stop persisting responses
afterEach(() => {
  expect(nock.isDone());
  nock.cleanAll();
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
  // Add another worker
  const newWorkers = [...cluster.workers, cluster.workers[0]];

  const scaleResponse = {
    ...cluster,
    scaling: newScaling,
    workers: newWorkers,
  };

  getMockCall(`/v4/clusters/${cluster.id}/status/`, {
    ...v4AzureClusterStatusResponse,
    cluster: {
      ...v4AzureClusterStatusResponse.cluster,
      scaling: { desiredCapacity: newScaling.max },
    },
  });

  // Cluster scale request
  const scaleRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${cluster.id}/`, 'PATCH')
    .reply(StatusCodes.Ok, scaleResponse);

  const { getByText, findByText, getByDisplayValue } = renderRouteWithStore(
    ROUTE
  );

  const nodesTitle = await findByText('Nodes');
  const nodesCounter = nodesTitle.nextSibling;

  expect(nodesCounter).toHaveTextContent(String(minNodesCount));

  // Simulate click on the Edit button
  fireEvent.click(getByText(/edit/i));

  // Check if the modal is in the document
  const modalTitle = await findByText(/edit scaling settings for/i);
  expect(modalTitle).toHaveTextContent(cluster.id);

  // Check if the node count selector is there, and has the right value
  const nodeCountInput = getByDisplayValue(String(defaultScaling.min));

  // Set the new node count
  fireEvent.change(nodeCountInput, { target: { value: newScaling.min } });

  const textButton = `Add ${increaseByCount} worker node`;
  const submitButton = getByText(textButton);
  fireEvent.click(submitButton);

  await findByText(
    /the cluster will be scaled within the next couple of minutes./i
  );
  expect(nodesCounter).toHaveTextContent(String(newScaling.min));

  scaleRequest.done();
});
