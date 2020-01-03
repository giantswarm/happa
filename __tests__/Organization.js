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

it('correctly renders the organizations list', async () => {
  const { getByText, container } = renderRouteWithStore(BASE_ROUTE);

  await wait(() => {
    expect(
      // navigation has selected the right page
      getByText(
        (content, element) =>
          element.tagName.toLowerCase() === 'a' &&
          element.attributes['aria-current'] &&
          element.attributes['aria-current'].value === 'page' &&
          content === 'Organizations'
      )
    ).toBeInTheDocument();
  });

  await wait(() => {
    // table cell for the organization
    expect(
      getByText(
        (content, element) =>
          element.tagName.toLowerCase() === 'a' &&
          element.parentElement &&
          element.parentElement.tagName.toLowerCase() === 'td' &&
          content === ORGANIZATION
      )
    ).toBeInTheDocument();
  });

  expect(
    container.querySelector(
      `i[data-orgid=${ORGANIZATION}][title="Delete this organization"]`
    )
  ).toBeInTheDocument();
  expect(getByText('Create New Organization')).toBeInTheDocument();
});
