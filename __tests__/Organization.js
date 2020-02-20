import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  AWSInfoResponse,
  generateRandomString,
  getMockCall,
  getMockCallTimes,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
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

afterEach(() => {
  if (!nock.isDone()) {
    console.error('Nock has pending mocks:', nock.pendingMocks());
  }

  nock.cleanAll();
});

describe('', () => {
  beforeEach(() => {
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/info/', AWSInfoResponse);
    getMockCall('/v4/organizations/', orgsResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`, []);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);
    getMockCall('/v4/clusters/', v4ClustersResponse);

    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
  });

  describe('Navigation', () => {
    it('navigation has selected the right page when in organization list route', async () => {
      const { findByText } = renderRouteWithStore(OrganizationsRoutes.Home);

      const navElement = await findByText(
        (content, element) =>
          element.tagName.toLowerCase() === 'a' &&
          element.attributes['aria-current'] &&
          element.attributes['aria-current'].value === 'page' &&
          content === 'Organizations'
      );

      expect(navElement).toBeInTheDocument();

      // The nav shows up before the last request is done, so wait a bit
      // otherwise we'll either get pending nock error, console errors due to
      // failed network request after nock.cleanAll();
      await wait(() => {
        expect(nock.isDone()).toBe(true);
      });
    });
  });

  describe('Organizations basic', () => {
    it('correctly renders the organizations list', async () => {
      const { getByTestId, getByText, findByTestId } = renderRouteWithStore(
        OrganizationsRoutes.Home
      );

      // We want to make sure correct values appear in the row for number of clusters
      // and members.
      const members = orgResponse.members.length.toString();
      const clusters = v4ClustersResponse
        .filter(cluster => cluster.owner === orgResponse.id)
        .length.toString();

      expect(await findByTestId(`${orgResponse.id}-name`)).toBeInTheDocument();
      expect(getByTestId(`${orgResponse.id}-members`).textContent).toBe(
        members
      );
      expect(getByTestId(`${orgResponse.id}-clusters`).textContent).toBe(
        clusters
      );
      expect(getByTestId(`${orgResponse.id}-delete`)).toBeInTheDocument();
      expect(getByText(/create new organization/i)).toBeInTheDocument();
    });

    it('shows the organization creation modal when requested and organization creation success flash', async () => {
      const newOrganizationId = generateRandomString();

      // prettier-ignore
      getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
      getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`, []);
      nock(API_ENDPOINT)
        .intercept(`/v4/organizations/${newOrganizationId}/`, 'PUT')
        .reply(StatusCodes.Created, { id: newOrganizationId, members: null });
      getMockCall('/v4/organizations/', [
        ...orgsResponse,
        { id: newOrganizationId },
      ]);
      getMockCall(`/v4/organizations/${newOrganizationId}/`, {
        id: newOrganizationId,
        members: [],
        credentials: null,
      });
      getMockCall(`/v4/organizations/${newOrganizationId}/credentials/`);

      const {
        getByText,
        getByLabelText,
        findByText,
        findByTestId,
      } = renderRouteWithStore(OrganizationsRoutes.Home);

      const createOrgButton = await findByText('Create New Organization');
      fireEvent.click(createOrgButton);

      await findByText('Create an Organization');

      const newOrganizationNameInput = getByLabelText(/Organization Name:/);
      expect(newOrganizationNameInput).toBeInTheDocument();

      fireEvent.change(newOrganizationNameInput, {
        target: { value: newOrganizationId },
      });

      fireEvent.click(getByText('Create Organization'));

      await findByText(
        (_, element) =>
          element.innerHTML ===
          `Organization <code>${newOrganizationId}</code> has been created`
      );

      await findByTestId(`${newOrganizationId}-name`);
    });

    it('shows organization details correctly', async () => {
      getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`, []);

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
      const organizationMember = await findByTestId(
        'organization-member-email'
      );
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
      getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, {}, 2);
      getMockCall('/v4/organizations/', orgsResponse);
      getMockCallTimes(`/v4/organizations/${ORGANIZATION}/`, orgResponse, 2);

      nock(API_ENDPOINT)
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

      const { findByText, findByLabelText } = renderRouteWithStore(
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

      expect(
        await findByText(
          (_, element) =>
            element.innerHTML ===
            `Added <code>${newMemberEmail}</code> to organization <code>${orgResponse.id}</code>`
        )
      ).toBeInTheDocument();

      await wait(() => {
        expect(nock.isDone()).toBe(true);
      });
    });

    it('allows to remove a member from an organization', async () => {
      getMockCall('/v4/organizations/', orgsResponse);
      getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
      getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);

      // After removing a member from an org, Happa does a full refresh of the
      // organizations page. So we need these requests again.
      getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
      const lastOrgCredentialCall = getMockCall(
        `/v4/organizations/${ORGANIZATION}/credentials/`
      );

      nock(API_ENDPOINT)
        .intercept(`/v4/organizations/${orgResponse.id}/`, 'PATCH')
        .reply(StatusCodes.Ok, {
          code: 'RESOURCE_UPDATED',
          message: `The organization with ID ${orgResponse.id} has been updated.`,
        });

      const organizationDetailsPath = RoutePath.createUsablePath(
        OrganizationsRoutes.Detail,
        { orgId: orgResponse.id }
      );
      const { findByText, findByTestId } = renderRouteWithStore(
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

      const flashMessage = await findByText(
        (_, element) =>
          element.innerHTML ===
          `Removed <code>${orgResponse.members[0].email}</code> from organization <code>${orgResponse.id}</code>`
      );

      expect(flashMessage).toBeInTheDocument();

      // The flash shows up before we refresh the list. So we hold here and wait for the
      // last request to be done, otherwise we'll get a pending nock failure.
      await wait(() => {
        lastOrgCredentialCall.done();
      });
    });
  });
});

describe('Organization deletion', () => {
  it('shows the organization deletion modal when requested and organization deletion success flash', async () => {
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/info/', AWSInfoResponse);
    getMockCallTimes(`/v4/organizations/${ORGANIZATION}/`, orgResponse, 2);
    getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);
    getMockCall('/v4/clusters/', v4ClustersResponse);

    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );

    const organizationToDeleteId = generateRandomString();

    getMockCall('/v4/organizations/', [
      ...orgsResponse,
      { id: organizationToDeleteId },
    ]);

    getMockCall('/v4/organizations/', orgsResponse);

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

    const {
      getByText,
      findByText,
      findByTestId,
      getByTestId,
      queryByTestId,
    } = renderRouteWithStore(OrganizationsRoutes.Home);

    const expectedElement = await findByTestId(
      `${organizationToDeleteId}-name`
    );
    expect(expectedElement).toBeInTheDocument();

    organizationToDeleteRequest.done();
    credentialsRequest.done();

    fireEvent.click(getByTestId(`${organizationToDeleteId}-delete`));

    expect(
      await findByText(
        (_, element) =>
          element.textContent ===
          `Are you sure you want to delete ${organizationToDeleteId}?`
      )
    ).toBeInTheDocument();
    expect(getByText('There is no undo')).toBeInTheDocument();

    fireEvent.click(getByText('Delete Organization'));

    expect(
      await findByText(
        (_, element) =>
          element.innerHTML ===
          `Organization <code>${organizationToDeleteId}</code> deleted`
      )
    ).toBeInTheDocument();

    deleteOrganizationRequest.done();

    expect(await findByTestId(`${orgResponse.id}-name`)).toBeInTheDocument();

    await wait(() => {
      expect(
        queryByTestId(`${organizationToDeleteId}-name`)
      ).not.toBeInTheDocument();
    });

    await wait(() => {
      expect(nock.isDone()).toBe(true);
    });
  });
});
