import '@testing-library/jest-dom/extend-expect';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  getPersistedMockCall,
  infoResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  v5ClustersResponse,
} from 'test_utils/mockHttpCalls';
import { fireEvent, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import nock from 'nock';

// Tests setup
const requests = {};

// Responses to requests
beforeAll(() => {
  requests.userInfo = getPersistedMockCall('/v4/user/', userResponse);
  requests.releases = getPersistedMockCall('/v4/releases/', releasesResponse);
  requests.info = getPersistedMockCall('/v4/info/', infoResponse);
  requests.organizations = getPersistedMockCall(
    '/v4/organizations/',
    orgsResponse
  );
  requests.organization = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/`,
    orgResponse
  );
  requests.clusters = getPersistedMockCall('/v4/clusters/');
  requests.credentials = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/credentials/`
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
it('creates a v5 cluster and redirect to details view', async () => {
  // Cluster response
  const v5ClusterCreationResponse = {
    api_endpoint: 'https://api.xich7.k8s.gauss.eu-central-1.aws.gigantic.io',
    create_date: '2019-11-19T08:33:38Z',
    id: 'xich7',
    master: { availability_zone: 'eu-central-1a' },
    name: 'V5 Cluster creation test',
    owner: 'acme',
    release_version: '10.0.0',
  };

  // Cluster POST request
  const v5ClusterCreationRequest = nock(API_ENDPOINT)
    .intercept(`/v5/clusters/`, 'POST')
    .reply(200, v5ClusterCreationResponse, { location: '/v5/clusters/xich7/' });

  // Node Pools POST response
  const nodePoolCreationResponse = {
    id: '9sud8',
    name: 'Node Pool #1',
    availability_zones: ['eu-central-1a'],
    scaling: { min: 3, max: 10 },
    node_spec: {
      aws: { instance_type: 'm4.xlarge' },
      volume_sizes_gb: { docker: 100, kubelet: 100 },
    },
    status: { nodes: 0, nodes_ready: 0 },
    subnet: '10.1.7.0/24',
  };

  // Node pools POST request
  const nodePoolCreationRequest = nock(API_ENDPOINT)
    .intercept(
      `/v5/clusters/${v5ClusterCreationResponse.id}/nodepools/`,
      'POST'
    )
    .reply(200, nodePoolCreationResponse);

  // Node pools get
  const nodePoolsRequest = getPersistedMockCall(
    `/v5/clusters/${v5ClusterCreationResponse.id}/nodepools/`,
    [nodePoolCreationResponse]
  );

  // Clusters GET request
  requests.clusters = getPersistedMockCall('/v4/clusters/', [
    v5ClusterCreationResponse,
  ]);

  // Cluster GET request
  const clusterRequest = getPersistedMockCall(
    `/v5/clusters/${v5ClusterCreationResponse.id}/`,
    v5ClusterCreationResponse
  );

  const div = document.createElement('div');
  const { debug, getAllByText, getByText, getByTestId } = renderRouteWithStore(
    '/organizations/acme/clusters/new/',
    div,
    {}
  );

  await wait(() => {
    getByText('Create Cluster');
    // Is this the v5
    expect(getByTestId('nodepool-cluster-creation-view')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Create Cluster'));
  await wait(() => debug(getByTestId('cluster-details-view')));

  // Expect we have been redirected to the cluster details view
  expect(getByTestId('cluster-details-view')).toBeInTheDocument();
  expect(getAllByText(v5ClusterCreationResponse.id)[0]).toBeInTheDocument();
  expect(getByText(nodePoolCreationResponse.id)).toBeInTheDocument();

  v5ClusterCreationRequest.done();
  nodePoolCreationRequest.done();

  clusterRequest.persist(false);
  nodePoolsRequest.persist(false);

  // Restore clusters request
  requests.clusters.persist(false);
  requests.clusters = getPersistedMockCall('/v4/clusters/', v5ClustersResponse);
});

it('switches to v4 cluster creation form, creates a v4 cluster and redirect to details view', async () => {
  // 'cluster-creation-view'
});
