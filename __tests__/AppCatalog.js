import '@testing-library/jest-dom/extend-expect';
import {
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
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
import { fireEvent, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'testUtils/renderUtils';
import nock from 'nock';

// Cluster and route we are testing with.
const ROUTE = `/app-catalogs/`;

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
});

// Stop persisting responses
afterAll(() => {
  Object.keys(requests).forEach(req => {
    requests[req].persist(false);
  });
});

/************ TESTS ************/

it('renders all non internal app catalogs in the app catalogs overview', async () => {
  const { findByText, debug, getAllByText, getByTestId } = renderRouteWithStore(
    ROUTE
  );

  const introText = await findByText('Pick an App Catalog to browse all the Apps in it.')
  expect(introText).toBeInTheDocument();

  for (const catalog of appCatalogsResponse) {
    if (catalog.metadata.labels['application.giantswarm.io/catalog-type'] === 'internal') {
      continue;
    }

    const catalogTitle = await findByText(catalog.spec.title)
    expect(catalogTitle).toBeInTheDocument();
  }
});
