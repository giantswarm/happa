import '@testing-library/jest-dom/extend-expect';
import {
  authTokenResponse,
  getPersistedMockCall,
  AWSInfoResponse,
  postMockCall,
  userResponse,
} from 'testUtils/mockHttpCalls';
import { fireEvent, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'testUtils/renderUtils';
import nock from 'nock';

it('renders the login page at /login', async () => {
  const { getByText } = renderRouteWithStore('/login');

  await wait(() => {
    expect(getByText('Log in to Giant Swarm')).toBeInTheDocument();
  });
});

it('redirects to / and shows the layout after a succesful login', async () => {
  // Given I have a Giant Swarm API with no clusters, organizations, appcatalogs
  // that I can log in to.

  // Using persisted version of nock interceptors because weird enough in CircleCI
  // some calls are performed more than once

  // The response to the login call
  const authTokensRequest = postMockCall('/v4/auth-tokens/', authTokenResponse);
  // The response to the user info call
  const userInfoRequest = getPersistedMockCall('/v4/user/', userResponse);
  // The response to the info call
  const infoRequest = getPersistedMockCall('/v4/info/', AWSInfoResponse);
  // The response to the org call (no orgs)
  const orgRequest = getPersistedMockCall('/v4/organizations/');
  // The response to the clusters call (no clusters)
  const clustersRequest = getPersistedMockCall('/v4/clusters/');
  // The response to the appcatalogs call (no catalogs)
  const appcatalogsRequest = getPersistedMockCall('/v4/appcatalogs/');

  // AND I arrive at the login page with nothing in the state.
  const { getByText, getByLabelText } = renderRouteWithStore('/login', {}, {});

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
  await wait(() => {
    // Verify we are now on the layout page and I can see my username
    expect(getByText(/developer@giantswarm.io/i)).toBeInTheDocument();
    expect(getByText(/Welcome to Giant Swarm!/i)).toBeInTheDocument();
    expect(
      getByText(/There are no organizations yet in your installation./i)
    ).toBeInTheDocument();
  });

  // Assert that the mocked responses got called, tell them to stop waiting for
  // a request.
  authTokensRequest.persist(false);
  userInfoRequest.persist(false);
  infoRequest.persist(false);
  orgRequest.persist(false);
  clustersRequest.persist(false);
  appcatalogsRequest.persist(false);
});

it('tells the user to give a password if they leave it blank', async () => {
  // Given I arrive at the login page with nothing in the state.
  const { getByText, getByLabelText } = renderRouteWithStore('/login', {}, {});

  // When I type in my email but not my password.
  const emailInput = getByLabelText('Email');
  fireEvent.change(emailInput, {
    target: { value: 'developer@giantswarm.io' },
  });

  // And click submit
  const button = getByText('Log in');
  fireEvent.click(button);

  // Then I should see a message reminding me not to leave my password blank.
  await wait(() => {
    expect(getByText(/Please enter your password./i)).toBeInTheDocument();
  });
});

it('tells the user to give a email if they leave it blank', async () => {
  // Given I arrive at the login page with nothing in the state.
  const { getByText, getByLabelText } = renderRouteWithStore('/login', {}, {});

  // When I type in my password but not my email.
  const passwordInput = getByLabelText('Password');
  fireEvent.change(passwordInput, { target: { value: 'password' } });

  // And click submit
  const button = getByText('Log in');
  fireEvent.click(button);

  // Then I should see a message reminding me not to leave my password blank.
  await wait(() => {
    expect(getByText(/Please provide the email/i)).toBeInTheDocument();
  });
});

it('shows an error if the user logs in with invalid credentials', async () => {
  // Don't want to pollute the terminal with this error
  const originalConsoleError = console.error;
  console.error = jest.fn();

  // Given I have a Giant Swarm API that does not accept my login attempt

  // The failed 401 response to the login call
  const authTokensRequest = nock('http://localhost:8000')
    .post('/v4/auth-tokens/')
    .reply(401);

  // And I arrive at the login page with nothing in the state.
  const { getByText, getByLabelText } = renderRouteWithStore('/login', {}, {});

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
  await wait(() => {
    expect(getByText(/Could not log in/i)).toBeInTheDocument();
  });

  // Restore console.og
  console.error = originalConsoleError;
});
