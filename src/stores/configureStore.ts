import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import CPAuth from 'lib/CPAuth';
import rootReducer from 'reducers';
import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
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
  store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history),
        thunk,
        cpAuthMiddleware(cpAuth),
        callAPIMiddleware
      )
    )
  );

  return store;
}
