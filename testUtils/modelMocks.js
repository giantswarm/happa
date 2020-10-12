import { AuthorizationTypes } from 'shared/constants';

jest.mock('model/services/giantSwarm/info');
jest.mock('model/services/metadata/configuration');
jest.mock('stores/main/selectors', () => mockMainSelectors());

function mockMainSelectors() {
  const original = jest.requireActual('stores/main/selectors');

  return {
    ...original,
    selectAuthToken: jest.fn(() => (state) => {
      return [state.main.loggedInUser.auth.token, AuthorizationTypes.GS];
    }),
  };
}
