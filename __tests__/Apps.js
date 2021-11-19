import { fireEvent, screen, within } from '@testing-library/react';
import { isInternal } from 'Apps/AppsList/utils';
import RoutePath from 'lib/routePath';
import { StatusCodes } from 'model/constants';
import { AppsRoutes, OrganizationsRoutes } from 'model/constants/routes';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
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
} from 'test/mockHttpCalls';
import { renderRouteWithStore } from 'test/renderUtils';

describe('Apps and App Catalog', () => {
  beforeEach(() => {
    getConfiguration.mockResolvedValueOnce(metadataResponse);
    getMockCall('/v4/clusters/', v4ClustersResponse);
    getMockCallTimes('/v4/organizations/', orgsResponse);
  });

  describe('App Catalogs, Apps, Installing Apps', () => {
    describe('internal app catalogs', () => {
      beforeEach(() => {
        getMockCall('/v4/appcatalogs/', appCatalogsResponse);
        getMockCall('/v4/user/', userResponse);
        getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
        getMockCall(
          `/v4/clusters/${V4_CLUSTER.id}/status/`,
          v4AWSClusterStatusResponse
        );
        getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
        getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
      });

      it('renders all non internal app catalogs in the app catalogs overview for non admins', async () => {
        const nonAdminUserInStorage = {
          user: '{"email":"developer@giantswarm.io","auth":{"scheme":"giantswarm","token":"a-valid-token"},"isAdmin":false}',
        };
        const { findByText } = renderRouteWithStore(
          AppsRoutes.Home,
          {},
          nonAdminUserInStorage
        );

        const introText = await findByText(
          /Managed apps for use in your clusters/i
        );

        expect(introText).toBeInTheDocument();

        for (const catalog of appCatalogsResponse) {
          // Skip expectation for internal catalogs.
          // They should not show up for non-admins.
          if (
            catalog.metadata.labels[
              'application.giantswarm.io/catalog-visibility'
            ] === 'internal'
          ) {
            continue;
          }

          const catalogTitle = await findByText(catalog.spec.title);
          expect(catalogTitle).toBeInTheDocument();
        }
      });

      it('renders all app catalogs in the app catalogs overview for admins', async () => {
        const adminUserInStorage = {
          user: '{"email":"developer@giantswarm.io","auth":{"scheme":"giantswarm","token":"a-valid-token"},"isAdmin":true}',
        };
        const { findByText, findByTestId } = renderRouteWithStore(
          AppsRoutes.Home,
          {},
          adminUserInStorage
        );

        const introText = await findByText(
          /Managed apps for use in your clusters/i
        );

        expect(introText).toBeInTheDocument();

        const main = await findByTestId('main');

        for (const catalog of appCatalogsResponse) {
          let titleToFind = catalog.spec.title;
          if (
            isInternal(catalog) &&
            catalog.spec.title.startsWith('Giant Swarm')
          ) {
            titleToFind = catalog.spec.title.replace('Giant Swarm ', '');
          }
          const catalogTitle = await within(main).findByText(
            new RegExp(titleToFind, 'i')
          );
          expect(catalogTitle).toBeInTheDocument();
        }
      });
    });

    it('renders all apps in the app list for a given catalog', async () => {
      getMockCall('/v4/appcatalogs/', appCatalogsResponse);
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

      const { findByText } = renderRouteWithStore(AppsRoutes.Home);

      const app1 = await findByText('cert-manager-app');
      expect(app1).toBeInTheDocument();

      const app2 = await findByText('nginx-ingress-controller-app');
      expect(app2).toBeInTheDocument();
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
      getMockCall('/v4/appcatalogs/', appCatalogsResponse);

      nock('https://catalogshost')
        .get('/giantswarm-incubator-catalog/index.yaml')
        .reply(StatusCodes.Ok, catalogIndexResponse);

      const appDetailPath = RoutePath.createUsablePath(AppsRoutes.AppDetail, {
        catalogName: 'giantswarm-incubator',
        app: 'nginx-ingress-controller-app',
        version: '1.1.1',
      });
      const { findByText, findByTestId } = renderRouteWithStore(appDetailPath);

      // The app's description should be there.
      // This comes from parsing the index.yaml, which is mocked in catalogIndexResponse.
      const appDescription = await findByText(
        'A Helm chart for the nginx ingress-controller v1.1.1'
      );
      expect(appDescription).toBeInTheDocument();

      const breadCrumbs = await findByTestId('breadcrumbs');
      const appBreadCrumb = await within(breadCrumbs).findByText(
        'NGINX-INGRESS-CONTROLLER-APP'
      );

      expect(appBreadCrumb).toBeInTheDocument();
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
      getMockCallTimes('/v4/appcatalogs/', appCatalogsResponse);
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

      const appDetailPath = RoutePath.createUsablePath(AppsRoutes.AppDetail, {
        catalogName: 'giantswarm-incubator',
        app: 'nginx-ingress-controller-app',
        version: '1.1.1',
      });
      const { findByText, getByText } = renderRouteWithStore(appDetailPath);

      // Press the configure button
      let installButton = await findByText(/install in cluster/i);
      fireEvent.click(installButton);

      // Select the current cluster
      fireEvent.click(getByText(V4_CLUSTER.name));

      // Install the new app
      installButton = await findByText(/install app/i);
      fireEvent.click(installButton);

      await findByText(/is being installed on/i);

      // Check if the user got redirected to the cluster detail page, apps tab
      await findByText(
        /these apps and services are preinstalled on your cluster and managed by Giant Swarm./i
      );
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
      getMockCall('/v4/appcatalogs/', appCatalogsResponse);
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

      const appCatalogListPath = RoutePath.createUsablePath(
        AppsRoutes.AppDetail,
        {
          catalogName: 'giantswarm-incubator',
          app: testApp,
          version: '1.1.1',
        }
      );
      const { findByText, getByText, getByLabelText } =
        renderRouteWithStore(appCatalogListPath);

      // Press the configure button
      let installButton = await findByText(/install in cluster/i);
      fireEvent.click(installButton);

      // Select the current cluster
      fireEvent.click(getByText(V4_CLUSTER.name));

      // Set a new application name
      const appNameInput = getByLabelText(/application name/i);
      fireEvent.change(appNameInput, {
        target: { value: 'test-app' },
      });

      // Check if namespace input is disabled
      expect(getByLabelText(/namespace/i).readOnly).toBeFalsy();

      // Upload a configmap file
      let fileInput = getByLabelText(/User level config values YAML/i);
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
      fileInput = getByLabelText(/User level secret values YAML/i);
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
      await findByText(
        /these apps and services are preinstalled on your cluster and managed by Giant Swarm./i
      );
    });

    it('displays a placeholder when trying to view apps for a catalog, and loading them fails', async () => {
      getMockCall('/v4/appcatalogs/', appCatalogsResponse);
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
        .reply(StatusCodes.InternalServerError, 'Cannot get catalog apps.');

      renderRouteWithStore(AppsRoutes.Home);

      const noAppsPlaceholder = await screen.findByText(
        /No apps found for your search/i
      );
      expect(noAppsPlaceholder).toBeInTheDocument();
    });

    it('displays a placeholder when the app the user searched for cannot be found', async () => {
      getMockCall('/v4/appcatalogs/', appCatalogsResponse);
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

      const { findByTestId } = renderRouteWithStore(AppsRoutes.Home);

      const searchInput = await findByTestId('app-search-input');

      fireEvent.change(
        searchInput,

        {
          target: { value: 'something-random' },
        }
      );

      const noAppsPlaceholder = await screen.findByText(
        /No apps found for your search/i
      );
      expect(noAppsPlaceholder).toBeInTheDocument();
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
      const { findByText, findByTestId } =
        renderRouteWithStore(clusterDetailPath);

      const clusterDetailsView = await findByTestId('cluster-details-view');
      const appsTab = await within(clusterDetailsView).findByText(/^apps$/i);
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
