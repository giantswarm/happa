import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import CPAuth from 'lib/CPAuth/CPAuth';
import rootReducer from 'reducers';
import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  Store,
} from 'redux';
import thunk from 'redux-thunk';
import FeatureFlags from 'shared/FeatureFlags';
import { cpAuthMiddleware } from 'stores/cpauth/middleware';

import { callAPIMiddleware } from './callAPIMiddleware';

let store: Store = {} as Store;

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialState: Record<string, any>,
  history: History<History.LocationState>,
  cpAuth: CPAuth
) {
  let middleware: Middleware[] = [
    routerMiddleware(history),
    thunk,
    callAPIMiddleware,
  ];

  if (FeatureFlags.FEATURE_CP_ACCESS) {
    middleware = [cpAuthMiddleware(cpAuth), ...middleware];
  }

  store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(...middleware))
  );

  return store;
}
