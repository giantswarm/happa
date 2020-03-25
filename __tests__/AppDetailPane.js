import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor, within } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getInstallationInfo } from 'model/services/giantSwarm';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appResponseNoCatalog,
  appResponseWithCustomConfig,
  appsResponse,
  AWSInfoResponse,
  catalogIndexResponse,
  getMockCall,
  getMockCallTimes,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v4ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

const clusterDetailPath = RoutePath.createUsablePath(
  OrganizationsRoutes.Clusters.Detail,
  {
    orgId: ORGANIZATION,
    clusterId: V4_CLUSTER.id,
  }
);

describe('Installed app detail pane', () => {
  beforeEach(() => {
    getInstallationInfo.mockResolvedValueOnce(AWSInfoResponse);
    getMockCall('/v4/clusters/', v4ClustersResponse);
    getMockCallTimes('/v4/organizations/', orgsResponse);

    getMockCallTimes('/v4/user/', userResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );

    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/releases/', releasesResponse);
  });

  describe('With apps', () => {
    beforeEach(() => {
      getMockCallTimes(
        `/v4/clusters/${V4_CLUSTER.id}/apps/`,
        [appResponseWithCustomConfig],
        2
      );

      nock('https://catalogshost')
        .get('/giantswarm-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);
    });

    it('updates the config map of an already installed app', async () => {
      nock(API_ENDPOINT)
        .intercept(
          `/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/config/`,
          'PATCH'
        )
        .reply(StatusCodes.Ok);

      const { findByText, getByText } = renderRouteWithStore(clusterDetailPath);

      const appsTab = await findByText(/^apps$/i);
      fireEvent.click(appsTab);

      // Click on app to open the editing modal
      const appLabel = getByText(/chart version: 0.0.1/i);
      fireEvent.click(appLabel);

      // Delete the existing file
      const fileInputPlaceholder = getByText(/configmap has been set/i);
      const fileInput = fileInputPlaceholder.parentNode.querySelector('input');
      const file = new Blob(
        [
          JSON.stringify({
            name: 'test',
            namespace: 'some-other-test',
          }),
        ],
        {
          type: 'application/json',
          name: 'config2.json',
        }
      );

      fireEvent.change(fileInput, {
        target: {
          files: [file],
        },
      });

      await findByText(/has successfully been updated./i);
    });

    it('deletes the config map of an already installed app', async () => {
      nock(API_ENDPOINT)
        .intercept(
          `/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/config/`,
          'DELETE'
        )
        .reply(StatusCodes.Ok);

      const { findByText, getByText, queryByText } = renderRouteWithStore(
        clusterDetailPath
      );

      const appsTab = await findByText(/^apps$/i);
      fireEvent.click(appsTab);

      // Click on app to open the editing modal
      const appLabel = getByText(/chart version: 0.0.1/i);
      fireEvent.click(appLabel);

      // Upload a configmap file
      const fileInputPlaceholder = getByText(/configmap has been set/i);
      let deleteButton = fileInputPlaceholder.parentNode.querySelector(
        '.btn-danger'
      );
      fireEvent.click(deleteButton);

      // Confirm deletion
      deleteButton = getByText(/^delete configmap$/i);
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(queryByText(/delete configmap/i)).not.toBeInTheDocument();
      });

      await findByText(/has been deleted./i);
    });

    it('updates secrets of an already installed app', async () => {
      nock(API_ENDPOINT)
        .intercept(
          `/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/secret/`,
          'PATCH'
        )
        .reply(StatusCodes.Ok);

      const { findByText, getByText, queryByText } = renderRouteWithStore(
        clusterDetailPath
      );

      const appsTab = await findByText(/^apps$/i);
      fireEvent.click(appsTab);

      // Click on app to open the editing modal
      const appLabel = getByText(/chart version: 0.0.1/i);
      fireEvent.click(appLabel);

      // Upload a secrets file
      const fileInputPlaceholder = getByText(/secret has been set/i);
      const fileInput = fileInputPlaceholder.parentNode.querySelector('input');
      const file = new Blob(
        [
          JSON.stringify({
            name: 'test',
            namespace: 'some-other-test',
          }),
        ],
        {
          type: 'application/json',
          name: 'secret.json',
        }
      );
      fireEvent.change(fileInput, {
        target: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(queryByText(/delete secret/i)).not.toBeInTheDocument();
      });

      await findByText(/has successfully been updated./i);
    });

    it('deletes secrets of an already installed app', async () => {
      nock(API_ENDPOINT)
        .intercept(
          `/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/secret/`,
          'DELETE'
        )
        .reply(StatusCodes.Ok);

      const { findByText, getByText, queryByText } = renderRouteWithStore(
        clusterDetailPath
      );

      const appsTab = await findByText(/^apps$/i);
      fireEvent.click(appsTab);

      // Click on app to open the editing modal
      const appLabel = getByText(/chart version: 0.0.1/i);
      fireEvent.click(appLabel);

      // Delete the existing file
      const fileInputPlaceholder = getByText(/secret has been set/i);
      let deleteButton = fileInputPlaceholder.parentNode.querySelector(
        '.btn-danger'
      );
      fireEvent.click(deleteButton);

      // Confirm deletion
      deleteButton = getByText(/^delete secret$/i);
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(queryByText(/delete secret/i)).not.toBeInTheDocument();
      });

      await findByText(/has been deleted./i);
    });
  });

  it('deletes already installed app', async () => {
    nock(API_ENDPOINT)
      .intercept(`/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/`, 'DELETE')
      .reply(StatusCodes.Ok);

    nock('https://catalogshost')
      .get('/giantswarm-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);

    // Before deleting the app, there are apps.
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);

    // After deleting the app, there are no apps.
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, []);

    const { findByText, getByText, queryByText } = renderRouteWithStore(
      clusterDetailPath
    );

    const appsTab = await findByText(/^apps$/i);
    fireEvent.click(appsTab);

    // Click on app to open the editing modal
    const appLabel = getByText(/chart version: 0.0.1/i);
    fireEvent.click(appLabel);

    // Delete the app
    let deleteButton = getByText(/delete app/i);
    fireEvent.click(deleteButton);

    // Confirm deletion
    deleteButton = getByText(/delete app/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(queryByText(/delete app/i)).not.toBeInTheDocument();
    });

    await findByText(/will be deleted/i);
  });

  it('shows a no apps installed message when there are no apps yet', async () => {
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, []);

    const { findByText } = renderRouteWithStore(clusterDetailPath);

    const appsTab = await findByText(/^apps$/i);
    fireEvent.click(appsTab);

    expect(
      await findByText('No apps installed on this cluster')
    ).toBeInTheDocument();
  });

  it('can deal with apps when not able to find the corresponding appcatalog', async () => {
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, [appResponseNoCatalog]);

    const { findByText, getByText } = renderRouteWithStore(clusterDetailPath);

    const appsTab = await findByText(/^apps$/i);
    fireEvent.click(appsTab);

    // Click on app to open the editing modal
    const appLabel = getByText(/chart version: 0.0.1/i);
    fireEvent.click(appLabel);

    // If the app doesn't explode, we're ok and the test has passed.
  });

  it('shows an error message if not able to set the desired chart version', async () => {
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, [
      appResponseWithCustomConfig,
    ]);

    nock('https://catalogshost')
      .get('/giantswarm-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);

    const { findByText, getByText, getByTestId } = renderRouteWithStore(
      clusterDetailPath
    );

    const appsTab = await findByText(/^apps$/i);
    fireEvent.click(appsTab);

    // Click on app to open the editing modal.
    const appLabel = getByText(/chart version: 0.0.1/i);
    fireEvent.click(appLabel);

    // Wait for the version picker to load.
    const modal = getByTestId('app-details-modal');
    const versionDropdown = await within(modal).findByText(/0.0.1/i);
    fireEvent.click(versionDropdown);

    // Set the version.
    const desiredVersion = within(modal).getByText(/1.1.1/i);
    fireEvent.click(desiredVersion);

    const confirmButton = getByText('Update Chart Version');
    fireEvent.click(confirmButton);

    // Expect an error.
    await findByText(/Something went wrong/);
  });
});
