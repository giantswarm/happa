import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import { forceRemoveAll } from 'lib/flashMessage';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import { AWSInfoResponse, getMockCall } from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

describe('ForgotPassword', () => {
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

  it('takes us to the forgot password form when clicking on "Forgot your password?" from the login form', async () => {
    // Given I am not logged in and visit the app.
    const { getByText } = renderRouteWithStore(AppRoutes.Home, {}, {});

    // Wait till the app is ready and we're on the login page.
    await wait(() => {
      expect(getByText(/Log in to Giant Swarm/i)).toBeInTheDocument();
    });

    // When I click "Forgot your password?".
    const forgotPasswordLink = getByText('Forgot your password?');
    fireEvent.click(forgotPasswordLink);

    // Then I should get redirected to the Forgot Password Form.
    await wait(() => {
      expect(
        getByText(/Enter the email you used to sign-up/i)
      ).toBeInTheDocument();
    });
  });

  it('gives me a confirmation message after entering something into the email field and clicking submit ', async () => {
    getMockCall('/v4/info/', AWSInfoResponse);
    getMockCall('/v4/appcatalogs/');
    getMockCall('/v4/organizations/');
    getMockCall('/v4/clusters/');

    // Given Passage responds favourably to a password reset call.
    nock(global.config.passageEndpoint)
      .post('/recovery/', { email: 'iforgotmypassword@giantswarm.io' })
      .reply(StatusCodes.Ok, {
        email: 'iforgotmypassword@giantswarm.io',
        message: 'Token created',
        valid_until: '2019-09-21T18:14:11.347485+00:00',
      });

    // And I am not logged in and visit the app.
    const { getByText, getByLabelText } = renderRouteWithStore(
      AppRoutes.ForgotPassword
    );

    // Wait till the app is ready and we're on the forgot password page.
    await wait(() => {
      expect(
        getByText(/Enter the email you used to sign-up/i)
      ).toBeInTheDocument();
    });

    // When I type in my email.
    const emailInput = getByLabelText('Email');
    fireEvent.change(emailInput, {
      target: { value: 'iforgotmypassword@giantswarm.io' },
    });

    // And click submit
    const button = getByText('Submit');
    fireEvent.click(button);

    // Then I should see a confirmation message.
    await wait(() => {
      expect(getByText(/Check your mail!/i)).toBeInTheDocument();
    });
  });
});
