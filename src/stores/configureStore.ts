import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import rootReducer from 'reducers';
import { IState } from 'reducers/types';
import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';

import { callAPIMiddleware } from './callAPIMiddleware';

let store: Store = {} as Store;

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(
  initialState: IState,
  history: History<History.LocationState>
) {
  store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(
      applyMiddleware(routerMiddleware(history), thunk, callAPIMiddleware)
    )
  );

  return store;
}
