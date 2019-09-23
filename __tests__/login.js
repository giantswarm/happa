import 'jest-dom/extend-expect';
import {
  authTokenResponse,
  getMockCall,
  infoResponse,
  postMockCall,
  userResponse,
} from 'test_utils/mockHttpCalls';
import { fireEvent, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';

it('renders the login page at /login', async () => {
  const state = {};
  const div = document.createElement('div');
  const { getByText } = renderRouteWithStore('/login', div, state);

  await wait(() => {
    expect(getByText('Log in to Giant Swarm')).toBeInTheDocument();
  });
});

it('redirects to / and shows the layout after a succesful login', async () => {
  // GIVEN I have a Giant Swarm API with no clusters, organizations, appcatalogs
  // that I can log in to.

  // The response to the login call
  const authTokensRequest = postMockCall('/v4/auth-tokens/', authTokenResponse);
  // The response to the user info call
  const userInfoRequest = getMockCall('/v4/user/', userResponse);
  // The response to the info call
  const infoRequest = getMockCall('/v4/info/', infoResponse);
  // The response to the org call (no orgs)
  const orgRequest = getMockCall('/v4/organizations/');
  // The response to the clusters call (no clusters)
  const clustersRequest = getMockCall('/v4/clusters/');
  // The response to the appcatalogs call (no catalogs)
  const appcatalogsRequest = getMockCall('/v4/appcatalogs/');

  // AND I arrive at the login page with nothing in the state.
  const state = {};
  const div = document.createElement('div');
  const { getByText, getByLabelText } = renderRouteWithStore(
    '/login',
    div,
    state
  );

  // WHEN I type in my email and password
  const emailInput = getByLabelText('Email');
  const passwordInput = getByLabelText('Password');

  fireEvent.change(emailInput, {
    target: { value: 'developer@giantswarm.io' },
  });
  fireEvent.change(passwordInput, { target: { value: 'password' } });

  // AND click submit
  const button = getByText('Log in');
  fireEvent.click(button);

  // THEN I should be logged in and see the home page with no orgs or clusters.
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
  authTokensRequest.done();
  userInfoRequest.done();
  infoRequest.done();
  orgRequest.done();
  clustersRequest.done();
  appcatalogsRequest.done();
});

it.skip('tells the user to give a password if they leave it blank', async () => {
  // To be implemented
});

it.skip('tells the user to give a email if they leave it blank', async () => {
  // To be implemented
});

it.skip('shows an error if the user logs in with invalid credentials', async () => {
  // To be implemented
});
