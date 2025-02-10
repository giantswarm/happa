import '@testing-library/jest-dom/extend-expect';

import { act, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { UsersRoutes } from 'model/constants/routes';
import * as featureFlags from 'model/featureFlags';
import { getConfiguration } from 'model/services/metadata/configuration';
import * as mainSelectors from 'model/stores/main/selectors';
import { LoggedInUserTypes } from 'model/stores/main/types';
import * as permissionsUtils from 'MAPI/permissions/utils';
import nock from 'nock';
import {
  appCatalogsResponse,
  getMockCall,
  gsOrgResponse,
  metadataResponse,
  ORGANIZATION,
  orgResponse,
  orgsWithGSResponse,
  userResponse,
  usersResponse,
  V4_CLUSTER,
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v4ClustersResponse,
} from 'test/mockHttpCalls';

jest.mock('MAPI/permissions/utils', () => ({
  ...jest.requireActual('MAPI/permissions/utils'),
  fetchPermissions: jest.fn().mockResolvedValue({
    default: {
      '*:*:*': ['*']
    }
  }),
  hasAppAccess: jest.fn().mockReturnValue(true)
}));
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';
import { initialStorage, renderRouteWithStore } from 'test/renderUtils';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('Users', () => {
  const initialCustomerSSO = featureFlags.flags.CustomerSSO.enabled;

  beforeAll(() => {
    featureFlags.flags.CustomerSSO.enabled = false;
  });

  afterAll(() => {
    featureFlags.flags.CustomerSSO.enabled = initialCustomerSSO;
  });

  afterEach(() => {
    nock.cleanAll();
  });

  beforeEach(() => {
    getConfiguration.mockResolvedValueOnce(metadataResponse);
    featureFlags.flags.CustomerSSO.enabled = false;
    window.config = {
      ...window.config,
      mapiAuthAdminGroups: ['giantswarm-admin'],
      info: {
        general: {
          installationName: 'test-installation'
        }
      },
      api: {
        endpoint: 'http://1.2.3.4:80'
      },
      auth: {
        scheme: 'giantswarm'
      }
    };
  });

  it('renders without crashing', async () => {
    // Set up all mocks before rendering
    getMockCall('/v4/user/', {
      ...userResponse,
      type: LoggedInUserTypes.MAPI,
      isAdmin: true,
      groups: ['giantswarm-admin'],
      auth: {
        scheme: 'giantswarm',
        token: 'test-token',
        authenticated: true
      }
    });
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);
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

    // Mock users API response
    getMockCall('/v4/users/', { items: usersResponse });

    // Mock initial state
    const initialState = {
      main: {
        loggedInUser: {
          email: 'developer@giantswarm.io',
          expiry: '2024-12-31T23:59:59Z',
          created: '2023-01-01T00:00:00Z',
          type: LoggedInUserTypes.MAPI,
          isAdmin: true,
          groups: ['giantswarm-admin'],
          auth: {
            scheme: 'giantswarm',
            token: 'test-token',
            authenticated: true
          },
          permissions: {
            default: {
              '*:*:*': ['*']
            }
          }
        },
        selectedOrganization: ORGANIZATION,
        firstLoadComplete: true
      },
      entities: {
        users: {
          items: usersResponse,
          isFetching: false,
          lastUpdated: Date.now()
        },
        organizations: {
          items: {
            [ORGANIZATION]: orgResponse,
            giantswarm: gsOrgResponse
          }
        },
        catalogs: {
          items: appCatalogsResponse,
          ui: {
            selectedCatalogs: {}
          }
        }
      },
      router: {
        location: {
          pathname: UsersRoutes.Home,
          search: '',
          hash: '',
          state: undefined
        },
        action: 'PUSH'
      },
      loadingFlags: {
        'user/LOAD': false,
        'appcatalogs/LOAD': false
      },
      loadingFlagsByEntity: {
        'user/LOAD': {
          isLoading: false
        },
        'appcatalogs/LOAD': {
          isLoading: false
        }
      }
    };

    // Create history and auth
    const history = createMemoryHistory({
      initialEntries: [UsersRoutes.Home]
    });
    const auth = new TestOAuth2(history, true);

    // Mock hasAppAccess to return true
    jest.spyOn(require('MAPI/permissions/utils'), 'hasAppAccess').mockReturnValue(true);

    // Mock CustomerSSO flag to be disabled
    featureFlags.flags.CustomerSSO.enabled = false;

    const { findByText, findByRole, debug, queryByText } = renderRouteWithStore(
      UsersRoutes.Home,
      initialState,
      initialStorage,
      auth,
      history
    );

    // Wait for the component to mount and network requests to complete
    await waitFor(() => {
      const pendingMocks = nock.pendingMocks();
      if (pendingMocks.length > 0) {
        console.log('Pending mocks:', pendingMocks);
        return false;
      }
      return true;
    }, { timeout: 5000, interval: 100 });

    // Debug what's being rendered
    debug();

    // Wait for all API calls to complete
    await waitFor(() => {
      const pendingMocks = nock.pendingMocks();
      if (pendingMocks.length > 0) {
        console.log('Pending mocks:', pendingMocks);
        return false;
      }
      return true;
    }, { timeout: 5000 });

    // Debug what's being rendered
    debug();

    // Wait for the user accounts section to appear
    await waitFor(() => {
      const userAccountsSection = screen.queryByText('User accounts');
      const warningMessage = screen.queryByText(/In order to manage users, you must be a member/i);
      return userAccountsSection && !warningMessage;
    }, { timeout: 5000 });

    // Verify the page content
    const usersTitle = await screen.findByText(/This page lists the user accounts for/i);
    expect(usersTitle).toBeInTheDocument();
  });

  // Invitation functionality has been removed with passage client
});
