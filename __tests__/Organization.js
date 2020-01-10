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
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/info/', AWSInfoResponse);
  getPersistedMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
  getMockCall('/v4/clusters/', v4ClustersResponse);
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
  getMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse
  );
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
  // Empty response
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
  getPersistedMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
  getMockCall('/v4/releases/', releasesResponse);
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
});

// Stop persisting responses
afterEach(() => {
  expect(nock.isDone());
  nock.cleanAll();
});

it('navigation has selected the right page when in organization list route', async () => {
  getMockCall('/v4/organizations/', orgsResponse);
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
  getMockCall('/v4/organizations/', orgsResponse);
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
  getMockCall('/v4/organizations/', orgsResponse);
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

it('shows the organization deletion modal when requested and organization deletion success flash', async () => {
  const organizationToDeleteId = generateRandomString();
  getMockCall('/v4/organizations/', [
    ...orgsResponse,
    { id: organizationToDeleteId },
  ]);
  const organizationToDeleteRequest = getMockCall(
    `/v4/organizations/${organizationToDeleteId}/`,
    {
      id: organizationToDeleteId,
      members: [],
      credentials: [],
    }
  );
  const credentialsRequest = getMockCall(
    `/v4/organizations/${organizationToDeleteId}/credentials/`
  );
  const deleteOrganizationRequest = nock(API_ENDPOINT)
    .intercept(`/v4/organizations/${organizationToDeleteId}/`, 'DELETE')
    .reply(StatusCodes.Ok, {
      code: 'RESOURCE_DELETED',
      message: `The organization with ID \`${organizationToDeleteId}\` has been deleted.`,
    });

  const { getByText, getByTestId, queryByTestId } = renderRouteWithStore(
    BASE_ROUTE
  );

  await wait(() => {
    expect(getByTestId(`${organizationToDeleteId}-name`)).toBeInTheDocument();
  });

  organizationToDeleteRequest.done();
  credentialsRequest.done();

  fireEvent.click(getByTestId(`${organizationToDeleteId}-delete`));

  await wait(() => {
    expect(
      getByText(
        (_, element) =>
          element.textContent ===
          `Are you sure you want to delete ${organizationToDeleteId}?`
      )
    ).toBeInTheDocument();
    expect(getByText('There is no undo')).toBeInTheDocument();
  });

  getMockCall('/v4/organizations/', orgsResponse);
  fireEvent.click(getByText('Delete Organization'));

  await wait(() => {
    expect(
      getByText(
        (_, element) =>
          element.innerHTML ===
          `Organization <code>${organizationToDeleteId}</code> deleted`
      )
    ).toBeInTheDocument();
  });

  deleteOrganizationRequest.done();
  await wait(() => {
    expect(getByTestId(`${orgResponse.id}-name`)).toBeInTheDocument();
    expect(
      queryByTestId(`${organizationToDeleteId}-name`)
    ).not.toBeInTheDocument();
  });
});

it('shows organization details correctly', async () => {
  getMockCall('/v4/organizations/', orgsResponse);
  const {
    findByText,
    getByText,
    getByTestId,
    queryByTestId,
    getByTitle,
  } = renderRouteWithStore(`${BASE_ROUTE}/${orgResponse.id}`);

  const pageTitle = await findByText(`Organization: ${orgResponse.id}`);
  expect(pageTitle).toBeInTheDocument();

  // id column in clusters table
  expect(
    getByTitle(`Unique Cluster ID: ${v4AWSClusterResponse.id}`)
  ).toBeInTheDocument();

  // name cloumn in clusters table
  expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();

  // release column in clusters table
  expect(getByText(V4_CLUSTER.releaseVersion)).toBeInTheDocument();

  // users
  const usersTable = getByTestId('org-detail-users-wrapper');
  expect(usersTable.querySelector('tbody > tr > td').textContent).toBe(
    orgResponse.members[0].email
  );

  await wait(() => {
    expect(queryByTestId('Loading credentials')).not.toBeInTheDocument();
  });

  expect(
    getByText(
      'No credentials set. Clusters of this organization will be created in the default tenant cluster account of this installation.'
    )
  ).toBeInTheDocument();
});
