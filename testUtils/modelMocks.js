import * as authSelectors from 'selectors/authSelectors';

jest.mock('model/services/giantSwarm');
jest.mock('selectors/authSelectors');

// eslint-disable-next-line no-import-assign
authSelectors.selectAuthToken = jest.fn(
  (_, state) => state.app.loggedInUser.token
);
