'use strict';

import { routerMiddleware } from 'connected-react-router';
import configureMockStore from './mock-redux';
import history from '../src/stores/history';
import rootReducer from '../src/reducers';
import thunk from 'redux-thunk';

const middlewares = [routerMiddleware(history), thunk];
const mockStore = configureMockStore(rootReducer(history), middlewares);

export default function configureStore(initialState) {
  return mockStore(initialState);
}
