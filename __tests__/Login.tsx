import { fireEvent, screen, waitFor } from '@testing-library/react';
import { isJwtExpired } from 'lib/helpers';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { MainRoutes } from 'shared/constants/routes';
import { FeatureFlags } from 'shared/FeatureFlags';
import {
  API_ENDPOINT,
  authTokenResponse,
  AWSInfoResponse,
  getMockCall,
  metadataResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  postMockCall,
  releasesResponse,
  userResponse,
} from 'testUtils/mockHttpCalls';
import {
  createInitialHistory,
  renderRouteWithStore,
} from 'testUtils/renderUtils';

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
    (getInstallationInfo as jest.Mock).mockResolvedValueOnce(AWSInfoResponse);
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

    fireEvent.click(screen.getByText('Login using email and password'));

    // When I type in my email and password
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');

    fireEvent.change(emailInput, {
      target: { value: 'developer@giantswarm.io' },
    });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    // And click submit
    const button = getByText('Login');
    fireEvent.click(button);

    // Then I should be logged in and see the home page with no orgs or clusters.
    await waitFor(() => {
      // Verify we are now on the layout page and I can see my username
      expect(getByText(/developer@giantswarm.io/i)).toBeInTheDocument();
      expect(getByText(/Welcome to Giant Swarm!/i)).toBeInTheDocument();
      expect(
        getByText(/There are no organizations yet in your installation./i)
      ).toBeInTheDocument();
    });
  });

  it('tells the user to give a password if they leave it blank', async () => {
    // Given I arrive at the login page with nothing in the state.
    const { getByText, getByLabelText } = renderRouteWithStore(
      MainRoutes.Login,
      {},
      {}
    );

    fireEvent.click(screen.getByText('Login using email and password'));

    // When I type in my email but not my password.
    const emailInput = getByLabelText('Email');
    fireEvent.change(emailInput, {
      target: { value: 'developer@giantswarm.io' },
    });

    // And click submit
    const button = getByText('Login');
    fireEvent.click(button);

    // Then I should see a message reminding me not to leave my password blank.
    await waitFor(() => {
      expect(getByText(/Please enter your password./i)).toBeInTheDocument();
    });
  });

  it('tells the user to give a email if they leave it blank', async () => {
    // Given I arrive at the login page with nothing in the state.
    const { getByText, getByLabelText } = renderRouteWithStore(
      MainRoutes.Login,
      {},
      {}
    );

    fireEvent.click(screen.getByText('Login using email and password'));

    // When I type in my password but not my email.
    const passwordInput = getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    // And click submit
    const button = getByText('Login');
    fireEvent.click(button);

    // Then I should see a message reminding me not to leave my password blank.
    await waitFor(() => {
      expect(getByText(/Please provide the email/i)).toBeInTheDocument();
    });
  });

  it('shows an error if the user logs in with invalid credentials', async () => {
    // Given I have a Giant Swarm API that does not accept my login attempt

    // The failed 401 response to the login call
    nock(API_ENDPOINT).post('/v4/auth-tokens/').reply(StatusCodes.Unauthorized);

    // And I arrive at the login page with nothing in the state.
    const { getByText, getByLabelText } = renderRouteWithStore(
      MainRoutes.Login,
      {},
      {}
    );

    fireEvent.click(screen.getByText('Login using email and password'));

    // When I type in my email and password
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');

    fireEvent.change(emailInput, {
      target: { value: 'developer@giantswarm.io' },
    });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    // And click submit
    const button = getByText('Login');
    fireEvent.click(button);

    // Then I should see a message reminding me not to leave my password blank.
    await waitFor(() => {
      expect(getByText(/Could not login/i)).toBeInTheDocument();
    });
  });

  it('performs the OAuth2 login flow', async () => {
    (getInstallationInfo as jest.Mock).mockResolvedValueOnce(AWSInfoResponse);
    getMockCall('/v4/organizations/', orgsResponse);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse as any);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/clusters/');
    getMockCall('/v4/appcatalogs/');
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

    expect(await screen.findByText('Launch New Cluster')).toBeInTheDocument();
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
    (getInstallationInfo as jest.Mock).mockResolvedValueOnce(AWSInfoResponse);
    getMockCall('/v4/organizations/', orgsResponse);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse as any);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/clusters/');
    getMockCall('/v4/appcatalogs/');
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

    const someButton = await screen.findByText('Launch New Cluster');
    expect(someButton).toBeInTheDocument();

    testAuth.expireUser();
    expect(isJwtExpired(testAuth.loggedInUser!.idToken)).toBeTruthy();

    fireEvent.click(someButton);
    await waitFor(() => expect(getLoggedInUserMockFn).toHaveBeenCalled());

    expect(isJwtExpired(testAuth.loggedInUser!.idToken)).toBeFalsy();

    getLoggedInUserMockFn.mockRestore();
  });

  it('logs out the user if the manual renewal failed', async () => {
    (getInstallationInfo as jest.Mock).mockResolvedValueOnce(AWSInfoResponse);
    getMockCall('/v4/organizations/', orgsResponse);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse as any);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/clusters/');
    getMockCall('/v4/appcatalogs/');
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

    const someButton = await screen.findByText('Launch New Cluster');
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
    const initialMapiAuth = FeatureFlags.FEATURE_MAPI_AUTH;
    FeatureFlags.FEATURE_MAPI_AUTH = false;

    renderRouteWithStore(MainRoutes.Login, {}, {});

    expect(
      screen.queryByText('Login using email and password')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Proceed to login' })
    ).not.toBeInTheDocument();

    FeatureFlags.FEATURE_MAPI_AUTH = initialMapiAuth;
  });
});
