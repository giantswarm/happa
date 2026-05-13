import { History } from 'history';
import { mainAuthMiddleware } from 'model/stores/main/middleware';
import rootReducer from 'model/stores/rootReducer';
import { IState } from 'model/stores/state';
import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  PreloadedState,
  Reducer,
  Store,
} from 'redux';
import { createReduxHistoryContext } from 'redux-first-history';
import thunk from 'redux-thunk';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { callAPIMiddleware } from './callAPIMiddleware';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(
  initialState: IState,
  baseHistory: History<History.LocationState>,
  auth: IOAuth2Provider
): {
  store: Store<IState>;
  history: History<History.LocationState>;
} {
  const { createReduxHistory, routerMiddleware, routerReducer } =
    createReduxHistoryContext({ history: baseHistory });

  const middleware: Middleware[] = [
    mainAuthMiddleware(auth),
    routerMiddleware,
    thunk,
    callAPIMiddleware,
  ];

  const store = createStore(
    rootReducer(routerReducer as Reducer),
    initialState as PreloadedState<IState>,
    composeEnhancers(applyMiddleware(...middleware))
  );

  const history = createReduxHistory(store) as History<History.LocationState>;

  return { store, history };
}
