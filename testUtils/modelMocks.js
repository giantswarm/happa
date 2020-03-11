import * as authSelectors from 'selectors/authSelectors';
import { AuthorizationTypes } from 'shared';

jest.mock('model/services/giantSwarm');
jest.mock('selectors/authSelectors');

// eslint-disable-next-line no-import-assign
authSelectors.selectAuthToken = jest.fn((_, state) => {
  return [state.main.loggedInUser.auth.token, AuthorizationTypes.GS];
});
