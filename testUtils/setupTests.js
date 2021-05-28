import '@testing-library/jest-dom/extend-expect';

import { configure, waitFor } from '@testing-library/react';
import GiantSwarm from 'giantswarm';
import { forceRemoveAll } from 'lib/flashMessage';
import nock from 'nock';
import * as featureFlags from 'shared/featureFlags';

let isOnline = false;
// Let the browser know it's online, since we're disabling internet connectivity
Object.defineProperty(window.navigator, 'onLine', {
  get() {
    return isOnline;
  },
  set(value) {
    isOnline = value;
  },
});

window.scrollTo = jest.fn();

configure({
  asyncUtilTimeout: 4500,
});

beforeAll(() => {
  featureFlags.init();

  nock.disableNetConnect();
  // initialize a GiantSwarm api client
  // this is usually done trough file src/components/Layout.js
  const defaultClient = GiantSwarm.ApiClient.instance;
  defaultClient.basePath = window.config.apiEndpoint;
  defaultClient.timeout = 10000;
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(async () => {
  await waitFor(() => {
    const done = nock.isDone();

    // Uncomment the next lines to debug hanging requests
    const pendingMocks = nock.pendingMocks().map((mock) => `${mock}\n`);
    if (!done) {
      throw new Error(`You still have pending mocks bro:\n ${pendingMocks}`);
    }

    expect(done).toBeTruthy();
  });
  nock.cleanAll();
  forceRemoveAll();
  jest.clearAllTimers();
});
