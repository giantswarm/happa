import { AuthorizationTypes } from 'shared/constants';
import * as userSelectors from 'stores/user/selectors';

jest.mock('model/services/giantSwarm/info');
jest.mock('model/services/metadata/configuration');
jest.mock('stores/user/selectors');

// eslint-disable-next-line no-import-assign
userSelectors.selectAuthToken = jest.fn(() => (state) => {
  return [state.main.loggedInUser.auth.token, AuthorizationTypes.GS];
});
