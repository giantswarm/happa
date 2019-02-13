'use strict';

import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
import history from './history';

var store;

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(initialState) {
  if (store) {
    return store;
  } else {
    store = createStore(
      rootReducer(history),
      initialState,
      composeEnhancers(applyMiddleware(routerMiddleware(history), thunk))
    );

    return store;
  }
}
