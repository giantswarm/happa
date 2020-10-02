import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import CPAuth from 'lib/CPAuth/CPAuth';
import { IState } from 'reducers/types';
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
import rootReducer from 'stores/rootReducer';

import { callAPIMiddleware } from './callAPIMiddleware';

let store = {} as Store<IState>;

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(
  initialState: IState,
  history: History<History.LocationState>,
  cpAuth?: CPAuth
) {
  const middleware: Middleware[] = [
    routerMiddleware(history),
    thunk,
    callAPIMiddleware,
  ];

  if (FeatureFlags.FEATURE_CP_ACCESS && cpAuth) {
    middleware.push(cpAuthMiddleware(cpAuth));
  }

  store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(...middleware))
  );

  return store;
}
