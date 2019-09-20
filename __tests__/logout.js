import '@testing-library/jest-dom/extend-expect';
import { fireEvent, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import initialState from 'test_utils/initialState';
import nock from 'nock';

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
};

let storage;
beforeEach(() => {
  storage = global.localStorage;
  global.localStorage = new LocalStorageMock();
});

afterEach(() => {
 global.localStorage = storage
});

it('logging out redirects to the login page', async () => {
  // Given I have a Giant Swarm API with no clusters, organizations, appcatalogs
  // that I am already logged in on.

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

  // Given I am logged in and on the home page.
  const state = initialState();
  const div = document.createElement('div');
  const { getByText, debug, getByLabelText } = renderRouteWithStore('/', div, state);

  debug();

  // When I click logout in the user dropdown.

});
