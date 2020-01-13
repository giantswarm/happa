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
  requests.keyPairs = getPersistedMockCall(
    `/v4/clusters/${V5_CLUSTER.id}/key-pairs/`
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
  // Given the app is on the cluster detail page.
  const { findByText, getByText, queryByTestId } = renderRouteWithStore(
    ROUTE,
    {}
  );

  // And it is done loading.
  const clusterName = await findByText(V5_CLUSTER.name);
  expect(clusterName).toBeInTheDocument();

  // When I click the Key Pairs tab button.
  const keyPairTab = getByText('Key Pairs');
  fireEvent.click(keyPairTab);

  // And I click the create key pair button.
  const createKeyPairButton = getByText('Create Key Pair and Kubeconfig');
  fireEvent.click(createKeyPairButton);

  // Then I should see the create key pair modal on the screen.
  const modal = await queryByTestId('create-key-pair-modal');
  expect(modal).toBeInTheDocument();

  // And when I click the cancel button.
  const cancelButton = getByText('Cancel');
  fireEvent.click(cancelButton);

  // Then the modal should be gone.
  expect(modal).not.toBeInTheDocument();
});
