import { screen } from '@testing-library/react';
import { MapiAuthConnectors } from 'lib/MapiAuth/MapiAuth';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { getConfiguration } from 'model/services/metadata/configuration';
import { MainRoutes } from 'shared/constants/routes';
import {
  AWSInfoResponse,
  getMockCall,
  metadataResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
} from 'testUtils/mockHttpCalls';
import {
  createInitialHistory,
  renderRouteWithStore,
} from 'testUtils/renderUtils';

describe('AdminLogin', () => {
  it('performs the admin login flow via OAuth2', async () => {
    (getInstallationInfo as jest.Mock).mockResolvedValueOnce(AWSInfoResponse);
    (getConfiguration as jest.Mock).mockResolvedValueOnce(metadataResponse);
    getMockCall('/v4/organizations/', orgsResponse);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse as any);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/clusters/');
    getMockCall('/v4/appcatalogs/');
    getMockCall('/v4/releases/', releasesResponse);

    const history = createInitialHistory(MainRoutes.AdminLogin);

    const testAuth = new TestOAuth2(history);
    const attemptLoginMockFn = jest.spyOn(testAuth, 'attemptLogin');

    renderRouteWithStore(
      MainRoutes.AdminLogin,
      undefined,
      undefined,
      testAuth,
      history
    );

    expect(attemptLoginMockFn).toHaveBeenCalledWith(
      MapiAuthConnectors.GiantSwarm
    );

    expect(await screen.findByText('Launch New Cluster')).toBeInTheDocument();
    attemptLoginMockFn.mockRestore();
  });

  it('displays an error message if the OAuth2 flow fails', async () => {
    const history = createInitialHistory(MainRoutes.AdminLogin);

    const testAuth = new TestOAuth2(history);
    const handleLoginResponseMockFn = jest.spyOn(
      testAuth,
      'handleLoginResponse'
    );
    handleLoginResponseMockFn.mockImplementation(() => {
      return Promise.reject(new Error('Authentication failed.'));
    });

    renderRouteWithStore(
      MainRoutes.AdminLogin,
      undefined,
      undefined,
      testAuth,
      history
    );

    expect(
      await screen.findByText(
        'Please log in again, as your previously saved credentials appear to be invalid.'
      )
    ).toBeInTheDocument();
    handleLoginResponseMockFn.mockRestore();
  });
});
