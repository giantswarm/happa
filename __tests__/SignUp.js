import '@testing-library/jest-dom/extend-expect';

import { fireEvent } from '@testing-library/react';
import { MainRoutes } from 'model/constants/routes';
import { getConfiguration } from 'model/services/metadata/configuration';
import {
  metadataResponse,
} from 'test/mockHttpCalls';
import { renderRouteWithStore } from 'test/renderUtils';
import RoutePath from 'utils/routePath';

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
    const { findByText } = renderRouteWithStore(verifyingRoute);
    await findByText(/create your giant swarm account/i);
  });

  it('validates password requirements', async () => {
    const { findByText, getByLabelText } = renderRouteWithStore(verifyingRoute);

    const nextButton = await findByText(/^Next$/i);
    const fieldToValidate = getByLabelText(/set a password/i);

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
  });
});
