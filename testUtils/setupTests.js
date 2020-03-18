import { configure, waitFor } from '@testing-library/react';
import { forceRemoveAll } from 'lib/flashMessage';
import nock from 'nock';

// Force offline state since we're disabling net connect
Object.defineProperty(window.navigator, 'onLine', {
  get: function() {
    return false;
  },
});

configure({
  asyncUtilTimeout: 4500,
});

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(async () => {
  await waitFor(() => {
    const done = nock.isDone();

    // Uncomment the next lines to debug hanging requests
    // const pendingMocks = nock.pendingMocks().map(mock => `${mock}\n`);
    // if (!done) {
    //   throw new Error(`You still have pending mocks bro:\n ${pendingMocks}`);
    // }

    expect(done).toBeTruthy();
  });
  nock.cleanAll();
  forceRemoveAll();
});
