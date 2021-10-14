import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor, within } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import { withMarkup } from 'testUtils/assertUtils';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  getMockCall,
  getMockCallTimes,
  metadataResponse,
  nodePoolsResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  preNodePoolRelease,
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

describe('ClusterManagement', () => {
  jest.setTimeout(15000);
  jest.mock('model/services/mapi/authorizationv1');

  beforeEach(() => {
    getConfiguration.mockResolvedValueOnce(metadataResponse);
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/organizations/', orgsResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);
  });

  /************ TESTS ************/
  it('creates a v5 cluster and redirect to details view', async () => {
    jest.setTimeout(20000);
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
    const { getAllByText, findAllByText, getByText, getByTestId } =
      renderRouteWithStore(newClusterPath);

    await waitFor(() => {
      getByText('Create cluster');
      // Is this the v5 form?
      expect(getByTestId('nodepool-cluster-creation-view')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Create cluster'));
    await waitFor(() => getByTestId('cluster-details-view'));

    // Expect we have been redirected to the cluster details view
    expect(getByTestId('cluster-details-view')).toBeInTheDocument();
    expect(getAllByText(v5ClusterResponse.id));
    expect(await findAllByText(nodePoolCreationResponse.id));
  });

  it(`switches to v4 cluster creation form, creates a v4 cluster and redirect to
details view`, async () => {
    // eslint-disable-next-line no-magic-numbers
    getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 3);
    getMockCall('/v4/clusters/');
    getMockCallTimes('/v4/releases/', releasesResponse, 2);

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

    const { findByText, findByTestId, getAllByText, getByTitle } =
      renderRouteWithStore(newClusterPath);

    fireEvent.click(await findByText(/Available releases/i));

    fireEvent.click(
      getByTitle(
        new RegExp(`Select release ${preNodePoolRelease.version}`, 'i')
      )
    );

    // Click the create cluster button.
    fireEvent.click(await findByText('Create cluster'));

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
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: fakeCluster,
      }
    );
    const { getByTestId, findByText } = renderRouteWithStore(clusterDetailPath);

    // Expect we have been redirected to the clusters list.
    await waitFor(() =>
      expect(getByTestId('clusters-list')).toBeInTheDocument()
    );

    await withMarkup(findByText)(`Cluster f4ke1 no longer exists.`);
  });

  it('Cluster list shows all clusters, each one with its details, for the selected organization', async () => {
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/clusters/', [
      ...v4ClustersResponse,
      ...v5ClustersResponse,
    ]);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/nodepools/`, nodePoolsResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );

    const clusterDetailPath = RoutePath.createUsablePath(MainRoutes.Home);
    const { getAllByTestId, getByText } =
      renderRouteWithStore(clusterDetailPath);

    // Wait for the last elements to load.
    await waitFor(() =>
      expect(getAllByTestId('cluster-resources').length).toBe(2)
    );

    // Expect id, name and release version of both clusters are in view.
    expect(getByText(V4_CLUSTER.id)).toBeInTheDocument();
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
    expect(getByText(V4_CLUSTER.releaseVersion)).toBeInTheDocument();
    expect(getByText(V5_CLUSTER.id)).toBeInTheDocument();
    expect(getByText(V5_CLUSTER.name)).toBeInTheDocument();
    expect(getByText(V5_CLUSTER.releaseVersion)).toBeInTheDocument();

    await waitFor(() =>
      expect(getAllByTestId('cluster-resources').length).toBe(2)
    );

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

  it('it does not show disabled releases in release selection modal for regular users', async () => {
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/clusters/');
    getMockCall('/v4/releases/', releasesResponse);

    const storage = {
      user: '{"email":"developer@giantswarm.io","auth":{"scheme":"giantswarm","token":"a-valid-token"},"isAdmin":false}',
    };

    const newClusterPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.New,
      {
        orgId: ORGANIZATION,
      }
    );

    const { findByText, queryByText, container } = renderRouteWithStore(
      newClusterPath,
      {},
      storage
    );

    fireEvent.click(await findByText(/Available releases/i));

    const table = container.querySelector('table');

    let numActiveReleases = 0;

    for (const { version, active } of releasesResponse) {
      if (active === true) {
        expect(within(table).getByText(version)).toBeInTheDocument();
        numActiveReleases++;
      } else {
        expect(queryByText(version)).not.toBeInTheDocument();
      }
    }

    const tableRows = table.querySelectorAll('tbody tr');

    expect(tableRows).toHaveLength(numActiveReleases);
  });

  it('it displays disabled releases in release selection modal for admin users', async () => {
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/clusters/');
    getMockCall('/v4/releases/', releasesResponse);

    const storage = {
      user: '{"email":"developer@giantswarm.io","auth":{"scheme":"giantswarm","token":"a-valid-token"},"isAdmin":true}',
    };

    const newClusterPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.New,
      {
        orgId: ORGANIZATION,
      }
    );

    const { findByText, container } = renderRouteWithStore(
      newClusterPath,
      {},
      storage
    );

    fireEvent.click(await findByText(/Available releases/i));

    const table = container.querySelector('table');

    for (const { version } of releasesResponse) {
      expect(within(table).getByText(version)).toBeInTheDocument();
    }
  });
  // eslint-disable-next-line no-magic-numbers
});
