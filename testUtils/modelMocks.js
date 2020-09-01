import * as authSelectors from 'selectors/authSelectors';
import { AuthorizationTypes } from 'shared/constants';

jest.mock('model/services/giantSwarm/info');
jest.mock('model/services/metadata/configuration');
jest.mock('selectors/authSelectors');

// eslint-disable-next-line no-import-assign
authSelectors.selectAuthToken = jest.fn((_, state) => {
  return [state.main.loggedInUser.auth.token, AuthorizationTypes.GS];
});
