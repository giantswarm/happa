import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import auth0 from 'auth0-js';
import { ConnectedRouter, push } from 'connected-react-router';
import { ThemeProvider } from 'emotion-theming';
import { createMemoryHistory } from 'history';
import * as helpers from 'lib/helpers';
import React from 'react';
import { Provider } from 'react-redux';
import Routes from 'Routes';
import { AuthorizationTypes } from 'shared';
import { AppRoutes } from 'shared/constants/routes';
import configureStore from 'stores/configureStore';
import theme from 'styles/theme';
import {
  AWSInfoResponse,
  getMockCall,
  getMockCallTimes,
  USER_EMAIL,
  userResponse,
} from 'testUtils/mockHttpCalls';
import { initialStorage } from 'testUtils/renderUtils';

// eslint-disable-next-line no-console
const originalConsoleError = console.error;

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

// Mock auth0 module
jest.genMockFromModule('auth0-js');
jest.mock('auth0-js');

const mockAuth0Authorize = jest.fn();
const mockAuth0ParseHash = jest.fn();
const mockAuth0CheckSession = jest.fn();
auth0.WebAuth = jest.fn(() => ({
  authorize: mockAuth0Authorize,
  parseHash: mockAuth0ParseHash,
  checkSession: mockAuth0CheckSession,
}));

// Mock helpers
jest.mock('lib/helpers');

// eslint-disable-next-line no-import-assign
helpers.isJwtExpired = jest.fn();
// eslint-disable-next-line no-import-assign
helpers.validateOrRaise = jest.fn();

const renderRouteWithStore = (
  initialRoute = AppRoutes.Home,
  state = {},
  storage = initialStorage,
  history = createMemoryHistory()
) => {
  localStorage.replaceWith(storage);

  store = configureStore(state, history);

  const app = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </ThemeProvider>
    </Provider>
  );

  store.dispatch(push(initialRoute));

  return app;
};

describe('AdminLogin', () => {
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
  });

  afterAll(() => {
    // eslint-disable-next-line no-console
    console.error = originalConsoleError;
  });

  it('renders without crashing', async () => {
    const { findByText } = renderRouteWithStore(AppRoutes.AdminLogin, {}, {});

    await findByText(
      /verifying credentials, and redirecting to our authentication provider if necessary./i
    );
  });

  it('redirects to the OAuth provider and handles login, if there is no user stored', async () => {
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/info/', AWSInfoResponse);
    getMockCall('/v4/organizations/');
    getMockCall('/v4/clusters/');
    getMockCall('/v4/appcatalogs/');

    mockAuth0Authorize.mockImplementation(() => {
      store.dispatch(push(`${AppRoutes.OAuthCallback}#response_type=id_token`));
    });

    mockAuth0ParseHash.mockImplementation(callback => {
      callback(null, mockSuccessfulAuthResponse);
    });

    const { findByText } = renderRouteWithStore(AppRoutes.AdminLogin, {}, {});

    // Check if the user has been redirected to the homepage
    await findByText(/there are no organizations yet in your installation./i);

    // Check if the correct user has been saved to local storage
    expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockUserData));
  });

  it('redirects to homepage if the user has been previously logged in', async () => {
    getMockCall('/v4/user/', userResponse);
    getMockCallTimes('/v4/info/', AWSInfoResponse, 2);
    getMockCallTimes('/v4/appcatalogs/', [], 2);
    getMockCall('/v4/organizations/');
    getMockCallTimes('/v4/clusters/', [], 2);

    helpers.isJwtExpired.mockReturnValue(false);

    const { findByText } = renderRouteWithStore(AppRoutes.AdminLogin, {
      app: { loggedInUser: mockUserData },
    });

    // Check if the user has been redirected to the homepage
    await findByText(/there are no organizations yet in your installation./i);
  });

  it('renews user token if the previously stored one is expired', async () => {
    getMockCall('/v4/user/', userResponse);
    getMockCallTimes('/v4/info/', AWSInfoResponse, 2);
    getMockCallTimes('/v4/appcatalogs/', [], 2);
    getMockCall('/v4/organizations/');
    getMockCallTimes('/v4/clusters/', [], 2);

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

    helpers.isJwtExpired.mockReturnValue(true);
    mockAuth0CheckSession.mockImplementation((_config, callback) =>
      callback(null, mockAuthResponseWithNewToken)
    );

    const { findByText } = renderRouteWithStore(AppRoutes.AdminLogin, {
      app: { loggedInUser: mockUserData },
    });

    // Check if the user has been redirected to the homepage
    await findByText(/there are no organizations yet in your installation./i);

    // Check if the user with the new taken have been saved to storage
    expect(localStorage.getItem('user')).toEqual(
      JSON.stringify(mockUserDataWithNewToken)
    );
  });

  it('displays an error message if the OAuth provider callback URL is not valid', async () => {
    mockAuth0Authorize.mockImplementation(() => {
      store.dispatch(push(`${AppRoutes.OAuthCallback}#response_type=invalid`));
    });

    mockAuth0ParseHash.mockImplementation(callback => {
      callback(null, mockSuccessfulAuthResponse);
    });

    const { findByText } = renderRouteWithStore(AppRoutes.AdminLogin, {}, {});

    await findByText(
      /invalid or empty response from the authentication provider./i
    );
  });

  it('displays an error message if the OAuth provider can not login', async () => {
    mockAuth0Authorize.mockImplementation(() => {
      store.dispatch(push(`${AppRoutes.OAuthCallback}#response_type=id_token`));
    });

    mockAuth0ParseHash.mockImplementation(callback => {
      callback(new Error('u w0t m8?'), mockSuccessfulAuthResponse);
    });

    const { findByText } = renderRouteWithStore(AppRoutes.AdminLogin, {}, {});

    await findByText(/^Something went wrong$/i);
  });

  it('redirects to OAuth provider login page if renewing the token fails', async () => {
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/info/', AWSInfoResponse);
    getMockCall('/v4/appcatalogs/', []);
    getMockCall('/v4/organizations/');
    getMockCall('/v4/clusters/', []);

    const mockAuthResponseWithNewToken = Object.assign(
      {},
      mockSuccessfulAuthResponse,
      { accessToken: 'some-other-token' }
    );

    helpers.isJwtExpired.mockReturnValue(true);
    mockAuth0CheckSession.mockImplementation((_config, callback) =>
      callback(new Error('u w0t m8?'), mockAuthResponseWithNewToken)
    );

    const { findByText } = renderRouteWithStore(AppRoutes.AdminLogin, {
      app: { loggedInUser: mockUserData },
    });

    await findByText(
      /verifying credentials, and redirecting to our authentication provider if necessary./i
    );
  });
});
