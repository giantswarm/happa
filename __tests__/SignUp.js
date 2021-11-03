import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { MainRoutes } from 'shared/constants/routes';
import {
  authTokenResponse,
  getMockCall,
  metadataResponse,
  postMockCall,
  USER_EMAIL,
  userResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

const testToken = 'm0ckt0ken';
const tokenTestPath = `/invite/${testToken}`;

const verifyingRoute = RoutePath.createUsablePath(MainRoutes.SignUp, {
  token: testToken,
});

describe('Signup', () => {
  beforeEach(() => {
    getConfiguration.mockResolvedValueOnce(metadataResponse);
  });

  it('renders without crashing', async () => {
    const { findByText } = renderRouteWithStore(verifyingRoute);

    await findByText(/create your giant swarm account/i);
  });

  it('checks invite token on route load', async () => {
    nock(global.config.passageEndpoint)
      .get(tokenTestPath)
      .reply(StatusCodes.Ok, {
        email: USER_EMAIL,
        invite_date: String(Date.now()),
        is_valid: true,
      });

    const { findByText } = renderRouteWithStore(verifyingRoute);

    const statusMessage = await findByText(/verifying invite.../i);

    await waitFor(() => {
      expect(statusMessage.textContent.match(/valid/i)).toBeTruthy();
    });
  });

  it('displays a warning if the invite token is no longer valid', async () => {
    nock(global.config.passageEndpoint)
      .get(tokenTestPath)
      .reply(StatusCodes.Ok, {
        is_valid: false,
      });

    const { findByText, getByText } = renderRouteWithStore(verifyingRoute);

    const statusMessage = await findByText(/verifying invite.../i);

    await waitFor(() => {
      expect(statusMessage.textContent.match(/failed/i)).toBeTruthy();
      expect(
        getByText(
          /this invite token is not valid. perhaps you already used it?/i
        )
      ).toBeInTheDocument();
    });
  });

  it('registers a new user if the token is valid', async () => {
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/organizations/');
    getMockCall('/v4/clusters/');
    getMockCall('/v4/appcatalogs/');

    nock(global.config.passageEndpoint)
      .get(tokenTestPath)
      .reply(StatusCodes.Ok, {
        email: USER_EMAIL,
        invite_date: String(Date.now()),
        is_valid: true,
      });

    const { findByText, getByLabelText, findByLabelText } =
      renderRouteWithStore(verifyingRoute);

    await findByText(
      new RegExp(
        `this is your personal Giant Swarm account for the email address ${USER_EMAIL}`,
        'i'
      )
    );

    const nextButton = await findByText(/^Next$/i);
    let fieldToValidate = getByLabelText(/set a password/i);

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
    nock(global.config.passageEndpoint)
      .post('/accounts/', {
        invite_token: testToken,
        password: 'g00dPa$$w0rD',
      })
      .reply(StatusCodes.Ok, {
        email: USER_EMAIL,
        message: 'User account created',
        token: 'testtoken001230',
      });

    postMockCall('/v4/auth-tokens/', authTokenResponse);

    fireEvent.click(nextButton);

    await findByText(/creating account.../i);
    await findByText(/account created. welcome to Giant Swarm!/i);

    // Check if the user has been redirected to the homepage
    await findByText(/there are no organizations yet in your installation./i);
  });

  it('displays a warning if the user creation request fails', async () => {
    nock(global.config.passageEndpoint)
      .get(tokenTestPath)
      .reply(StatusCodes.Ok, {
        email: USER_EMAIL,
        invite_date: String(Date.now()),
        is_valid: true,
      });

    const { findByText, getByLabelText, findByLabelText } =
      renderRouteWithStore(verifyingRoute);

    const nextButton = await findByText(/^Next$/i);
    let fieldToUse = getByLabelText(/set a password/i);

    // Input validation

    // Check if the password is all good
    fireEvent.change(fieldToUse, {
      target: { value: 'g00dPa$$w0rD' },
    });

    fireEvent.click(nextButton);

    const formStatus = await findByText(/password looks good/i);

    // Wait for the form status change content
    // eslint-disable-next-line no-empty-function
    await waitFor(() => {}, {
      container: formStatus,
    });

    // Validate confirm password field
    fieldToUse = getByLabelText(/password, once again/i);

    fireEvent.change(fieldToUse, {
      target: { value: 'g00dPa$$w0rD' },
    });

    await findByText(/perfect match, nice!/i);

    fireEvent.click(nextButton);

    // Accept terms of service
    fieldToUse = await findByLabelText(/i accept the terms of service/i);
    fireEvent.click(fieldToUse);

    // Send account creation request
    nock(global.config.passageEndpoint)
      .post('/accounts/', {
        invite_token: testToken,
        password: 'g00dPa$$w0rD',
      })
      .reply(StatusCodes.InternalServerError, {});

    fireEvent.click(nextButton);

    const statusMessage = await findByText(/creating account.../i);
    await waitFor(() => {
      expect(statusMessage.textContent.match(/failed/i)).toBeTruthy();
    });
  });
});
