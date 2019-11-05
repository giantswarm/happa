import '@testing-library/jest-dom/extend-expect';
import { fireEvent, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import initialState from 'test_utils/initialState';
import nock from 'nock';

it('logging out redirects to the login page', async () => {
  // Given I have a Giant Swarm API with no clusters, organizations, appcatalogs
  // that I am already logged in on.

  // The response to the user info call
  const userInfoRequest = nock('http://localhost:8000')
    .get('/v4/user/')
    .reply(200, {
      email: 'developer@giantswarm.io',
      created: '2019-09-19T12:40:16.2231629Z',
      expiry: '2020-01-01T00:00:00Z',
    });

  // The response to the info call
  const infoRequest = nock('http://localhost:8000')
    .get('/v4/info/')
    .reply(200, {
      general: {
        availability_zones: { default: 1, max: 3 },
        installation_name: 'local',
        provider: 'aws',
      },
      stats: {
        cluster_creation_duration: { median: 805, p25: 657, p75: 1031 },
      },
      workers: {
        count_per_cluster: { max: null, default: 3 },
        instance_type: {
          options: [
            'm5.large',
            'm3.large',
            'm3.xlarge',
            'm3.2xlarge',
            'r3.large',
            'r3.xlarge',
            'r3.2xlarge',
            'r3.4xlarge',
            'r3.8xlarge',
          ],
          default: 'm3.large',
        },
      },
    });

  // The response to the org call (no orgs)
  const orgRequest = nock('http://localhost:8000')
    .get('/v4/organizations/')
    .reply(200, []);

  // The response to the clusters call (no clusters)
  const clustersRequest = nock('http://localhost:8000')
    .persist()
    .get('/v4/clusters/')
    .reply(200, []);

  const appcatalogsRequest = nock('http://localhost:8000')
    .persist()
    .get('/v4/appcatalogs/')
    .reply(200, []);

  // Given I am logged in and on the home page.
  const div = document.createElement('div');
  const { getByText, debug, getByLabelText } = renderRouteWithStore(
    '/',
    div,
    initialState()
  );

  // Wait till the app is ready and we're on the home page.
  await wait(() => {
    expect(getByText(/Welcome to Giant Swarm!/i)).toBeInTheDocument();
  });

  // When I click logout in the user dropdown.
  const userDropdown = getByText('developer@giantswarm.io');
  fireEvent.click(userDropdown);

  const logoutButton = getByText('Logout');
  fireEvent.click(logoutButton);

  // Then I should get redirected to the login page.
  await wait(() => {
    expect(getByText('Log in')).toBeInTheDocument();
  });

  // Assert that the mocked responses got called, tell them to stop waiting for
  // a request.
  userInfoRequest.done();
  infoRequest.done();
  orgRequest.done();
  clustersRequest.done();
  appcatalogsRequest.done();
});
