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
  v4AWSClusterStatusResponse,
  appsResponse,
} from 'test_utils/mockHttpCalls';
import { fireEvent, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import nock from 'nock';
import { within } from '@testing-library/dom';

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
  const v5ClusterResponse = {
    api_endpoint: 'https://api.xich7.k8s.gauss.eu-central-1.aws.gigantic.io',
    create_date: '2019-11-19T08:33:38Z',
    id: 'xich7',
    master: { availability_zone: 'eu-central-1a' },
    name: 'V5 Cluster creation test',
    owner: 'acme',
    release_version: '10.0.0',
  };

  const v5ClusterCreationResponse = {
    code: 'RESOURCE_CREATED',
    message: `The cluster with ID ${v5ClusterResponse.id} has been created.`,
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
    .intercept(`/v5/clusters/${v5ClusterResponse.id}/nodepools/`, 'POST')
    .reply(200, nodePoolCreationResponse);

  // Node pools get
  const nodePoolsRequest = getPersistedMockCall(
    `/v5/clusters/${v5ClusterResponse.id}/nodepools/`,
    [nodePoolCreationResponse]
  );

  // Clusters GET request
  requests.clusters = getPersistedMockCall('/v4/clusters/', [
    v5ClusterResponse,
  ]);

  // Cluster GET request
  const clusterRequest = getPersistedMockCall(
    `/v5/clusters/${v5ClusterResponse.id}/`,
    v5ClusterResponse
  );

  const div = document.createElement('div');
  const { getAllByText, getByText, getByTestId } = renderRouteWithStore(
    '/organizations/acme/clusters/new/',
    div,
    {}
  );

  await wait(() => {
    getByText('Create Cluster');
    // Is this the v5 form?
    expect(getByTestId('nodepool-cluster-creation-view')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Create Cluster'));
  await wait(() => getByTestId('cluster-details-view'));

  // Expect we have been redirected to the cluster details view
  expect(getByTestId('cluster-details-view')).toBeInTheDocument();
  expect(getAllByText(v5ClusterResponse.id)[0]).toBeInTheDocument();
  expect(getByText(nodePoolCreationResponse.id)).toBeInTheDocument();

  v5ClusterCreationRequest.done();
  nodePoolCreationRequest.done();

  clusterRequest.persist(false);
  nodePoolsRequest.persist(false);

  // Restore clusters request
  requests.clusters.persist(false);
  requests.clusters = getPersistedMockCall('/v4/clusters/', v5ClustersResponse);
});

it(`switches to v4 cluster creation form, creates a v4 cluster and redirect to
details view`, async () => {
  // Cluster response
  const v4ClusterResponse = {
    id: '83wk7',
    create_date: '2019-11-19T11:55:56Z',
    api_endpoint: 'https://api.83wk7.k8s.gauss.eu-central-1.aws.gigantic.io',
    owner: 'acme',
    name: 'V4 Cluster creation test',
    release_version: '9.0.0',
    scaling: { min: 3, max: 3 },
    credential_id: '',
    workers: [
      {
        cpu: { cores: 4 },
        labels: {},
        memory: { size_gb: 16 },
        storage: { size_gb: 0 },
        aws: { instance_type: 'm4.xlarge' },
      },
      {
        cpu: { cores: 4 },
        labels: {},
        memory: { size_gb: 16 },
        storage: { size_gb: 0 },
        aws: { instance_type: 'm4.xlarge' },
      },
      {
        cpu: { cores: 4 },
        labels: {},
        memory: { size_gb: 16 },
        storage: { size_gb: 0 },
        aws: { instance_type: 'm4.xlarge' },
      },
    ],
  };

  const v4ClusterCreationResponse = {
    code: 'RESOURCE_CREATED',
    message: `The cluster with ID ${v4ClusterResponse.id} has been created.`,
  };

  // Cluster POST request
  const v4ClusterCreationRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/`, 'POST')
    .reply(200, v4ClusterCreationResponse, {
      location: `/v4/clusters/${v4ClusterResponse}/`,
    });

  // Clusters GET request
  requests.clusters = getPersistedMockCall('/v4/clusters/', [
    v4ClusterResponse,
  ]);

  // Cluster GET request
  const clusterRequest = getPersistedMockCall(
    `/v5/clusters/${v4ClusterResponse.id}/`,
    v4ClusterResponse
  );

  const div = document.createElement('div');
  const { getByText, getByTestId, getAllByText, debug } = renderRouteWithStore(
    '/organizations/acme/clusters/new/',
    div,
    {}
  );

  requests.status = getPersistedMockCall(
    `/v4/clusters/${v4ClusterResponse.id}/status/`,
    v4AWSClusterStatusResponse
  );
  requests.apps = getPersistedMockCall(
    `/v4/clusters/${v4ClusterResponse.id}/apps/`,
    appsResponse
  );
  // TODO we are not requesting this in v5 cluster calls
  // Empty response
  requests.keyPairs = getPersistedMockCall(
    `/v4/clusters/${v4ClusterResponse.id}/key-pairs/`
  );

  await wait(() => getByText('Details and Alternatives'));
  fireEvent.click(getByText('Details and Alternatives'));

  await wait(() => document.querySelector('.modal-content'));

  // Find the second button which is the 8.5.0
  // TODO Improve this, check with cmp that this is not a node pools release
  const button = document
    .querySelectorAll(
      `.modal-content .release-selector-modal--release-details h2`
    )[1]
    .querySelector('button');
  fireEvent.click(button);

  // Are we in the v4 cluster creation form
  await wait(() => expect(getByTestId('cluster-creation-view')));
  fireEvent.click(getByText('Create Cluster'));
  await wait(() => getByTestId('cluster-details-view'));

  // Expect we have been redirected to the cluster details view
  expect(getByTestId('cluster-details-view')).toBeInTheDocument();
  expect(getAllByText(v4ClusterResponse.id)[0]).toBeInTheDocument();

  v4ClusterCreationRequest.done();

  clusterRequest.persist(false);

  // Restore clusters request
  requests.clusters.persist(false);
  requests.clusters = getPersistedMockCall('/v4/clusters/');
});
