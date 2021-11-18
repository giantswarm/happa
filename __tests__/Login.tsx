import { fireEvent, screen, waitFor } from '@testing-library/react';
import { isJwtExpired } from 'lib/helpers';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import { createSelfSubjectAccessReview } from 'model/services/mapi/authorizationv1/createSelfSubjectAccessReview';
import { createSelfSubjectRulesReview } from 'model/services/mapi/authorizationv1/createSelfSubjectRulesReview';
import { getOrganization } from 'model/services/mapi/securityv1alpha1/';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { MainRoutes } from 'shared/constants/routes';
import * as featureFlags from 'shared/featureFlags';
import {
  API_ENDPOINT,
  authTokenResponse,
  getMockCall,
  getOrganizationByName,
  metadataResponse,
  postMockCall,
  releasesResponse,
  selfSubjectAccessReviewCantListOrgs,
  selfSubjectRulesReviewWithNoOrgs,
  selfSubjectRulesReviewWithSomeOrgs,
  userResponse,
} from 'test/mockHttpCalls';
import { createInitialHistory, renderRouteWithStore } from 'test/renderUtils';

describe('Login', () => {
  beforeEach(() => {
    (getConfiguration as jest.Mock).mockResolvedValueOnce(metadataResponse);
  });

  it('renders the login page at /login', async () => {
    const { getByText } = renderRouteWithStore(MainRoutes.Login, {}, {});

    await waitFor(() => {
      expect(getByText('Welcome to Giant Swarm')).toBeInTheDocument();
    });
  });

  it('redirects to / and shows the layout after a succesful login', async () => {
    const initialMapiAuth = featureFlags.flags.CustomerSSO.enabled;
    featureFlags.flags.CustomerSSO.enabled = false;

    // Given I have a Giant Swarm API with no clusters, organizations, appcatalogs
    // that I can log in to.

    // Using persisted version of nock interceptors because weird enough in CircleCI
    // some calls are performed more than once

    // The response to the login call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postMockCall('/v4/auth-tokens/', authTokenResponse as any);
    // The response to the user info call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMockCall('/v4/user/', userResponse as any);
    // The response to the info call
    // The response to the org call (no orgs)
    getMockCall('/v4/organizations/');
    // The response to the clusters call (no clusters)
    getMockCall('/v4/clusters/');
    // The response to the appcatalogs call (no catalogs)
    getMockCall('/v4/appcatalogs/');

    // AND I arrive at the login page with nothing in the state.
    const { getByText, getByLabelText } = renderRouteWithStore(
      MainRoutes.Login,
      {},
      {}
    );

    // When I type in my email and password
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');

    fireEvent.change(emailInput, {
      target: { value: 'developer@giantswarm.io' },
    });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    // And click submit
    const button = getByText('Log in');
    fireEvent.click(button);

    // Then I should be logged in and see the home page with no orgs or clusters.
    await waitFor(() => {
      // Verify we are now on the layout page and I can see my username
      expect(getByLabelText(/developer@giantswarm.io/i)).toBeInTheDocument();
      expect(getByText(/Welcome to Giant Swarm!/i)).toBeInTheDocument();
      expect(
        getByText(/There are no organizations yet in your installation./i)
      ).toBeInTheDocument();
    });

    featureFlags.flags.CustomerSSO.enabled = initialMapiAuth;
  });

  it('tells the user to give a password if they leave it blank', async () => {
    const initialMapiAuth = featureFlags.flags.CustomerSSO.enabled;
    featureFlags.flags.CustomerSSO.enabled = false;

    // Given I arrive at the login page with nothing in the state.
    const { getByText, getByLabelText } = renderRouteWithStore(
      MainRoutes.Login,
      {},
      {}
    );

    // When I type in my email but not my password.
    const emailInput = getByLabelText('Email');
    fireEvent.change(emailInput, {
      target: { value: 'developer@giantswarm.io' },
    });

    // And click submit
    const button = getByText('Log in');
    fireEvent.click(button);

    // Then I should see a message reminding me not to leave my password blank.
    await waitFor(() => {
      expect(getByText(/Please enter your password./i)).toBeInTheDocument();
    });

    featureFlags.flags.CustomerSSO.enabled = initialMapiAuth;
  });

  it('tells the user to give a email if they leave it blank', async () => {
    const initialMapiAuth = featureFlags.flags.CustomerSSO.enabled;
    featureFlags.flags.CustomerSSO.enabled = false;

    // Given I arrive at the login page with nothing in the state.
    const { getByText, getByLabelText } = renderRouteWithStore(
      MainRoutes.Login,
      {},
      {}
    );

    // When I type in my password but not my email.
    const passwordInput = getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    // And click submit
    const button = getByText('Log in');
    fireEvent.click(button);

    // Then I should see a message reminding me not to leave my password blank.
    await waitFor(() => {
      expect(getByText(/Please provide the email/i)).toBeInTheDocument();
    });

    featureFlags.flags.CustomerSSO.enabled = initialMapiAuth;
  });

  it('shows an error if the user logs in with invalid credentials', async () => {
    const initialMapiAuth = featureFlags.flags.CustomerSSO.enabled;
    featureFlags.flags.CustomerSSO.enabled = false;

    // Given I have a Giant Swarm API that does not accept my login attempt

    // The failed 401 response to the login call
    nock(API_ENDPOINT).post('/v4/auth-tokens/').reply(StatusCodes.Unauthorized);

    // And I arrive at the login page with nothing in the state.
    const { getByText, getByLabelText } = renderRouteWithStore(
      MainRoutes.Login,
      {},
      {}
    );

    // When I type in my email and password
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');

    fireEvent.change(emailInput, {
      target: { value: 'developer@giantswarm.io' },
    });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    // And click submit
    const button = getByText('Log in');
    fireEvent.click(button);

    // Then I should see a message reminding me not to leave my password blank.
    await waitFor(() => {
      expect(getByText(/Could not log in/i)).toBeInTheDocument();
    });

    featureFlags.flags.CustomerSSO.enabled = initialMapiAuth;
  });

  it('performs the OAuth2 login flow', async () => {
    (createSelfSubjectAccessReview as jest.Mock).mockResolvedValue(
      selfSubjectAccessReviewCantListOrgs
    );
    (getOrganization as jest.Mock).mockResolvedValue(getOrganizationByName);
    (createSelfSubjectRulesReview as jest.Mock).mockResolvedValue(
      selfSubjectRulesReviewWithSomeOrgs
    );
    getMockCall('/v4/clusters/');
    getMockCall('/v4/releases/', releasesResponse);

    const history = createInitialHistory(MainRoutes.Login);

    const testAuth = new TestOAuth2(history);
    const attemptLoginMockFn = jest.spyOn(testAuth, 'attemptLogin');

    renderRouteWithStore(
      MainRoutes.Login,
      undefined,
      undefined,
      testAuth,
      history
    );

    fireEvent.click(screen.getByRole('button', { name: 'Proceed to login' }));

    expect(attemptLoginMockFn).toHaveBeenCalledWith(undefined);

    expect(await screen.findByText('Launch new cluster')).toBeInTheDocument();
    attemptLoginMockFn.mockRestore();
  });

  it('displays an error message if the OAuth2 flow fails', async () => {
    const history = createInitialHistory(MainRoutes.Login);

    const testAuth = new TestOAuth2(history);
    const handleLoginResponseMockFn = jest.spyOn(
      testAuth,
      'handleLoginResponse'
    );
    handleLoginResponseMockFn.mockImplementation(() => {
      return Promise.reject(new Error('Authentication failed.'));
    });

    renderRouteWithStore(
      MainRoutes.Login,
      undefined,
      undefined,
      testAuth,
      history
    );

    fireEvent.click(screen.getByRole('button', { name: 'Proceed to login' }));

    expect(
      await screen.findByText(
        'Please log in again, as your previously saved credentials appear to be invalid.'
      )
    ).toBeInTheDocument();
    handleLoginResponseMockFn.mockRestore();
  });

  it('displays a warning message if the user is logged in via OAuth2 and does not have any permissions', async () => {
    (createSelfSubjectAccessReview as jest.Mock).mockResolvedValue(
      selfSubjectAccessReviewCantListOrgs
    );
    (getOrganization as jest.Mock).mockResolvedValue(getOrganizationByName);
    (createSelfSubjectRulesReview as jest.Mock).mockResolvedValue(
      selfSubjectRulesReviewWithNoOrgs
    );
    const history = createInitialHistory(MainRoutes.Login);

    const testAuth = new TestOAuth2(history);
    const attemptLoginMockFn = jest.spyOn(testAuth, 'attemptLogin');

    renderRouteWithStore(
      MainRoutes.Login,
      undefined,
      undefined,
      testAuth,
      history
    );

    fireEvent.click(screen.getByRole('button', { name: 'Proceed to login' }));

    expect(
      await screen.findByText(
        `You don't have permission to access any resources via the Giant Swarm web interface or Management API.`
      )
    ).toBeInTheDocument();
    attemptLoginMockFn.mockRestore();
  });

  it('renews the token if it expired and automatic renewal failed', async () => {
    (createSelfSubjectAccessReview as jest.Mock).mockResolvedValue(
      selfSubjectAccessReviewCantListOrgs
    );
    (getOrganization as jest.Mock).mockResolvedValue(getOrganizationByName);

    (createSelfSubjectRulesReview as jest.Mock).mockResolvedValue(
      selfSubjectRulesReviewWithSomeOrgs
    );
    getMockCall('/v4/clusters/');
    getMockCall('/v4/releases/', releasesResponse);

    const history = createInitialHistory(MainRoutes.Login);

    const testAuth = new TestOAuth2(history);
    const getLoggedInUserMockFn = jest.spyOn(testAuth, 'getLoggedInUser');

    renderRouteWithStore(
      MainRoutes.Login,
      undefined,
      undefined,
      testAuth,
      history
    );

    fireEvent.click(screen.getByRole('button', { name: 'Proceed to login' }));

    const someButton = await screen.findByText('Launch new cluster');
    expect(someButton).toBeInTheDocument();

    testAuth.expireUser();
    expect(isJwtExpired(testAuth.loggedInUser!.idToken)).toBeTruthy();

    fireEvent.click(someButton);
    await waitFor(() => expect(getLoggedInUserMockFn).toHaveBeenCalled());

    expect(isJwtExpired(testAuth.loggedInUser!.idToken)).toBeFalsy();

    getLoggedInUserMockFn.mockRestore();
  });

  it('logs out the user if the manual renewal failed', async () => {
    (createSelfSubjectAccessReview as jest.Mock).mockResolvedValue(
      selfSubjectAccessReviewCantListOrgs
    );
    (getOrganization as jest.Mock).mockResolvedValue(getOrganizationByName);

    (createSelfSubjectRulesReview as jest.Mock).mockResolvedValue(
      selfSubjectRulesReviewWithSomeOrgs
    );

    getMockCall('/v4/clusters/');
    getMockCall('/v4/releases/', releasesResponse);

    const history = createInitialHistory(MainRoutes.Login);

    const testAuth = new TestOAuth2(history);
    const getLoggedInUserMockFn = jest.spyOn(testAuth, 'getLoggedInUser');
    getLoggedInUserMockFn.mockImplementation(() => {
      return Promise.reject(new Error('Cannot renew user'));
    });

    renderRouteWithStore(
      MainRoutes.Login,
      undefined,
      undefined,
      testAuth,
      history
    );

    fireEvent.click(screen.getByRole('button', { name: 'Proceed to login' }));

    const someButton = await screen.findByText('Launch new cluster');
    expect(someButton).toBeInTheDocument();

    testAuth.expireUser();
    expect(isJwtExpired(testAuth.loggedInUser!.idToken)).toBeTruthy();

    fireEvent.click(someButton);
    await waitFor(() => expect(getLoggedInUserMockFn).toHaveBeenCalled());

    expect(testAuth.loggedInUser).toBeNull();

    expect(
      await screen.findByText('Welcome to Giant Swarm')
    ).toBeInTheDocument();

    getLoggedInUserMockFn.mockRestore();
  });

  it('hides OAuth2 support if the feature is not enabled', () => {
    const initialMapiAuth = featureFlags.flags.CustomerSSO.enabled;
    featureFlags.flags.CustomerSSO.enabled = false;

    renderRouteWithStore(MainRoutes.Login, {}, {});

    expect(
      screen.queryByRole('button', { name: 'Proceed to login' })
    ).not.toBeInTheDocument();

    featureFlags.flags.CustomerSSO.enabled = initialMapiAuth;
  });
});
