import '@testing-library/jest-dom/extend-expect';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  getPersistedMockCall,
  AWSInfoResponse,
  nodePoolsResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V5_CLUSTER,
  v5ClusterResponse,
  v5ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { fireEvent, wait } from '@testing-library/react';
import { getNumberOfNodePoolsNodes } from 'utils/clusterUtils';
import { renderRouteWithStore } from 'testUtils/renderUtils';
import { truncate } from 'lib/helpers';
import nock from 'nock';

// Cluster and route we are testing with.
const ROUTE = `/organizations/${ORGANIZATION}/clusters/${V5_CLUSTER.id}`;

// Tests setup
const requests = {};

// Responses to requests
beforeAll(() => {
  requests.userInfo = getPersistedMockCall('/v4/user/', userResponse);
  requests.info = getPersistedMockCall('/v4/info/', AWSInfoResponse);
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
  requests.apps = getPersistedMockCall(
    `/v5/clusters/${V5_CLUSTER.id}/apps/`,
    appsResponse
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

  // TODO no apps response?? Check on gauss.
});

// Stop persisting responses
afterAll(() => {
  Object.keys(requests).forEach(req => {
    requests[req].persist(false);
  });
});

/************ TESTS ************/

it('lets me open and close the keypair create modal', async () => {
  const { getByText, getAllByText } = renderRouteWithStore(ROUTE, {});

  await wait(() => {
    expect(getByText(V5_CLUSTER.name)).toBeInTheDocument();
  });

  const keyPairTab = getByText('Key Pairs');
  fireEvent.click(keyPairTab);

  const createKeyPairButton = getByText('Create Key Pair and Kubeconfig');
  fireEvent.click(createKeyPairButton);

  const cancelButton = getByText('Cancel');
  fireEvent.click(cancelButton);

  await wait(() => {
    const expectedText = 'No key pairs yet. Why don\'t you create your first?';
    expect(queryByTestId('create-key-pair-modal')).not.toBeInTheDocument();q
  });
});