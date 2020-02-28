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
  await wait(() => expect(nock.isDone()).toBeTruthy());
  nock.cleanAll();
  forceRemoveAll();
});
