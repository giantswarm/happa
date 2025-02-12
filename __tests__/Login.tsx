import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MainRoutes } from 'model/constants/routes';
import { createSelfSubjectAccessReview } from 'model/services/mapi/authorizationv1/createSelfSubjectAccessReview';
import { createSelfSubjectRulesReview } from 'model/services/mapi/authorizationv1/createSelfSubjectRulesReview';
import { getOrganization } from 'model/services/mapi/securityv1alpha1/';
import { getConfiguration } from 'model/services/metadata/configuration';
import {
  getMockCall,
  getOrganizationByName,
  metadataResponse,
  releasesResponse,
  selfSubjectAccessReviewCantListOrgs,
  selfSubjectRulesReviewWithNoOrgs,
  selfSubjectRulesReviewWithSomeOrgs,
} from 'test/mockHttpCalls';
import { createInitialHistory, renderRouteWithStore } from 'test/renderUtils';
import { isJwtExpired } from 'utils/helpers';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

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
});
