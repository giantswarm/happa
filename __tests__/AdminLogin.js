import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import App from 'App';
import { push } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import Auth from 'lib/auth0';
import * as helpers from 'lib/helpers';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { getConfiguration } from 'model/services/metadata/configuration';
import React from 'react';
import { AuthorizationTypes } from 'shared/constants';
import { MainRoutes } from 'shared/constants/routes';
import configureStore from 'stores/configureStore';
import theme from 'styles/theme';
import {
  AWSInfoResponse,
  getMockCall,
  metadataResponse,
  USER_EMAIL,
  userResponse,
} from 'testUtils/mockHttpCalls';
import preloginState from 'testUtils/preloginState';
import { initialStorage } from 'testUtils/renderUtils';

const mockUserData = {
  email: USER_EMAIL,
  auth: {
    scheme: AuthorizationTypes.BEARER,
    token: 'some-token',
  },
  isAdmin: true,
};
const mockSuccessfulAuthResponse = {
  accessToken: 'some-token',
  idTokenPayload: {
    email: USER_EMAIL,
    'https://giantswarm.io/groups': 'api-admin',
  },
};

let store = null;

// Mock helpers
jest.mock('lib/helpers');

// eslint-disable-next-line no-import-assign
helpers.isJwtExpired = jest.fn();
// eslint-disable-next-line no-import-assign
helpers.validateOrRaise = jest.fn();

const renderRouteWithStore = (
  initialRoute = MainRoutes.Home,
  state = {},
  storage = initialStorage
) => {
  localStorage.replaceWith(storage);

  const history = createMemoryHistory({
    initialEntries: [initialRoute],
    initialIndex: 0,
  });

  store = configureStore(state, history);

  const app = render(<App {...{ store, theme, history }} />);

  return app;
};

describe('AdminLogin', () => {
  beforeEach(() => {
    getConfiguration.mockResolvedValue(metadataResponse);
  });

  it('renders without crashing', async () => {
    delete window.location;
    window.location = {
      assign: () => {
        // noop
      },
    };

    const { findByText } = renderRouteWithStore(MainRoutes.AdminLogin, {}, {});

    await findByText(
      /verifying credentials, and redirecting to our authentication provider if necessary./i
    );
  });

  it('redirects to the OAuth provider and handles login, if there is no user stored', async () => {
    delete window.location;
    window.location = {
      assign: () => {
        store.dispatch(
          push(`${MainRoutes.OAuthCallback}#response_type=id_token`)
        );
      },
    };

    Auth.getInstance().handleAuthentication = (callback) => {
      callback(null, mockSuccessfulAuthResponse);
    };

    getInstallationInfo.mockResolvedValueOnce(AWSInfoResponse);
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/organizations/');
    getMockCall('/v4/clusters/');
    getMockCall('/v4/appcatalogs/');

    const { findByText } = renderRouteWithStore(MainRoutes.AdminLogin, {}, {});

    // Check if the user has been redirected to the homepage
    await findByText(/there are no organizations yet in your installation./i);

    // Check if the correct user has been saved to local storage
    expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockUserData));
  });

  it('redirects to homepage if the user has been previously logged in', async () => {
    getMockCall('/v4/user/', userResponse);
    getInstallationInfo.mockResolvedValueOnce(AWSInfoResponse);
    getMockCall('/v4/appcatalogs/', []);
    getMockCall('/v4/organizations/');
    getMockCall('/v4/clusters/', []);

    helpers.isJwtExpired.mockReturnValue(false);

    const { findByText } = renderRouteWithStore(MainRoutes.AdminLogin, {
      ...preloginState,
      main: { loggedInUser: mockUserData },
    });

    // Check if the user has been redirected to the homepage
    await findByText(/there are no organizations yet in your installation./i);
  });

  it('renews user token if the previously stored one is expired', async () => {
    getMockCall('/v4/user/', userResponse);
    getInstallationInfo.mockResolvedValueOnce(AWSInfoResponse);
    getMockCall('/v4/appcatalogs/', []);
    getMockCall('/v4/organizations/');
    getMockCall('/v4/clusters/', []);

    const mockUserDataWithNewToken = Object.assign({}, mockUserData, {
      auth: {
        scheme: AuthorizationTypes.BEARER,
        token: 'some-other-token',
      },
    });

    const mockAuthResponseWithNewToken = Object.assign(
      {},
      mockSuccessfulAuthResponse,
      { accessToken: 'some-other-token' }
    );

    Auth.getInstance().renewToken = () => {
      return new Promise((resolve) => {
        resolve(mockAuthResponseWithNewToken);
      });
    };

    helpers.isJwtExpired.mockReturnValue(true);
    // mockAuth0CheckSession.mockImplementation((_config, callback) =>
    //   callback(null, mockAuthResponseWithNewToken)
    // );

    const { findByText } = renderRouteWithStore(MainRoutes.AdminLogin, {
      ...preloginState,
      main: { loggedInUser: mockUserData },
    });

    // Check if the user has been redirected to the homepage
    await findByText(/there are no organizations yet in your installation./i);

    // Check if the user with the new taken have been saved to storage
    expect(localStorage.getItem('user')).toEqual(
      JSON.stringify(mockUserDataWithNewToken)
    );
  });

  it('displays an error message if the OAuth provider callback URL is not valid', async () => {
    delete window.location;
    window.location = {
      assign: () => {
        store.dispatch(
          push(`${MainRoutes.OAuthCallback}#response_type=invalid`)
        );
      },
    };

    Auth.getInstance().handleAuthentication = (callback) => {
      callback('some error', {});
    };

    const { findByText } = renderRouteWithStore(MainRoutes.AdminLogin, {}, {});

    await findByText(/Something went wrong/i);
  });

  it('displays an error message if the OAuth provider can not login', async () => {
    delete window.location;
    window.location = {
      assign: () => {
        store.dispatch(
          push(`${MainRoutes.OAuthCallback}#response_type=id_token`)
        );
      },
    };

    Auth.getInstance().handleAuthentication = (callback) => {
      callback('some error', {});
    };

    const { findByText } = renderRouteWithStore(MainRoutes.AdminLogin, {}, {});

    await findByText(/^Something went wrong$/i);
  });

  it('redirects to OAuth provider login page if renewing the token fails', async () => {
    delete window.location;
    window.location = {
      assign: () => {
        // noop
      },
    };

    helpers.isJwtExpired.mockReturnValue(true);

    Auth.getInstance().renewToken = () => {
      return new Promise((_, reject) => {
        reject(new Error('Something failed'));
      });
    };

    const { findByText } = renderRouteWithStore(MainRoutes.AdminLogin, {
      ...preloginState,
      main: { loggedInUser: mockUserData },
    });

    await findByText(
      /verifying credentials, and redirecting to our authentication provider if necessary./i
    );
  });
});
