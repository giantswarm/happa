import '@testing-library/jest-dom/extend-expect';
import {
  appCatalogsResponse,
  appsResponse,
  KVMInfoResponse,
  getPersistedMockCall,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4KVMClusterResponse,
  v4KVMClusterStatusResponse,
  v4ClustersResponse,
} from 'test_utils/mockHttpCalls';
import { getNumberOfNodes } from 'utils/cluster_utils';
import { renderRouteWithStore } from 'test_utils/renderUtils';
import { wait, within } from '@testing-library/react';

// Cluster and route we are testing with.
const ROUTE = `/organizations/${ORGANIZATION}/clusters/${V4_CLUSTER.id}`;

// Tests setup
const requests = {};

// Responses to requests
beforeAll(() => {
  requests.userInfo = getPersistedMockCall('/v4/user/', userResponse);
  requests.info = getPersistedMockCall('/v4/info/', KVMInfoResponse);
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
    v4KVMClusterResponse
  );
  requests.status = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4KVMClusterStatusResponse
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

it('renders all the v4 KVM cluster data correctly without nodes ready', async () => {
  const div = document.createElement('div');
  const { getByText, getAllByText, debug } = renderRouteWithStore(
    ROUTE,
    div,
    {}
  );

  await wait(() => {
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  });
  expect(getAllByText(V4_CLUSTER.id)).toHaveLength(2);

  const apiEndpoint = getByText(v4KVMClusterResponse.api_endpoint);
  expect(apiEndpoint).toBeInTheDocument();

  const portsInResponse = v4KVMClusterResponse.kvm.port_mappings;
  const portsContainer = getByText('Ingress ports:');

  portsInResponse.forEach(mapping => {
    const protocol = mapping.protocol.toUpperCase();
    const html = `<dt>${protocol}</dt><dd>${mapping.port}</dd>`;
    expect(portsContainer).toContainHTML(html);
  });

  const nodes = getByText('Nodes').nextSibling;
  const nodesRunning = getNumberOfNodes({
    ...v4KVMClusterResponse,
    status: v4KVMClusterStatusResponse,
  });
  expect(nodes).toHaveTextContent(nodesRunning);
});

it.skip(`shows the v4 KVM cluster scaling modal when the button is clicked with default values and 
scales correctly`, async () => {});
