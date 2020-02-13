import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { AppCatalogRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
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
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
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
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/releases/', releasesResponse);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    nock('https://cors-anywhere.herokuapp.com')
      .get(/.*$/)
      .reply(
        StatusCodes.InternalServerError,
        'Not supposed to get here in these tests.'
      );
  });

  afterEach(() => {
    expect(nock.isDone());
    nock.cleanAll();
  });

  /************ TESTS ************/

  it('renders all non internal app catalogs in the app catalogs overview', async () => {
    getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse, 2);

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
    getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse, 2);

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
    getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse, 2);

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
    // eslint-disable-next-line no-magic-numbers
    getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse, 3);

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
    getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse, 3);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/clusters/', v4ClustersResponse);

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
    const { findByText, getByText } = renderRouteWithStore(appCatalogListPath);

    // Press the configure button
    let installButton = await findByText(/configure & install/i);
    fireEvent.click(installButton);

    // Select the current cluster
    fireEvent.click(getByText(V4_CLUSTER.name));

    // Install the new app
    installButton = await findByText(/install app/i);
    fireEvent.click(installButton);

    // Waiting for the modal to close
    await wait();

    await findByText(/is being installed on/i);

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
    getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse, 3);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse, 2);
    getMockCallTimes(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse,
      2
    );
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCall('/v4/clusters/', v4ClustersResponse);

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
    const { findByText, getByText, getByLabelText } = renderRouteWithStore(
      appCatalogListPath
    );

    // Press the configure button
    let installButton = await findByText(/configure & install/i);
    fireEvent.click(installButton);

    // Select the current cluster
    fireEvent.click(getByText(V4_CLUSTER.name));

    // Set a new application name
    const appNameInput = getByLabelText('Application Name:');
    fireEvent.change(appNameInput, {
      target: { value: 'test-app' },
    });

    // Check if namespace input is disabled
    expect(getByLabelText('Namespace:').readOnly).toBeTruthy();

    // Upload a configmap file
    let fileInput = getByLabelText('ConfigMap:');
    let file = new Blob(
      [
        JSON.stringify({
          var: 'test',
          path: 'some-other-test',
        }),
      ],
      {
        type: 'application/json',
        name: 'config.json',
      }
    );
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    // Upload a secrets file
    fileInput = getByLabelText('Secret:');
    file = new Blob(
      [
        JSON.stringify({
          agent: 'secret-key',
        }),
      ],
      {
        type: 'application/json',
        name: 'secrets.json',
      }
    );
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    // Install the new app
    installButton = await findByText(/install app/i);
    fireEvent.click(installButton);

    // Waiting for the modal to close
    await wait();

    await findByText(/is being installed on/i);

    installAppRequest.done();
  });
});
