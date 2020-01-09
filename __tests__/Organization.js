import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
  generateRandomString,
  getMockCall,
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

const BASE_ROUTE = '/organizations';

// Responses to requests
beforeEach(() => {
  getMockCall('/v4/organizations/', orgsResponse);
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/info/', AWSInfoResponse);
  getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/`,
    orgResponse
  );
  getMockCall('/v4/clusters/', v4ClustersResponse);
  getMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/`,
    v4AWSClusterResponse
  );
  getMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse
  );
  getMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/apps/`,
    appsResponse
  );
  // Empty response
  getMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/key-pairs/`
  );
  getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/credentials/`
  );
  getMockCall('/v4/releases/', releasesResponse);
  getMockCall(
    '/v4/appcatalogs/',
    appCatalogsResponse
  );
});

// Stop persisting responses
afterEach(() => {
  expect(nock.isDone());
  nock.cleanAll();
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

it('shows the organization creation modal when requested and organization creation success flash', async () => {
  const newOrganizationId = generateRandomString();
  const newOrganizationPutRequest = nock(API_ENDPOINT)
    .intercept(`/v4/organizations/${newOrganizationId}/`, 'PUT')
    .reply(StatusCodes.Created, { id: newOrganizationId, members: null });

  const { getByText, getByLabelText, getByTestId } = renderRouteWithStore(
    BASE_ROUTE
  );

  await wait(() => {
    expect(getByText('Create New Organization')).toBeInTheDocument();
  });
  fireEvent.click(getByText('Create New Organization'));

  await wait(() => {
    expect(getByText('Create an Organization')).toBeInTheDocument();
  });

  const newOrganizationNameInput = getByLabelText(/Organization Name:/);
  expect(newOrganizationNameInput).toBeInTheDocument();

  fireEvent.change(newOrganizationNameInput, {
    target: { value: newOrganizationId },
  });

  fireEvent.click(getByText('Create Organization'));

  newOrganizationPutRequest.done();
  getMockCall(`/v4/organizations/${newOrganizationId}/`, {
    id: newOrganizationId,
    members: [],
    credentials: null,
  });
  getMockCall(`/v4/organizations/${newOrganizationId}/credentials/`);

  const updatedOrganizationsRequest = getMockCall('/v4/organizations/', [
    ...orgsResponse,
    { id: newOrganizationId },
  ]);

  await wait(() => {
    expect(
      getByText(
        (_, element) =>
          element.innerHTML ===
          `Organization <code>${newOrganizationId}</code> has been created`
      )
    ).toBeInTheDocument();
  });
  updatedOrganizationsRequest.done();

  await wait(() => {
    expect(getByTestId(`${newOrganizationId}-name`)).toBeInTheDocument();
  });
});
