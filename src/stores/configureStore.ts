import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import MapiAuth from 'lib/MapiAuth/MapiAuth';
import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  Store,
} from 'redux';
import thunk from 'redux-thunk';
import FeatureFlags from 'shared/FeatureFlags';
import { mapiAuthMiddleware } from 'stores/main/middlware';
import rootReducer from 'stores/rootReducer';
import { IState } from 'stores/state';

import { callAPIMiddleware } from './callAPIMiddleware';

let store = {} as Store<IState>;

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(
  initialState: IState,
  history: History<History.LocationState>,
  mapiAuth?: MapiAuth
) {
  const middleware: Middleware[] = [
    routerMiddleware(history),
    thunk,
    callAPIMiddleware,
  ];

  if (FeatureFlags.FEATURE_MAPI_ACCESS && mapiAuth) {
    middleware.push(mapiAuthMiddleware(mapiAuth));
  }

  store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(...middleware))
  );

  return store;
}
