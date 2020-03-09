import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitForDomChange } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getInstallationInfo } from 'model/services/giantSwarm';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import {
  authTokenResponse,
  AWSInfoResponse,
  generateRandomString,
  getMockCall,
  mockAPIResponse,
  postMockCall,
  USER_EMAIL,
  userResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

describe('PasswordReset', () => {
  // Letting the server know that you forgot your
  describe('ForgotPassword', () => {
    it('takes us to the forgot password form when clicking on "Forgot your password?" from the login form', async () => {
      // Given I am not logged in and visit the app.
      const { findByText, getByText } = renderRouteWithStore(
        AppRoutes.Home,
        {},
        {}
      );

      // Wait till the app is ready and we're on the login page.
      const pageTitle = await findByText(/Log in to Giant Swarm/i);
      expect(pageTitle).toBeInTheDocument();

      // When I click "Forgot your password?".
      const forgotPasswordLink = getByText('Forgot your password?');
      fireEvent.click(forgotPasswordLink);

      // Then I should get redirected to the Forgot Password Form.
      const forgotPasswordPageTitle = await findByText(
        /Enter the email you used to sign-up/i
      );
      expect(forgotPasswordPageTitle).toBeInTheDocument();
    });

    it('gives me a confirmation message after entering something into the email field and clicking submit ', async () => {
      // Given Passage responds favourably to a password reset call.
      nock(global.config.passageEndpoint)
        .post('/recovery/', { email: 'iforgotmypassword@giantswarm.io' })
        .reply(StatusCodes.Ok, {
          email: 'iforgotmypassword@giantswarm.io',
          message: 'Token created',
          valid_until: '2019-09-21T18:14:11.347485+00:00',
        });

      // And I am not logged in and visit the app.
      const { getByText, findByText, getByLabelText } = renderRouteWithStore(
        AppRoutes.ForgotPassword,
        {},
        {}
      );

      // Wait till the app is ready and we're on the forgot password page.
      const pageTitle = await findByText(
        /Enter the email you used to sign-up/i
      );
      expect(pageTitle).toBeInTheDocument();

      // When I type in my email.
      const emailInput = getByLabelText('Email');
      fireEvent.change(emailInput, {
        target: { value: 'iforgotmypassword@giantswarm.io' },
      });

      // And click submit
      const button = getByText('Submit');
      fireEvent.click(button);

      // Then I should see a confirmation message.
      const confirmationMessage = await findByText(/Check your mail!/i);
      expect(confirmationMessage).toBeInTheDocument();
    });
  });

  // Setting a new password
  describe('SetPassword', () => {
    // eslint-disable-next-line no-magic-numbers
    const token = generateRandomString(22);
    const routeWithToken = RoutePath.createUsablePath(AppRoutes.SetPassword, {
      token,
    });

    it('renders the set password route without crashing', async () => {
      const { findByText, getByText } = renderRouteWithStore(
        routeWithToken,
        {},
        {}
      );

      const pageTitle = await findByText(/set your new password/i);
      expect(pageTitle).toBeInTheDocument();

      const pageSubtitle = getByText(
        /before we can check your recovery token, please type in your email again for verification purposes./i
      );
      expect(pageSubtitle).toBeInTheDocument();

      const pageLinkToCreateNewToken = getByText(/request a new token/i);
      expect(pageLinkToCreateNewToken).toBeInTheDocument();
    });

    it('displays an error if the token is invalid', async () => {
      nock(global.config.passageEndpoint)
        .post(`/recovery/${token}/`, { email: USER_EMAIL })
        .reply(StatusCodes.Ok, {
          email: USER_EMAIL,
          is_valid: false,
          token,
        });

      const { findByText, findByLabelText } = renderRouteWithStore(
        routeWithToken,
        {},
        {}
      );

      const emailInput = await findByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: USER_EMAIL } });

      const submitButton = await findByText(/submit/i);
      fireEvent.click(submitButton);

      const errorMessage = await findByText(
        /the reset token appears to be invalid./i
      );
      expect(errorMessage).toBeInTheDocument();
    });

    it('sets a new password for the email in the form', async () => {
      const finalPassword = 'g00dPa$$w0rD';

      getInstallationInfo.mockResolvedValueOnce(
        mockAPIResponse(AWSInfoResponse)
      );
      postMockCall('/v4/auth-tokens/', authTokenResponse);
      getMockCall('/v4/user/', userResponse);
      getMockCall('/v4/organizations/');
      getMockCall('/v4/clusters/');
      getMockCall('/v4/appcatalogs/');

      nock(global.config.passageEndpoint)
        .post(`/recovery/${token}/`, { email: USER_EMAIL })
        .reply(StatusCodes.Ok, {
          email: USER_EMAIL,
          is_valid: true,
          token,
          valid_until: '2020-02-21T16:50:20.589772+00:00',
        });
      nock(global.config.passageEndpoint)
        .post(`/recovery/${token}/password/`, {
          email: USER_EMAIL,
          password: finalPassword,
        })
        .reply(StatusCodes.Ok, {
          email: USER_EMAIL,
          message: 'Password updated',
          // eslint-disable-next-line no-magic-numbers
          token: generateRandomString(10),
          username: 'adrian@giantswarm.io',
        });

      const { findByText, getByText, findByLabelText } = renderRouteWithStore(
        routeWithToken,
        {},
        {}
      );

      const emailInput = await findByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: USER_EMAIL } });

      let submitButton = await findByText(/submit/i);
      fireEvent.click(submitButton);

      let validationProgressMessage = await findByText(
        /validating your token/i
      );
      expect(validationProgressMessage).toBeInTheDocument();

      const passwordInput = await findByLabelText(/new password/i);
      const confirmPasswordInput = await findByLabelText(
        /password, once again/i
      );
      submitButton = getByText(/submit/i);

      // Input validation

      // Check if password is too short
      fireEvent.change(passwordInput, {
        target: { value: 'short' },
      });

      let validationTextEl = await findByText(
        /please use at least 8 characters/i
      );
      expect(validationTextEl).toBeInTheDocument();
      expect(submitButton.disabled).toBeTruthy();

      // Check if password is only made up of letters
      fireEvent.change(passwordInput, {
        target: { value: 'justletters' },
      });

      validationTextEl = await findByText(
        /please add some more diverse characters./i
      );
      expect(validationTextEl).toBeInTheDocument();
      expect(submitButton.disabled).toBeTruthy();

      // Check if password is only made up of numbers
      fireEvent.change(passwordInput, {
        target: { value: '01234567' },
      });

      validationTextEl = await findByText(
        /please add something else than only numbers/i
      );
      expect(validationTextEl).toBeInTheDocument();
      expect(submitButton.disabled).toBeTruthy();

      // Check if the password is all good
      fireEvent.change(passwordInput, {
        target: { value: finalPassword },
      });

      validationTextEl = await findByText(/password looks good/i);
      expect(validationTextEl).toBeInTheDocument();
      expect(submitButton.disabled).toBeTruthy();

      /**
       * Check if password confirmation is not
       * the same as the regular password field
       */
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'pass' },
      });

      await findByText(/password confirmation does not match./i);
      expect(submitButton.disabled).toBeTruthy();

      /**
       * Check if password confirmation is the same
       * as the password
       */
      fireEvent.change(confirmPasswordInput, {
        target: { value: finalPassword },
      });

      await findByText(/perfect match, nice!/i);
      expect(submitButton.disabled).toBeFalsy();

      fireEvent.click(submitButton);

      validationProgressMessage = await findByText(/submitting.../i);
      expect(validationProgressMessage).toBeInTheDocument();

      // Check if the user has been redirected to the homepage
      await findByText(/there are no organizations yet in your installation./i);
    });

    it(`jumps to password setup automatically if there's an email saved in the local storage`, async () => {
      getInstallationInfo.mockResolvedValueOnce(
        mockAPIResponse(AWSInfoResponse)
      );
      getMockCall('/v4/user/', userResponse);
      getMockCall('/v4/organizations/');
      getMockCall('/v4/appcatalogs/');
      getMockCall('/v4/clusters/');

      nock(global.config.passageEndpoint)
        .post(`/recovery/${token}/`, { email: USER_EMAIL })
        .reply(StatusCodes.Ok, {
          email: USER_EMAIL,
          is_valid: true,
          token,
          valid_until: '2020-02-21T16:50:20.589772+00:00',
        });

      const { findByLabelText, findByText } = renderRouteWithStore(
        routeWithToken
      );

      const validationProgressMessage = await findByText(
        /validating your token/i
      );
      expect(validationProgressMessage).toBeInTheDocument();

      const passwordInput = await findByLabelText(/new password/i);
      expect(passwordInput).toBeInTheDocument();

      await waitForDomChange();
    });
  });
});
