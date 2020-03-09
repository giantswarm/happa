import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait, within } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getInstallationInfo } from 'model/services/giantSwarm';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { AppRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
  getMockCall,
  getMockCallTimes,
  mockAPIResponse,
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

beforeEach(() => {
  getInstallationInfo.mockResolvedValueOnce(mockAPIResponse(AWSInfoResponse));
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/organizations/', orgsResponse);
  getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
});

/************ TESTS ************/
it('creates a v5 cluster and redirect to details view', async () => {
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
  getMockCall('/v4/clusters/');
  getMockCall('/v4/releases/', releasesResponse);
  getMockCall(`/v5/clusters/${V5_CLUSTER.id}/apps/`, appsResponse);
  getMockCall(`/v4/clusters/${V5_CLUSTER.id}/key-pairs/`);

  const v5ClusterCreationResponse = {
    code: 'RESOURCE_CREATED',
    message: `The cluster with ID ${v5ClusterResponse.id} has been created.`,
  };

  // Cluster POST request
  nock(API_ENDPOINT)
    .intercept(`/v5/clusters/`, 'POST')
    .reply(StatusCodes.Ok, v5ClusterCreationResponse, {
      location: `/v5/clusters/${v5ClusterResponse.id}/`,
    });

  // Node Pools POST response
  const nodePoolCreationResponse = { ...nodePoolsResponse[0] };

  // Node pools POST request
  nock(API_ENDPOINT)
    .intercept(`/v5/clusters/${v5ClusterResponse.id}/nodepools/`, 'POST')
    .reply(StatusCodes.Ok, nodePoolCreationResponse);

  // Node pools get
  getMockCallTimes(
    `/v5/clusters/${v5ClusterResponse.id}/nodepools/`,
    [nodePoolCreationResponse],
    2
  );

  // Cluster GET request
  getMockCallTimes(
    `/v5/clusters/${v5ClusterResponse.id}/`,
    v5ClusterResponse,
    2
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
});

it(`switches to v4 cluster creation form, creates a v4 cluster and redirect to
details view`, async () => {
  // eslint-disable-next-line no-magic-numbers
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 3);
  getMockCall('/v4/clusters/');
  getMockCall('/v4/releases/', releasesResponse);

  const v4ClusterCreationResponse = {
    code: 'RESOURCE_CREATED',
    message: `The cluster with ID ${V4_CLUSTER.id} has been created.`,
  };

  // Cluster POST request
  nock(API_ENDPOINT)
    .intercept(`/v4/clusters/`, 'POST')
    .reply(StatusCodes.Ok, v4ClusterCreationResponse, {
      location: `/v4/clusters/${V4_CLUSTER.id}/`, // Headers
    });

  // Cluster GET request
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse, 2);

  const newClusterPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.New,
    {
      orgId: ORGANIZATION,
    }
  );
  getMockCallTimes(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse,
    2
  );
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);

  // Empty response
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);

  const { findByText, findByTestId, getAllByText } = renderRouteWithStore(
    newClusterPath
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
});

it(`redirects the user to clusters to list and shows flash message when cluster doesn't exist`, async () => {
  const fakeCluster = 'f4ke1';
  getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
  getMockCall('/v4/clusters/');

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: fakeCluster,
    }
  );
  const { getByTestId } = renderRouteWithStore(clusterDetailPath);

  // Expect we have been redirected to the clusters list.
  await wait(() => expect(getByTestId('clusters-list')).toBeInTheDocument());

  const flashMessage = document.querySelector('#noty_layout__topRight');
  expect(flashMessage).toContainHTML(
    `Cluster <code>f4ke1</code> doesn't exist.`
  );
});

it('Cluster list shows all clusters, each one with its details, for the selected organization', async () => {
  getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);

  getMockCall('/v4/clusters/', [...v4ClustersResponse, ...v5ClustersResponse]);
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
  getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);
  getMockCall(`/v5/clusters/${V5_CLUSTER.id}/nodepools/`, nodePoolsResponse);
  getMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse
  );

  const clusterDetailPath = RoutePath.createUsablePath(AppRoutes.Home);
  const { getAllByTestId, getByText } = renderRouteWithStore(clusterDetailPath);

  // Wait for the last elements to load.
  await wait(() => expect(getAllByTestId('cluster-resources').length).toBe(2));

  // Expect id, name and release version of both clusters are in view.
  expect(getByText(V4_CLUSTER.id)).toBeInTheDocument();
  expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  expect(getByText(V4_CLUSTER.releaseVersion)).toBeInTheDocument();
  expect(getByText(V5_CLUSTER.id)).toBeInTheDocument();
  expect(getByText(V5_CLUSTER.name)).toBeInTheDocument();
  expect(getByText(V5_CLUSTER.releaseVersion)).toBeInTheDocument();

  // Expect resources to be in the view.
  // If we refactor resources selector this will break.
  // TODO Use selectors in tests to produce resources and expect this info is in the view
  const v4ClusterResources = within(getAllByTestId('cluster-resources')[1]);
  expect(v4ClusterResources.getByText(/3 nodes/i)).toBeInTheDocument();

  const v5ClusterResources = within(getAllByTestId('cluster-resources')[0]);
  expect(v5ClusterResources.getByText(/2 node pools/i)).toBeInTheDocument();
  expect(v5ClusterResources.getByText(/6 nodes/i)).toBeInTheDocument();
  expect(v5ClusterResources.getByText(/24 CPU cores/i)).toBeInTheDocument();
});
