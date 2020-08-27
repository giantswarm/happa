import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor } from '@testing-library/react';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  authTokenResponse,
  AWSInfoResponse,
  getMockCall,
  metadataResponse,
  postMockCall,
  userResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

beforeEach(() => {
  getConfiguration.mockResolvedValueOnce(metadataResponse);
});

it('renders the login page at /login', async () => {
  const { getByText } = renderRouteWithStore(AppRoutes.Login, {}, {});

  await waitFor(() => {
    expect(getByText('Log in to Giant Swarm')).toBeInTheDocument();
  });
});

it('redirects to / and shows the layout after a succesful login', async () => {
  // Given I have a Giant Swarm API with no clusters, organizations, appcatalogs
  // that I can log in to.

  // Using persisted version of nock interceptors because weird enough in CircleCI
  // some calls are performed more than once

  // The response to the login call
  postMockCall('/v4/auth-tokens/', authTokenResponse);
  // The response to the user info call
  getMockCall('/v4/user/', userResponse);
  // The response to the info call
  getInstallationInfo.mockResolvedValueOnce(AWSInfoResponse);
  // The response to the org call (no orgs)
  getMockCall('/v4/organizations/');
  // The response to the clusters call (no clusters)
  getMockCall('/v4/clusters/');
  // The response to the appcatalogs call (no catalogs)
  getMockCall('/v4/appcatalogs/');

  // AND I arrive at the login page with nothing in the state.
  const { getByText, getByLabelText } = renderRouteWithStore(
    AppRoutes.Login,
    {},
    {}
  );

  // When I type in my email and password
  const emailInput = getByLabelText('Email');
  const passwordInput = getByLabelText('Password');

  fireEvent.change(emailInput, {
    target: { value: 'developer@giantswarm.io' },
  });
  fireEvent.change(passwordInput, { target: { value: 'password' } });

  // And click submit
  const button = getByText('Log in');
  fireEvent.click(button);

  // Then I should be logged in and see the home page with no orgs or clusters.
  await waitFor(() => {
    // Verify we are now on the layout page and I can see my username
    expect(getByText(/developer@giantswarm.io/i)).toBeInTheDocument();
    expect(getByText(/Welcome to Giant Swarm!/i)).toBeInTheDocument();
    expect(
      getByText(/There are no organizations yet in your installation./i)
    ).toBeInTheDocument();
  });
});

it('tells the user to give a password if they leave it blank', async () => {
  // Given I arrive at the login page with nothing in the state.
  const { getByText, getByLabelText } = renderRouteWithStore(
    AppRoutes.Login,
    {},
    {}
  );

  // When I type in my email but not my password.
  const emailInput = getByLabelText('Email');
  fireEvent.change(emailInput, {
    target: { value: 'developer@giantswarm.io' },
  });

  // And click submit
  const button = getByText('Log in');
  fireEvent.click(button);

  // Then I should see a message reminding me not to leave my password blank.
  await waitFor(() => {
    expect(getByText(/Please enter your password./i)).toBeInTheDocument();
  });
});

it('tells the user to give a email if they leave it blank', async () => {
  // Given I arrive at the login page with nothing in the state.
  const { getByText, getByLabelText } = renderRouteWithStore(
    AppRoutes.Login,
    {},
    {}
  );

  // When I type in my password but not my email.
  const passwordInput = getByLabelText('Password');
  fireEvent.change(passwordInput, { target: { value: 'password' } });

  // And click submit
  const button = getByText('Log in');
  fireEvent.click(button);

  // Then I should see a message reminding me not to leave my password blank.
  await waitFor(() => {
    expect(getByText(/Please provide the email/i)).toBeInTheDocument();
  });
});

it('shows an error if the user logs in with invalid credentials', async () => {
  // Given I have a Giant Swarm API that does not accept my login attempt

  // The failed 401 response to the login call
  nock(API_ENDPOINT).post('/v4/auth-tokens/').reply(StatusCodes.Unauthorized);

  // And I arrive at the login page with nothing in the state.
  const { getByText, getByLabelText } = renderRouteWithStore(
    AppRoutes.Login,
    {},
    {}
  );

  // When I type in my email and password
  const emailInput = getByLabelText('Email');
  const passwordInput = getByLabelText('Password');

  fireEvent.change(emailInput, {
    target: { value: 'developer@giantswarm.io' },
  });
  fireEvent.change(passwordInput, { target: { value: 'password' } });

  // And click submit
  const button = getByText('Log in');
  fireEvent.click(button);

  // Then I should see a message reminding me not to leave my password blank.
  await waitFor(() => {
    expect(getByText(/Could not log in/i)).toBeInTheDocument();
  });
});
