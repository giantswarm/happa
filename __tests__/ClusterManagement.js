import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
  getPersistedMockCall,
  nodePoolsResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v4ClustersResponse,
  V5_CLUSTER,
  v5ClusterResponse,
  v5ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

// Tests setup
const requests = {};

// Responses to requests
beforeAll(() => {
  requests.userInfo = getPersistedMockCall('/v4/user/', userResponse);
  requests.releases = getPersistedMockCall('/v4/releases/', releasesResponse);
  requests.info = getPersistedMockCall('/v4/info/', AWSInfoResponse);
  requests.organizations = getPersistedMockCall(
    '/v4/organizations/',
    orgsResponse
  );
  requests.organization = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/`,
    orgResponse
  );
  requests.clusters = getPersistedMockCall('/v4/clusters/');
  requests.apps = getPersistedMockCall(
    `/v5/clusters/${V5_CLUSTER.id}/apps/`,
    appsResponse
  );
  requests.keyPairs = getPersistedMockCall(
    `/v4/clusters/${V5_CLUSTER.id}/key-pairs/`
  );
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
  const v5ClusterCreationResponse = {
    code: 'RESOURCE_CREATED',
    message: `The cluster with ID ${v5ClusterResponse.id} has been created.`,
  };

  // Cluster POST request
  const v5ClusterCreationRequest = nock(API_ENDPOINT)
    .intercept(`/v5/clusters/`, 'POST')
    .reply(StatusCodes.Ok, v5ClusterCreationResponse, {
      location: `/v5/clusters/${v5ClusterResponse.id}/`,
    });

  // Node Pools POST response
  const nodePoolCreationResponse = { ...nodePoolsResponse[0] };

  // Node pools POST request
  const nodePoolCreationRequest = nock(API_ENDPOINT)
    .intercept(`/v5/clusters/${v5ClusterResponse.id}/nodepools/`, 'POST')
    .reply(StatusCodes.Ok, nodePoolCreationResponse);

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

  const newClusterPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.New,
    { orgId: ORGANIZATION }
  );
  const { getAllByText, getByText, getByTestId } = renderRouteWithStore(
    newClusterPath
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
  expect(getAllByText(v5ClusterResponse.id));
  expect(getAllByText(nodePoolCreationResponse.id));

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
  const v4ClusterCreationResponse = {
    code: 'RESOURCE_CREATED',
    message: `The cluster with ID ${V4_CLUSTER.id} has been created.`,
  };

  // Cluster POST request
  const v4ClusterCreationRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/`, 'POST')
    .reply(StatusCodes.Ok, v4ClusterCreationResponse, {
      location: `/v4/clusters/${V4_CLUSTER.id}/`, // Headers
    });

  // Clusters GET request
  requests.clusters = getPersistedMockCall('/v4/clusters/', v4ClustersResponse);

  // Cluster GET request
  const clusterRequest = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/`,
    v4AWSClusterResponse
  );

  const newClusterPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.New,
    {
      orgId: ORGANIZATION,
    }
  );
  const { findByText, findByTestId, getAllByText } = renderRouteWithStore(
    newClusterPath
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
  requests.keyPairs = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/key-pairs/`
  );

  fireEvent.click(await findByText('Details and Alternatives'));

  // Wait for the modal to pop up.
  await findByText('Release Details');

  // Find the second button which is the 8.5.0
  // TODO Improve this, check with cmp that this is not a node pools release
  const button = document
    .querySelectorAll(
      `.modal-content .release-selector-modal--release-details h2`
    )[1]
    .querySelector('button');
  fireEvent.click(button);

  // Click the create cluster button.
  fireEvent.click(await findByText('Create Cluster'));

  // Wait till we're on the cluster detail page.
  await findByTestId('cluster-details-view');

  // Expect we have been redirected to the cluster details view
  expect(getAllByText(V4_CLUSTER.id)[0]).toBeInTheDocument();

  v4ClusterCreationRequest.done();

  clusterRequest.persist(false);

  // Restore clusters request
  requests.clusters.persist(false);
  requests.clusters = getPersistedMockCall('/v4/clusters/');
});
