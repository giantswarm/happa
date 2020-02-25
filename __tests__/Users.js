import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait, within } from '@testing-library/react';
import { forceRemoveAll } from 'lib/flashMessage';
import nock from 'nock';
import { StatusCodes } from 'shared';
import { UsersRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  AWSInfoResponse,
  getMockCall,
  gsOrgResponse,
  invitesResponse,
  ORGANIZATION,
  orgResponse,
  orgsWithGSResponse,
  USER_EMAIL,
  userResponse,
  usersResponse,
  V4_CLUSTER,
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v4ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

describe('Users', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  // Responses to requests
  beforeEach(() => {
    getMockCall('/v4/info/', AWSInfoResponse);
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/users/', usersResponse);
    getMockCall('/v4/organizations/', orgsWithGSResponse);
    getMockCall('/v4/clusters/', v4ClustersResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AWSClusterStatusResponse
    );
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
    getMockCall(`/v4/organizations/giantswarm/`, gsOrgResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/organizations/giantswarm/credentials/`);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    nock(global.config.passageEndpoint)
      .get('/invites/')
      .reply(StatusCodes.Ok, invitesResponse);
  });

  // Stop persisting responses
  afterEach(async () => {
    await wait(() => {
      const isDone = nock.isDone();

      if (!isDone) {
        // eslint-disable-next-line no-console
        console.error('Nock has pending mocks:', nock.pendingMocks());
      }
      expect(isDone).toBeTruthy();
    });

    nock.cleanAll();

    forceRemoveAll();
  });

  it('renders without crashing', async () => {
    const { findByText } = renderRouteWithStore(UsersRoutes.Home);

    const usersTitle = await findByText(
      /This is the list of user accounts on/i
    );
    expect(usersTitle).toBeInTheDocument();
  });

  it('invites a new user to use the app', async () => {
    const desiredEmail = 'someemail@giantswarm.io';

    nock(global.config.passageEndpoint)
      .get('/invites/')
      .reply(StatusCodes.Ok, invitesResponse);

    nock(global.config.passageEndpoint)
      .post('/invite/')
      .reply(StatusCodes.Ok, {
        created_at: new Date().toISOString(),
        email: desiredEmail,
        invitation_accept_link: `${API_ENDPOINT}/signup/HtQZ5KxIunxSvXN0`,
        invitation_accept_token: 'HtQZ5KxIunxSvXN0',
        invitation_token_hash:
          '0aec197cc1ca5bda889479f7802bac9c71b588e0cb6822885320673ed6c526a2',
        invited_by: USER_EMAIL,
        organizations: [ORGANIZATION, 'giantswarm'],
        status: 'READY',
      });

    const { findByText, getByText, getByLabelText } = renderRouteWithStore(
      UsersRoutes.Home
    );

    let inviteButton = await findByText(/invite user/i);
    expect(inviteButton).toBeInTheDocument();
    fireEvent.click(inviteButton);

    const emailInput = getByLabelText(/email/i);
    fireEvent.change(emailInput, {
      target: { value: 'someemail@somedomain.com' },
    });

    const orgsMultiSelectLabel = getByText(/organizations:/i);
    const orgsMultiSelectWrapper = orgsMultiSelectLabel.nextSibling;
    const orgsMultiSelectHeader = orgsMultiSelectWrapper.querySelector(
      '.dropdown-heading'
    );

    // Open multi select
    fireEvent.click(orgsMultiSelectHeader);

    // Select `giantswarm` organization
    const gsOrgLabel = within(orgsMultiSelectWrapper).getByText(/giantswarm/i);
    fireEvent.click(gsOrgLabel);

    // Email input validation

    /**
     * Check if it is required to have a `@giantswarm.io` email
     * in order to join the `giantswarm` organization
     */
    const gsDomainOnlyWarning = getByText(
      /only @giantswarm.io domains may be invited to the giantswarm organization./i
    );
    expect(gsDomainOnlyWarning).toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: { value: 'someemail@giantswarm.io.com' },
    });
    expect(gsDomainOnlyWarning).toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: { value: 'giantswarm.io@someemail' },
    });
    expect(gsDomainOnlyWarning).toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: { value: 'someemail@giantswarm.com' },
    });
    expect(gsDomainOnlyWarning).toBeInTheDocument();

    // Change email to one at the `giantswarm.io` domain
    fireEvent.change(emailInput, {
      target: { value: desiredEmail },
    });
    // Check if the warning is gone
    expect(gsDomainOnlyWarning).not.toBeInTheDocument();

    inviteButton = getByText('Invite User');
    fireEvent.click(inviteButton);

    const progressText = await findByText(
      new RegExp(`${desiredEmail} has been invited`, 'i')
    );
    expect(progressText).toBeInTheDocument();
  });

  it(`deletes an existing user's account`, async () => {
    const desiredEmail = 'developer4@giantswarm.io';
    const encodedEmail = encodeURIComponent(desiredEmail);

    nock(API_ENDPOINT)
      .intercept(`/v4/users/${encodedEmail}/`, 'DELETE')
      .reply(StatusCodes.Ok);

    const { findByText, getByText } = renderRouteWithStore(UsersRoutes.Home);

    const selectedEmailCell = await findByText(/developer4@giantswarm.io/i);
    let deleteButton = within(selectedEmailCell.parentNode).getByText(
      /delete/i
    );
    fireEvent.click(deleteButton);

    expect(
      getByText(/Are you sure you want to delete developer4@giantswarm.io?/i)
    ).toBeInTheDocument();

    deleteButton = getByText(/delete user/i);
    fireEvent.click(deleteButton);

    await wait(() => {
      expect(deleteButton).not.toBeInTheDocument();
    });
  });
});
