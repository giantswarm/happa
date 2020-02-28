import { wait } from '@testing-library/react';
import { forceRemoveAll } from 'lib/flashMessage';
import nock from 'nock';

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(async () => {
  await wait(() => {
    const done = nock.isDone();
    const pendingMocks = nock.pendingMocks().map(mock => `${mock}\n`);
    if (!done) {
      throw new Error(`You still have pending mocks bro:\n ${pendingMocks}`);
    }

    expect(done).toBeTruthy();
  });
  nock.cleanAll();
  forceRemoveAll();
});
