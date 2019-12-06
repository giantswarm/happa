import '@testing-library/jest-dom/extend-expect';
import {
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
} from 'test_utils/mockHttpCalls';
import { getNumberOfNodes } from 'utils/clusterUtils';
import { renderRouteWithStore } from 'test_utils/renderUtils';
import { wait } from '@testing-library/react';

// Cluster and route we are testing with.
const ROUTE = `/organizations/${ORGANIZATION}/clusters/${V4_CLUSTER.id}`;

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

it('renders all the v4 Azure cluster data correctly without nodes ready', async () => {
  const { getByText, getAllByText } = renderRouteWithStore(ROUTE);

  await wait(() => {
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  });
  expect(getAllByText(V4_CLUSTER.id)).toHaveLength(2);

  const apiEndpoint = getByText(v4AzureClusterResponse.api_endpoint);
  expect(apiEndpoint).toBeInTheDocument();

  const instance = getByText(V4_CLUSTER.AzureInstanceType);
  expect(instance).toBeInTheDocument();

  const nodes = getByText('Nodes').nextSibling;
  const nodesRunning = getNumberOfNodes({
    ...v4AzureClusterResponse,
    status: v4AzureClusterStatusResponse,
  });
  expect(nodes).toHaveTextContent(nodesRunning);
});

it.skip(`shows the v4 Azure cluster scaling modal when the button is clicked with default values and 
scales correctly`, async () => {});
