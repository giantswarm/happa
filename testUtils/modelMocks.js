import * as authSelectors from 'selectors/authSelectors';
import { AuthorizationTypes } from 'shared';

jest.mock('model/services/giantSwarm');
jest.mock('selectors/authSelectors');

// eslint-disable-next-line no-import-assign
authSelectors.selectAuthToken = jest.fn((_, state) => [
  state.app.loggedInUser.token,
  AuthorizationTypes.GS,
]);
