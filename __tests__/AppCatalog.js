import '@testing-library/jest-dom/extend-expect';

import RoutePath from 'lib/routePath';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { AppCatalogRoutes } from 'shared/constants/routes';
import {
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
  catalogIndexResponse,
  getPersistedMockCall,
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

// Tests setup
const requests = {};

// Responses to requests
beforeAll(() => {
  // prettier-ignore
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
  requests.clusters = getPersistedMockCall('/v4/clusters/', v4ClustersResponse);
  requests.cluster = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/`,
    v4AWSClusterResponse
  );
  requests.status = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse
  );
  requests.apps = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/apps/`,
    appsResponse
  );
  requests.credentials = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/credentials/`
  );
  requests.releases = getPersistedMockCall('/v4/releases/', releasesResponse);

  requests.appcatalogs = getPersistedMockCall(
    '/v4/appcatalogs/',
    appCatalogsResponse
  );

  nock('https://cors-anywhere.herokuapp.com')
    .get(/.*$/)
    .reply(
      StatusCodes.InternalServerError,
      'Not supposed to get here in these tests.'
    )
    .persist();
});

// Stop persisting responses
afterAll(() => {
  Object.keys(requests).forEach(req => {
    requests[req].persist(false);
  });
});

/************ TESTS ************/

it('renders all non internal app catalogs in the app catalogs overview', async () => {
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
