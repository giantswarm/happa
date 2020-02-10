import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import nock from 'nock';
import { StatusCodes } from 'shared';
import { AppRoutes } from 'shared/constants/routes';
import {
  AWSInfoResponse,
  getMockCall,
  USER_EMAIL,
  userResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

// eslint-disable-next-line no-console
const originalConsoleError = console.error;

const testToken = 'm0ckt0ken';
const tokenTestPath = `/invite/${testToken}`;

const verifyingRoute = RoutePath.createUsablePath(AppRoutes.SignUp, {
  token: testToken,
});

/**
 * Bump the jest test duration to 10 secs, since this is
 * a pretty long test suite
 */
// eslint-disable-next-line no-magic-numbers
jest.setTimeout(10 * 1000);

beforeAll(() => {
  nock.disableNetConnect();
  // eslint-disable-next-line no-console
  console.error = jest.fn();
});

afterAll(() => {
  nock.enableNetConnect();
  // eslint-disable-next-line no-console
  console.error = originalConsoleError;
});

describe('Signup', () => {
  it('renders without crashing', async () => {
    const { findByText } = renderRouteWithStore(verifyingRoute);

    await findByText(/create your giant swarm account/i);
  });

  it('checks invite token on route load', async () => {
    const verifyingRequest = nock(global.config.passageEndpoint)
      .get(tokenTestPath)
      .reply(StatusCodes.Ok, {
        email: USER_EMAIL,
        invite_date: String(Date.now()),
        is_valid: true,
      });

    const { findByText } = renderRouteWithStore(verifyingRoute);

    const statusMessage = await findByText(/verifying invite.../i);

    await wait(() => {
      expect(statusMessage.textContent.match(/valid/i)).toBeTruthy();
    });

    verifyingRequest.done();
  });

  it('displays a warning if the invite token is no longer valid', async () => {
    const verifyingRequest = nock(global.config.passageEndpoint)
      .get(tokenTestPath)
      .reply(StatusCodes.Ok, {
        is_valid: false,
      });

    const { findByText, getByText } = renderRouteWithStore(verifyingRoute);

    const statusMessage = await findByText(/verifying invite.../i);

    await wait(() => {
      expect(statusMessage.textContent.match(/failed/i)).toBeTruthy();
      expect(
        getByText(
          /this invite token is not valid. perhaps you already used it?/i
        )
      ).toBeInTheDocument();
    });

    verifyingRequest.done();
  });

  it('registers a new user if the token is valid', async () => {
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/info/', AWSInfoResponse);
    getMockCall('/v4/organizations/');
    getMockCall('/v4/clusters/');
    getMockCall('/v4/appcatalogs/');

    const verifyingRequest = nock(global.config.passageEndpoint)
      .get(tokenTestPath)
      .reply(StatusCodes.Ok, {
        email: USER_EMAIL,
        invite_date: String(Date.now()),
        is_valid: true,
      });

    const {
      findByText,
      getByLabelText,
      findByLabelText,
      findByTitle,
    } = renderRouteWithStore(verifyingRoute);

    await findByText(
      new RegExp(
        `this is your personal Giant Swarm account for the email address ${USER_EMAIL}`,
        'i'
      )
    );

    const nextButton = await findByTitle(/next/i);
    let fieldToValidate = getByLabelText(/set a password/i);

    verifyingRequest.done();

    // Input validation

    // Check if password is too short
    fireEvent.change(fieldToValidate, {
      target: { value: 'short' },
    });

    await findByText(/please use at least 8 characters/i);
    expect(nextButton.disabled).toBeTruthy();

    // Check if password is only made up of letters
    fireEvent.change(fieldToValidate, {
      target: { value: 'justletters' },
    });

    await findByText(/please add some more diverse characters./i);
    expect(nextButton.disabled).toBeTruthy();

    // Check if password is only made up of numbers
    fireEvent.change(fieldToValidate, {
      target: { value: '01234567' },
    });

    await findByText(/please add something else than only numbers/i);
    expect(nextButton.disabled).toBeTruthy();

    // Check if the password is all good
    fireEvent.change(fieldToValidate, {
      target: { value: 'g00dPa$$w0rD' },
    });

    await findByText(/password looks good/i);
    expect(nextButton.disabled).toBeFalsy();

    fireEvent.click(nextButton);

    // Validate confirm password field
    fieldToValidate = getByLabelText(/password, once again/i);

    /**
     * Check if password confirmation is not
     * the same as the regular password field
     */
    fireEvent.change(fieldToValidate, {
      target: { value: 'pass' },
    });

    await findByText(/password confirmation does not match./i);
    expect(nextButton.disabled).toBeTruthy();

    /**
     * Check if password confirmation is the same
     * as the password
     */
    fireEvent.change(fieldToValidate, {
      target: { value: 'g00dPa$$w0rD' },
    });

    await findByText(/perfect match, nice!/i);
    expect(nextButton.disabled).toBeFalsy();

    fireEvent.click(nextButton);

    // Check if terms of service are rendered
    await findByText(/confirm that you acknowledge our Terms of Service:/i);

    fieldToValidate = await findByLabelText(/i accept the terms of service/i);

    fireEvent.click(fieldToValidate);
    expect(fieldToValidate.checked).toBeTruthy();

    /**
     * Check if declining the terms of service
     * shows a passive-agressive warning
     */
    fireEvent.click(fieldToValidate);
    expect(fieldToValidate.checked).toBeFalsy();

    await findByText(/waiting for you to check that mark... again/i);
    expect(nextButton.disabled).toBeTruthy();

    // Check it again
    fireEvent.click(fieldToValidate);
    expect(fieldToValidate.checked).toBeTruthy();

    await findByText(/ready to create your account!/i);
    expect(nextButton).toHaveTextContent(/create your account now/i);
    expect(nextButton.disabled).toBeFalsy();

    // Send account creation request
    const createAccountRequest = nock(global.config.passageEndpoint)
      .post('/accounts/', {
        invite_token: testToken,
        password: 'g00dPa$$w0rD',
      })
      .reply(StatusCodes.Ok, {
        email: USER_EMAIL,
        message: 'User account created',
        token: 'testtoken001230',
      });

    fireEvent.click(nextButton);

    await findByText(/creating account.../i);
    await findByText(/account created. welcome to Giant Swarm!/i);

    // Check if the user has been redirected to the homepage
    await findByText(/there are no organizations yet in your installation./i);

    createAccountRequest.done();
  });

  it('displays a warning if the user creation request fails', async () => {
    const verifyingRequest = nock(global.config.passageEndpoint)
      .get(tokenTestPath)
      .reply(StatusCodes.Ok, {
        email: USER_EMAIL,
        invite_date: String(Date.now()),
        is_valid: true,
      });

    const {
      findByText,
      getByLabelText,
      findByLabelText,
      findByTitle,
    } = renderRouteWithStore(verifyingRoute);

    const nextButton = await findByTitle(/next/i);
    let fieldToUse = getByLabelText(/set a password/i);

    verifyingRequest.done();

    // Input validation

    // Check if the password is all good
    fireEvent.change(fieldToUse, {
      target: { value: 'g00dPa$$w0rD' },
    });

    fireEvent.click(nextButton);

    // Validate confirm password field
    fieldToUse = getByLabelText(/password, once again/i);

    fireEvent.change(fieldToUse, {
      target: { value: 'g00dPa$$w0rD' },
    });

    await findByText(/perfect match, nice!/i);

    fireEvent.click(nextButton);

    // Check if terms of service are rendered
    await findByText(/confirm that you acknowledge our Terms of Service:/i);

    fieldToUse = await findByLabelText(/i accept the terms of service/i);

    fireEvent.click(fieldToUse);
    expect(fieldToUse.checked).toBeTruthy();

    // Send account creation request
    const createAccountRequest = nock(global.config.passageEndpoint)
      .post('/accounts/', {
        invite_token: testToken,
        password: 'g00dPa$$w0rD',
      })
      .reply(StatusCodes.InternalServerError, {});

    fireEvent.click(nextButton);

    const statusMessage = await findByText(/creating account.../i);
    await wait(() => {
      expect(statusMessage.textContent.match(/failed/i)).toBeTruthy();
    });

    createAccountRequest.done();
  });
});
