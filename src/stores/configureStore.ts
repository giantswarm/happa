import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import { SentryErrorNotifier } from 'lib/errors/SentryErrorNotifier';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  Store,
  StoreEnhancer,
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
    mainAuthMiddleware(auth),
    routerMiddleware(history),
    thunk,
    callAPIMiddleware,
  ];

  const enhancers: StoreEnhancer[] = [applyMiddleware(...middleware)];
  if (window.config.environment !== GlobalEnvironment.Dev) {
    enhancers.push(SentryErrorNotifier.createReduxEnhancer());
  }

  store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(enhancers)
  );

  return store;
}
