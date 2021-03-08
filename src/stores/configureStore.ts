import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  Store,
} from 'redux';
import thunk from 'redux-thunk';
import { mainAuthMiddleware } from 'stores/main/middleware';
import rootReducer from 'stores/rootReducer';
import { IState } from 'stores/state';

import { callAPIMiddleware } from './callAPIMiddleware';

let store = {} as Store<IState>;

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(
  initialState: IState,
  history: History<History.LocationState>,
  auth: IOAuth2Provider
) {
  const middleware: Middleware[] = [
    routerMiddleware(history),
    thunk,
    mainAuthMiddleware(auth),
    callAPIMiddleware,
  ];

  store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(...middleware))
  );

  return store;
}
