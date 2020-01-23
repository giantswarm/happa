import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import RoutePath from 'lib/RoutePath';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
  generateRandomString,
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

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

// Responses to requests
beforeEach(() => {
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/info/', AWSInfoResponse);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/`, orgResponse, 2);
  getMockCall('/v4/clusters/', v4ClustersResponse);
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse, 2);
  getMockCallTimes(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse,
    2
  );
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
  // Empty response
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
  getMockCall('/v4/releases/', releasesResponse);
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
});

// Stop persisting responses
afterEach(() => {
  expect(nock.isDone());
  nock.cleanAll();
});

describe('Navigation', () => {
  it('navigation has selected the right page when in organization list route', async () => {
    getMockCall('/v4/organizations/', orgsResponse);

    const { getByText } = renderRouteWithStore(OrganizationsRoutes.Home);

    await wait(() => {
      expect(
        getByText(
          (content, element) =>
            element.tagName.toLowerCase() === 'a' &&
            element.attributes['aria-current'] &&
            element.attributes['aria-current'].value === 'page' &&
            content === 'Organizations'
        )
      ).toBeInTheDocument();
    });

    // abort any pending requests
    nock.abortPendingRequests();
  });
});

describe('Organizations basic', () => {
  beforeEach(() => {
    getMockCall('/v4/organizations/', orgsResponse);
  });

  it('correctly renders the organizations list', async () => {
    const { getByText, getByTestId } = renderRouteWithStore(
      OrganizationsRoutes.Home
    );

    // We want to make sure correct values appear in the row for number of clusters
    // and members.
    const members = orgResponse.members.length.toString();
    const clusters = v4ClustersResponse
      .filter(cluster => cluster.owner === orgResponse.id)
      .length.toString();

    await wait(() => {
      expect(getByTestId(`${orgResponse.id}-name`)).toBeInTheDocument();
    });

    expect(getByTestId(`${orgResponse.id}-members`).textContent).toBe(members);
    expect(getByTestId(`${orgResponse.id}-clusters`).textContent).toBe(
      clusters
    );
    expect(getByTestId(`${orgResponse.id}-delete`)).toBeInTheDocument();

    expect(getByText(/create new organization/i)).toBeInTheDocument();
  });

  it('shows the organization creation modal when requested and organization creation success flash', async () => {
    const newOrganizationId = generateRandomString();

    const newOrganizationPutRequest = nock(API_ENDPOINT)
      .intercept(`/v4/organizations/${newOrganizationId}/`, 'PUT')
      .reply(StatusCodes.Created, { id: newOrganizationId, members: null });
    const updatedOrganizationsRequest = getMockCall('/v4/organizations/', [
      ...orgsResponse,
      { id: newOrganizationId },
    ]);
    getMockCall(`/v4/organizations/${newOrganizationId}/`, {
      id: newOrganizationId,
      members: [],
      credentials: null,
    });
    getMockCall(`/v4/organizations/${newOrganizationId}/credentials/`);

    const { getByText, getByLabelText, getByTestId } = renderRouteWithStore(
      OrganizationsRoutes.Home
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

  it('shows organization details correctly', async () => {
    getMockCallTimes(`/v4/organizations/${ORGANIZATION}/`, orgResponse, 1);

    const organizationDetailsPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Detail,
      { orgId: orgResponse.id }
    );
    const {
      findByText,
      getByText,
      findByTestId,
      queryByTestId,
      getByTitle,
    } = renderRouteWithStore(organizationDetailsPath);

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
    const organizationMember = await findByTestId('organization-member-email');
    expect(organizationMember.textContent).toBe(orgResponse.members[0].email);

    await wait(() => {
      expect(queryByTestId('Loading credentials')).not.toBeInTheDocument();
    });

    expect(
      getByText(
        'No credentials set. Clusters of this organization will be created in the default tenant cluster account of this installation.'
      )
    ).toBeInTheDocument();
  });

  it('allows to add an user to an organization', async () => {
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/organizations/', orgsResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
    const patchOrganizationRequest = nock(API_ENDPOINT)
      .intercept(`/v4/organizations/${orgResponse.id}/`, 'PATCH')
      .reply(StatusCodes.Ok, {
        code: 'RESOURCE_UPDATED',
        message: `The organization with ID ${orgResponse.id} has been updated.`,
      });

    const newMemberEmail = `${generateRandomString()}@giantswarm.io`;

    const organizationDetailsPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Detail,
      { orgId: orgResponse.id }
    );
    const { findByText, getByText, findByLabelText } = renderRouteWithStore(
      organizationDetailsPath
    );

    const addMemberButton = await findByText('Add Member');
    expect(addMemberButton).toBeInTheDocument();

    fireEvent.click(addMemberButton);

    const newMemberEmailField = await findByLabelText('Email:');
    expect(newMemberEmailField).toBeInTheDocument();

    fireEvent.change(newMemberEmailField, {
      target: { value: newMemberEmail },
    });

    fireEvent.click(await findByText('Add Member to Organization'));

    await wait(() => {
      expect(
        getByText(
          (_, element) =>
            element.innerHTML ===
            `Added <code>${newMemberEmail}</code> to organization <code>${orgResponse.id}</code>`
        )
      ).toBeInTheDocument();
    });

    patchOrganizationRequest.done();
  });

  it('allows to remove a member from an organization', async () => {
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/organizations/', orgsResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
    const patchOrganizationRequest = nock(API_ENDPOINT)
      .intercept(`/v4/organizations/${orgResponse.id}/`, 'PATCH')
      .reply(StatusCodes.Ok, {
        code: 'RESOURCE_UPDATED',
        message: `The organization with ID ${orgResponse.id} has been updated.`,
      });

    const organizationDetailsPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Detail,
      { orgId: orgResponse.id }
    );
    const { getByText, findByText, findByTestId } = renderRouteWithStore(
      organizationDetailsPath
    );

    const { email: emailToRemove } = orgResponse.members[0];

    const removeUserTableButton = await findByTestId(
      'organization-member-remove'
    );
    expect(removeUserTableButton.textContent).toBe('Remove');

    fireEvent.click(removeUserTableButton);

    const removalNotice = await findByText(
      `Are you sure you want to remove ${emailToRemove} from ${orgResponse.id}`
    );
    expect(removalNotice).toBeInTheDocument();

    const removeUserButton = await findByText(
      'Remove Member from Organization'
    );
    expect(removeUserButton).toBeInTheDocument();

    fireEvent.click(removeUserButton);

    expect(removeUserButton.textContent).toBe('Removing Member');
    await wait(() => {
      expect(
        getByText(
          (_, element) =>
            element.innerHTML ===
            `Removed <code>${orgResponse.members[0].email}</code> from organization <code>${orgResponse.id}</code>`
        )
      ).toBeInTheDocument();
    });

    patchOrganizationRequest.done();
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, {
      ...orgResponse,
      members: [],
    });
    nock.abortPendingRequests();
  });
});

describe('Organization deletion', () => {
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
      OrganizationsRoutes.Home
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
});
