import '@testing-library/jest-dom/extend-expect';
import {
  AWSInfoResponse,
  ORGANIZATION,
  V4_CLUSTER,
  appCatalogsResponse,
  appsResponse,
  getPersistedMockCall,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v4ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';
import { wait } from '@testing-library/react';

const BASE_ROUTE = '/organizations';

const requests = {};

// Responses to requests
beforeAll(() => {
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
  // Empty response
  requests.keyPairs = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/key-pairs/`
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

it('navigation has selected the right page when in organization list route', async () => {
  const { getByText } = renderRouteWithStore(BASE_ROUTE);

  await wait(() => {
    expect(
      //
      getByText(
        (content, element) =>
          element.tagName.toLowerCase() === 'a' &&
          element.attributes['aria-current'] &&
          element.attributes['aria-current'].value === 'page' &&
          content === 'Organizations'
      )
    ).toBeInTheDocument();
  });
});

it('correctly renders the organizations list', async () => {
  const { getByText, getByTestId } = renderRouteWithStore(BASE_ROUTE);

  // We want to make sure correct values appear in the row for number of clusters
  // and members.
  const members = orgResponse.members.length.toString();
  const clusters = v4ClustersResponse
    .filter(cluster => cluster.owner === orgResponse.id)
    .length.toString();

  await wait(() =>
    expect(getByTestId(`${orgResponse.id}-name`)).toBeInTheDocument()
  );

  expect(getByTestId(`${orgResponse.id}-members`).textContent).toBe(members);
  expect(getByTestId(`${orgResponse.id}-clusters`).textContent).toBe(clusters);
  expect(getByTestId(`${orgResponse.id}-delete`)).toBeInTheDocument();

  expect(getByText(/create new organization/i)).toBeInTheDocument();
});
