import { fireEvent, waitFor } from '@testing-library/react';
import { StatusCodes } from 'model/constants';
import { MainRoutes } from 'model/constants/routes';
import * as featureFlags from 'model/featureFlags';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import * as mockHttpCalls from 'test/mockHttpCalls';
import { renderRouteWithStore } from 'test/renderUtils';
import RoutePath from 'utils/routePath';

describe('PasswordReset', () => {
  beforeEach(() => {
    getConfiguration.mockResolvedValueOnce(mockHttpCalls.metadataResponse);
  });

  // Letting the server know that you forgot your
  describe('ForgotPassword', () => {
    it('takes us to the forgot password form when clicking on "Forgot your password?" from the login form', async () => {
      const initialMapiAuth = featureFlags.flags.CustomerSSO.enabled;
      featureFlags.flags.CustomerSSO.enabled = false;

      // Given I am not logged in and visit the app.
      const { findByText, getByText } = renderRouteWithStore(
        MainRoutes.Home,
        {},
        {}
      );

      // Wait till the app is ready and we're on the login page.
      const pageTitle = await findByText(/Welcome to Giant Swarm/i);
      expect(pageTitle).toBeInTheDocument();

      // When I click "Forgot your password?".
      const forgotPasswordLink = getByText('Forgot your password?');
      fireEvent.click(forgotPasswordLink);

      // Then I should get redirected to the Forgot Password Form.
      const forgotPasswordPageTitle = await findByText(
        /Enter the email you used to sign-up/i
      );
      expect(forgotPasswordPageTitle).toBeInTheDocument();

      featureFlags.flags.CustomerSSO.enabled = initialMapiAuth;
    });

    // Password recovery functionality has been removed with passage client
  });
});
