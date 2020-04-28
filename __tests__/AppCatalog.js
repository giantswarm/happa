import '@testing-library/jest-dom/extend-expect';

import { fireEvent, within } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getInstallationInfo } from 'model/services/giantSwarm';
import { getConfiguration } from 'model/services/metadata';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { AppCatalogRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
  catalogIndexResponse,
  getMockCall,
  getMockCallTimes,
  metadataResponse,
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

describe('Apps and App Catalog', () => {
  beforeEach(() => {
    getInstallationInfo.mockResolvedValueOnce(AWSInfoResponse);
    getConfiguration.mockResolvedValueOnce(metadataResponse);
    getMockCall('/v4/clusters/', v4ClustersResponse);
    getMockCallTimes('/v4/organizations/', orgsResponse);
  });

  describe('App Catalogs, Apps, Installing Apps', () => {
    it('renders all non internal app catalogs in the app catalogs overview', async () => {
      getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse, 2);
      getMockCall('/v4/user/', userResponse);
      getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
      getMockCall(
        `/v4/clusters/${V4_CLUSTER.id}/status/`,
        v4AWSClusterStatusResponse
      );
      getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
      getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);

      nock('https://catalogshost')
        .get('/giantswarm-incubator-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);
      nock('https://catalogshost')
        .get('/giantswarm-test-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);
      nock('https://catalogshost')
        .get('/helmstable/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);
      nock('https://catalogshost')
        .get('/giantswarm-catalog/index.yaml')
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
      getMockCall('/v4/user/', userResponse);
      getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
      getMockCall(
        `/v4/clusters/${V4_CLUSTER.id}/status/`,
        v4AWSClusterStatusResponse
      );
      getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
      getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);

      nock('https://catalogshost')
        .get('/giantswarm-incubator-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);
      nock('https://catalogshost')
        .get('/giantswarm-test-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);
      nock('https://catalogshost')
        .get('/helmstable/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);
      nock('https://catalogshost')
        .get('/giantswarm-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);

      const appCatalogListPath = RoutePath.createUsablePath(
        AppCatalogRoutes.AppList,
        { catalogName: 'giantswarm-incubator' }
      );
      const { findByText } = renderRouteWithStore(appCatalogListPath);

      const catalogTitle = await findByText('Giant Swarm Incubator');
      expect(catalogTitle).toBeInTheDocument();
    });

    it('renders the app detail page for a given app', async () => {
      getMockCallTimes('/v4/user/', userResponse);
      getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
      getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
      getMockCall(
        `/v4/clusters/${V4_CLUSTER.id}/status/`,
        v4AWSClusterStatusResponse
      );
      getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
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
      nock('https://catalogshost')
        .get('/giantswarm-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);

      const appCatalogListPath = RoutePath.createUsablePath(
        AppCatalogRoutes.AppDetail,
        {
          catalogName: 'giantswarm-incubator',
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
      nock(API_ENDPOINT)
        .intercept(
          `/v4/clusters/${V4_CLUSTER.id}/apps/nginx-ingress-controller-app/`,
          'PUT'
        )
        .reply(StatusCodes.Ok);

      getMockCallTimes('/v4/user/', userResponse);
      getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
      getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse, 2);
      getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
      getMockCallTimes(
        `/v4/clusters/${V4_CLUSTER.id}/`,
        v4AWSClusterResponse,
        2
      );
      getMockCallTimes(
        `/v4/clusters/${V4_CLUSTER.id}/status/`,
        v4AWSClusterStatusResponse,
        2
      );
      getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
      getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
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
      nock('https://catalogshost')
        .get('/giantswarm-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);

      const appCatalogListPath = RoutePath.createUsablePath(
        AppCatalogRoutes.AppDetail,
        {
          catalogName: 'giantswarm-incubator',
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

      // Check if the user got redirected to the cluster detail page, apps tab
      await findByText(/these apps and services are preinstalled on your cluster and managed by Giant Swarm./i);
    });

    it('installs an app in a cluster, with custom settings', async () => {
      const testApp = 'nginx-ingress-controller-app';

      const installAppResponse = {
        code: 'RESOURCE_CREATED',
        message: `We're installing your app called 'test-app' on ${V4_CLUSTER.id}`,
      };
      nock(API_ENDPOINT)
        .intercept(`/v4/clusters/${V4_CLUSTER.id}/apps/test-app/`, 'PUT', {
          spec: {
            catalog: 'giantswarm-incubator',
            name: 'nginx-ingress-controller-app',
            namespace: 'kube-system',
            version: '1.1.1',
          },
        })
        .reply(StatusCodes.Ok, installAppResponse);

      getMockCallTimes('/v4/user/', userResponse);
      getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
      getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
      getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse, 2);
      getMockCallTimes(
        `/v4/clusters/${V4_CLUSTER.id}/`,
        v4AWSClusterResponse,
        2
      );
      getMockCallTimes(
        `/v4/clusters/${V4_CLUSTER.id}/status/`,
        v4AWSClusterStatusResponse,
        2
      );
      getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
      getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
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
      nock('https://catalogshost')
        .get('/giantswarm-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);

      const appCatalogListPath = RoutePath.createUsablePath(
        AppCatalogRoutes.AppDetail,
        {
          catalogName: 'giantswarm-incubator',
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
      let fileInput = getByLabelText(/User level config values YAML:/i);
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
      fileInput = getByLabelText(/User level secret values YAML:/i);
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

      // Check if the user got redirected to the cluster detail page, apps tab
      await findByText(/these apps and services are preinstalled on your cluster and managed by Giant Swarm./i);
    });
  });

  describe('Preinstalled Apps', () => {
    it('does not list apps twice when they are present in the release endpoint as well as the hardcoded app metas list', async () => {
      getMockCallTimes('/v4/user/', userResponse);
      getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
      getMockCall('/v4/appcatalogs/', appCatalogsResponse);
      getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
      getMockCallTimes(
        `/v4/clusters/${V4_CLUSTER.id}/`,
        v4AWSClusterResponse,
        2
      );
      getMockCallTimes(
        `/v4/clusters/${V4_CLUSTER.id}/status/`,
        v4AWSClusterStatusResponse,
        2
      );
      getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, []);
      getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
      getMockCall('/v4/releases/', releasesResponse);

      const clusterDetailPath = RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.Detail.Home,
        {
          orgId: ORGANIZATION,
          clusterId: V4_CLUSTER.id,
        }
      );
      const { findByText } = renderRouteWithStore(clusterDetailPath);

      const appsTab = await findByText(/^apps$/i);
      fireEvent.click(appsTab);

      // findByText throws an error if there are multiple elements with the text
      // in the document. So this is also a guarantee that these apps are not
      // showing up twice.
      const certExporterApp = await findByText('cert-exporter');
      expect(certExporterApp).toBeInTheDocument();

      // findByText throws an error if there are multiple elements with the text
      // in the document. So this is also a guarantee that cert-exporter is not
      // showing up twice.
      const netExporterApp = await findByText('net-exporter');
      expect(netExporterApp).toBeInTheDocument();

      // Make sure we're not removing ALL manually added apps.
      const rbacApp = await findByText('RBAC and PSP defaults');
      expect(rbacApp).toBeInTheDocument();

      // Make sure they get their version set correctly from the release endpoint
      // response.
      await within(certExporterApp).findByText('1.2.3');
      await within(netExporterApp).findByText('2.3.4');
    });
  });
});
