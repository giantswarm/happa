import 'jest-dom/extend-expect';
import { fireEvent, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import nock from 'nock'

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
    const authTokensRequest = nock('http://localhost:8000')
    .post('/v4/auth-tokens/')
    .reply(200, {"auth_token":"efeb3f94-8deb-41a0-84cc-713801ff165e"});

    // The response to the user info call
    const userInfoRequest = nock('http://localhost:8000')
    .get('/v4/user/')
    .reply(200, {"email":"developer@giantswarm.io","created":"2019-09-19T12:40:16.2231629Z","expiry":"2020-01-01T00:00:00Z"});

    // The response to the info call
    const infoRequest = nock('http://localhost:8000')
    .get('/v4/info/')
    .reply(200, {"general":{"availability_zones":{"default":1,"max":3},"installation_name":"local","provider":"aws"},"stats":{"cluster_creation_duration":{"median":805,"p25":657,"p75":1031}},"workers":{"count_per_cluster":{"max":null,"default":3},"instance_type":{"options":["m5.large","m3.large","m3.xlarge","m3.2xlarge","r3.large","r3.xlarge","r3.2xlarge","r3.4xlarge","r3.8xlarge"],"default":"m3.large"}}});

    // The response to the org call (no orgs)
    const orgRequest = nock('http://localhost:8000')
    .get('/v4/organizations/')
    .reply(200, []);

    // The response to the clusters call (no clusters)
    const clustersRequest = nock('http://localhost:8000')
    .get('/v4/clusters/')
    .reply(200, []);

    // The response to the appcatalogs call (no catalogs)
    const appcatalogsRequest = nock('http://localhost:8000')
    .get('/v4/appcatalogs/')
    .reply(200, []);

  // AND I arrive at the login page with nothing in the state.
    const state = {};
    const div = document.createElement('div');
    const { getByText, getByLabelText } = renderRouteWithStore('/login', div, state);


  // WHEN I type in my email and password
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'developer@giantswarm.io' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })

  // AND click submit
    const button = getByText('Log in');
    fireEvent.click(button);

  // THEN I should be logged in and see the home page with no orgs or clusters.
    await wait(() => {
      // Verify we are now on the layout page and I can see my username
      expect(getByText(/developer@giantswarm.io/i)).toBeInTheDocument();
      expect(getByText(/Welcome to Giant Swarm!/i)).toBeInTheDocument();
      expect(getByText(/There are no organizations yet in your installation./i)).toBeInTheDocument();
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
