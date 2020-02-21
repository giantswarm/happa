import '@testing-library/jest-dom/extend-expect';

import { fireEvent } from '@testing-library/react';
import { forceRemoveAll } from 'lib/flashMessage';
import RoutePath from 'lib/routePath';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import { generateRandomString, USER_EMAIL } from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

describe('PasswordReset', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  afterEach(() => {
    if (!nock.isDone()) {
      // eslint-disable-next-line no-console
      console.error('Nock has pending mocks:', nock.pendingMocks());
    }

    expect(nock.isDone()).toBeTruthy();
    nock.cleanAll();

    forceRemoveAll();
  });

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

    it('sets a new password for the email in the form', async () => {
      nock(global.config.passageEndpoint)
        .post('/recovery/', { email: USER_EMAIL })
        .reply(StatusCodes.Ok, {
          email: USER_EMAIL,
          is_valid: true,
          token,
          valid_until: '2020-02-21T16:50:20.589772+00:00',
        });

      const { findByText, getByText, findByLabelText } = renderRouteWithStore(
        routeWithToken,
        {},
        {}
      );

      const emailInput = await findByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: USER_EMAIL } });

      const submitButton = await findByText(/submit/i);
      fireEvent.click(submitButton);

      const validationProgressMessage = await findByText(
        /validating your token/i
      );
      expect(validationProgressMessage).toBeInTheDocument();

      const passwordInput = await findByLabelText(/password/i);
      const confirmPasswordInput = await findByLabelText(/confirm-password/i);

      const desiredPassword = 'abc';
      fireEvent.change(passwordInput, { target: { value: desiredPassword } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: desiredPassword },
      });

      const validationTextEl = getByText(/please use at least 8 characters/i);
      expect(validationTextEl).toBeInTheDocument();
    });
  });
});
