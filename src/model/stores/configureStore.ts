import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { mainAuthMiddleware } from 'model/stores/main/middleware';
import rootReducer from 'model/stores/rootReducer';
import { IState } from 'model/stores/state';
import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  PreloadedState,
  Store,
} from 'redux';
import thunk from 'redux-thunk';

import { callAPIMiddleware } from './callAPIMiddleware';

let store = {} as Store<IState>;

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(
  initialState: IState,
  history: History<History.LocationState>,
  auth: IOAuth2Provider
) {
  const middleware: Middleware[] = [
    mainAuthMiddleware(auth),
    routerMiddleware(history),
    thunk,
    callAPIMiddleware,
  ];

  store = createStore(
    rootReducer(history),
    initialState as PreloadedState<IState>,
    composeEnhancers(applyMiddleware(...middleware))
  );

  return store;
}
