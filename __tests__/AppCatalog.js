import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitForDomChange } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { AppCatalogRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
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

describe('AppCatalog', () => {
  // eslint-disable-next-line no-console
  const originalConsoleError = console.error;

  beforeAll(() => {
    nock.disableNetConnect();
    // eslint-disable-next-line no-console
    console.error = jest.fn();
  });

  afterAll(() => {
    nock.enableNetConnect();
    // eslint-disable-next-line no-console
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/info/', AWSInfoResponse);
    getMockCall('/v4/organizations/', orgsResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
    getMockCall('/v4/clusters/', v4ClustersResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);
  });

  afterEach(() => {
    expect(nock.isDone());
    nock.cleanAll();
  });

  /************ TESTS ************/

  it('renders all non internal app catalogs in the app catalogs overview', async () => {
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    nock('https://catalogshost')
      .get('/giantswarm-incubator-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/giantswarm-test-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/helmstable/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);

    const { findByText } = renderRouteWithStore(AppCatalogRoutes.Home);

    const introText = await findByText(
      'Pick an App Catalog to browse all the Apps in it.'
    );
    expect(introText).toBeInTheDocument();

    for (const catalog of appCatalogsResponse) {
      // Skip expectation for internal catalogs.
      // They should not show up in Happa.
      if (
        catalog.metadata.labels['application.giantswarm.io/catalog-type'] ===
        'internal'
      ) {
        continue;
      }

      const catalogTitle = await findByText(catalog.spec.title);
      expect(catalogTitle).toBeInTheDocument();
    }
  });

  it('renders all apps in the app list for a given catalog', async () => {
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    nock('https://catalogshost')
      .get('/giantswarm-incubator-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/giantswarm-test-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/helmstable/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);

    const appCatalogListPath = RoutePath.createUsablePath(
      AppCatalogRoutes.AppList,
      { repo: 'giantswarm-incubator' }
    );
    const { findByText } = renderRouteWithStore(appCatalogListPath);

    const catalogTitle = await findByText('Giant Swarm Incubator');
    expect(catalogTitle).toBeInTheDocument();
  });

  it('renders all apps in the app list for a given catalog', async () => {
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    nock('https://catalogshost')
      .get('/giantswarm-incubator-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/giantswarm-test-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/helmstable/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);

    const appCatalogListPath = RoutePath.createUsablePath(
      AppCatalogRoutes.AppList,
      { repo: 'giantswarm-incubator' }
    );
    const { findByText } = renderRouteWithStore(appCatalogListPath);

    const catalogTitle = await findByText('Giant Swarm Incubator');
    expect(catalogTitle).toBeInTheDocument();
  });

  it('renders the app detail page for a given app', async () => {
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    nock('https://catalogshost')
      .get('/giantswarm-incubator-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/giantswarm-test-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/helmstable/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);

    const appCatalogListPath = RoutePath.createUsablePath(
      AppCatalogRoutes.AppDetail,
      {
        repo: 'giantswarm-incubator',
        app: 'nginx-ingress-controller-app',
      }
    );
    const { findByText } = renderRouteWithStore(appCatalogListPath);

    // The app's description should be there.
    // This comes from parsing the index.yaml, which is mocked in catalogIndexResponse.
    const appDescription = await findByText(
      'A Helm chart for the nginx ingress-controller'
    );
    expect(appDescription).toBeInTheDocument();
  });

  it('installs an app in a cluster, with default settings', async () => {
    const installAppResponse = {
      code: 'RESOURCE_CREATED',
      message: `We're installing your app called 'nginx-ingress-controller-app' on ${V4_CLUSTER.id}`,
    };
    const installAppRequest = nock(API_ENDPOINT)
      .intercept(
        `/v4/clusters/${V4_CLUSTER.id}/apps/nginx-ingress-controller-app/`,
        'PUT'
      )
      .reply(StatusCodes.Ok, installAppResponse);

    // eslint-disable-next-line no-magic-numbers
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/clusters/', v4ClustersResponse);
    getMockCall('/v4/releases/', releasesResponse);

    nock('https://catalogshost')
      .get('/giantswarm-incubator-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/giantswarm-test-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/helmstable/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);

    const appCatalogListPath = RoutePath.createUsablePath(
      AppCatalogRoutes.AppDetail,
      {
        repo: 'giantswarm-incubator',
        app: 'nginx-ingress-controller-app',
      }
    );
    const { findByText, findAllByText, getByText } = renderRouteWithStore(
      appCatalogListPath
    );

    // Press the configure button
    let installButton = await findByText(/configure & install/i);
    fireEvent.click(installButton);

    // Select the current cluster
    fireEvent.click(getByText(V4_CLUSTER.name));

    // Install the new app
    installButton = await findByText(/install app/i);
    fireEvent.click(installButton);

    await findByText(/is being installed on/i);

    // Check if the user got redirected to the cluster detail view
    await findAllByText(V4_CLUSTER.name);
    await findByText(/kubernetes endpoint uri/i);

    /**
     * Manually removing the toast notification to prevent
     * it from showing up in other tests
     */
    document.querySelector('#noty_layout__topRight').remove();

    installAppRequest.done();
  });

  it('installs an app in a cluster, with custom settings', async () => {
    const testApp = 'nginx-ingress-controller-app';

    const installAppResponse = {
      code: 'RESOURCE_CREATED',
      message: `We're installing your app called 'test-app' on ${V4_CLUSTER.id}`,
    };
    const installAppRequest = nock(API_ENDPOINT)
      .intercept(`/v4/clusters/${V4_CLUSTER.id}/apps/test-app/`, 'PUT')
      .reply(StatusCodes.Ok, installAppResponse);

    // eslint-disable-next-line no-magic-numbers
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/clusters/', v4ClustersResponse);
    getMockCall('/v4/releases/', releasesResponse);

    nock('https://catalogshost')
      .get('/giantswarm-incubator-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/giantswarm-test-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock('https://catalogshost')
      .get('/helmstable/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);

    const appCatalogListPath = RoutePath.createUsablePath(
      AppCatalogRoutes.AppDetail,
      {
        repo: 'giantswarm-incubator',
        app: testApp,
      }
    );
    const {
      findByText,
      findAllByText,
      getByText,
      getByLabelText,
    } = renderRouteWithStore(appCatalogListPath);

    // Press the configure button
    let installButton = await findByText(/configure & install/i);
    fireEvent.click(installButton);

    // Select the current cluster
    fireEvent.click(getByText(V4_CLUSTER.name));

    // Set a new application name
    const appNameInput = getByLabelText(/application name/i);
    fireEvent.change(appNameInput, {
      target: { value: 'test-app' },
    });

    // Check if namespace input is disabled
    expect(getByLabelText(/namespace:/i).readOnly).toBeTruthy();

    // Upload a configmap file
    let fileInput = getByLabelText(/configmap:/i);
    let file = new Blob(
      [
        JSON.stringify({
          name: 'test',
          namespace: 'some-other-test',
        }),
      ],
      {
        type: 'application/json',
        name: 'config.json',
      }
    );
    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    // Upload a secrets file
    fileInput = getByLabelText(/secret:/i);
    file = new Blob(
      [
        JSON.stringify({
          name: 'test',
          namespace: 'some-other-test',
        }),
      ],
      {
        type: 'application/json',
        name: 'secrets.json',
      }
    );
    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    // Install the new app
    installButton = await findByText(/install app/i);
    fireEvent.click(installButton);

    await findByText(/is being installed on/i);

    // Check if the user got redirected to the cluster detail view
    await findAllByText(V4_CLUSTER.name);
    await findByText(/kubernetes endpoint uri/i);

    installAppRequest.done();
  });

  it('updates the config map of an already installed app', async () => {
    const updateAppConfigRequest = nock(API_ENDPOINT)
      .intercept(`/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/config/`, 'PATCH')
      .reply(StatusCodes.Ok);

    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCallTimes(
      `/v4/clusters/${V4_CLUSTER.id}/apps/`,
      [appResponseWithCustomConfig],
      2
    );
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/releases/', releasesResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail,
      {
        orgId: ORGANIZATION,
        clusterId: V4_CLUSTER.id,
      }
    );
    const { findByText, getByText } = renderRouteWithStore(clusterDetailPath);

    const appsTab = await findByText(/^apps$/i);
    fireEvent.click(appsTab);

    // Click on app details button to open the editing modal
    const appLabel = getByText(/app version: 0.0.1/i);
    const appDetailsButton = appLabel.parentNode.parentNode.querySelector(
      'button'
    );
    fireEvent.click(appDetailsButton);

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

    await waitForDomChange();

    updateAppConfigRequest.done();
  });

  it('deletes the config map of an already installed app', async () => {
    const deleteAppConfigRequest = nock(API_ENDPOINT)
      .intercept(
        `/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/config/`,
        'DELETE'
      )
      .reply(StatusCodes.Ok);

    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCallTimes(
      `/v4/clusters/${V4_CLUSTER.id}/apps/`,
      [appResponseWithCustomConfig],
      2
    );
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/releases/', releasesResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail,
      {
        orgId: ORGANIZATION,
        clusterId: V4_CLUSTER.id,
      }
    );
    const { findByText, getByText } = renderRouteWithStore(clusterDetailPath);

    const appsTab = await findByText(/^apps$/i);
    fireEvent.click(appsTab);

    // Click on app details button to open the editing modal
    const appLabel = getByText(/app version: 0.0.1/i);
    const appDetailsButton = appLabel.parentNode.parentNode.querySelector(
      'button'
    );
    fireEvent.click(appDetailsButton);

    // Upload a configmap file
    const fileInputPlaceholder = getByText(/configmap has been set/i);
    let deleteButton = fileInputPlaceholder.parentNode.querySelector(
      '.btn-danger'
    );
    fireEvent.click(deleteButton);

    // Confirm deletion
    deleteButton = getByText(/^delete configmap$/i);
    fireEvent.click(deleteButton);

    deleteAppConfigRequest.done();
  });

  it('updates secrets of an already installed app', async () => {
    const updateAppConfigRequest = nock(API_ENDPOINT)
      .intercept(`/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/secret/`, 'PATCH')
      .reply(StatusCodes.Ok);

    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCallTimes(
      `/v4/clusters/${V4_CLUSTER.id}/apps/`,
      [appResponseWithCustomConfig],
      2
    );
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/releases/', releasesResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail,
      {
        orgId: ORGANIZATION,
        clusterId: V4_CLUSTER.id,
      }
    );
    const { findByText, getByText } = renderRouteWithStore(clusterDetailPath);

    const appsTab = await findByText(/^apps$/i);
    fireEvent.click(appsTab);

    // Click on app details button to open the editing modal
    const appLabel = getByText(/app version: 0.0.1/i);
    const appDetailsButton = appLabel.parentNode.parentNode.querySelector(
      'button'
    );
    fireEvent.click(appDetailsButton);

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

    await waitForDomChange();

    updateAppConfigRequest.done();
  });

  it('deletes secrets of an already installed app', async () => {
    const deleteSecretsRequest = nock(API_ENDPOINT)
      .intercept(
        `/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/secret/`,
        'DELETE'
      )
      .reply(StatusCodes.Ok);

    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCallTimes(
      `/v4/clusters/${V4_CLUSTER.id}/apps/`,
      [appResponseWithCustomConfig],
      2
    );
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/releases/', releasesResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail,
      {
        orgId: ORGANIZATION,
        clusterId: V4_CLUSTER.id,
      }
    );
    const { findByText, getByText } = renderRouteWithStore(clusterDetailPath);

    const appsTab = await findByText(/^apps$/i);
    fireEvent.click(appsTab);

    // Click on app details button to open the editing modal
    const appLabel = getByText(/app version: 0.0.1/i);
    const appDetailsButton = appLabel.parentNode.parentNode.querySelector(
      'button'
    );
    fireEvent.click(appDetailsButton);

    // Delete the existing file
    const fileInputPlaceholder = getByText(/secret has been set/i);
    let deleteButton = fileInputPlaceholder.parentNode.querySelector(
      '.btn-danger'
    );
    fireEvent.click(deleteButton);

    // Confirm deletion
    deleteButton = getByText(/^delete secret$/i);
    fireEvent.click(deleteButton);

    await waitForDomChange();

    deleteSecretsRequest.done();
  });

  it('deletes already installed app', async () => {
    const deleteAppRequest = nock(API_ENDPOINT)
      .intercept(`/v4/clusters/${V4_CLUSTER.id}/apps/my%20app/`, 'DELETE')
      .reply(StatusCodes.Ok);

    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCallTimes(
      `/v4/clusters/${V4_CLUSTER.id}/apps/`,
      [appResponseWithCustomConfig],
      2
    );
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/releases/', releasesResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail,
      {
        orgId: ORGANIZATION,
        clusterId: V4_CLUSTER.id,
      }
    );
    const { findByText, getByText } = renderRouteWithStore(clusterDetailPath);

    const appsTab = await findByText(/^apps$/i);
    fireEvent.click(appsTab);

    // Click on app details button to open the editing modal
    const appLabel = getByText(/app version: 0.0.1/i);
    const appDetailsButton = appLabel.parentNode.parentNode.querySelector(
      'button'
    );
    fireEvent.click(appDetailsButton);

    // Delete the app
    let deleteButton = getByText(/delete app/i);
    fireEvent.click(deleteButton);

    // Confirm deletion
    deleteButton = getByText(/delete app/i);
    fireEvent.click(deleteButton);

    deleteAppRequest.done();
  });
});
