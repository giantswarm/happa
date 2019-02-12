'use strict';

import { createStore, applyMiddleware, compose } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
import history from './history';

var store;

export default function configureStore(initialState) {
  if (store) {
    return store;
  } else {
    store = createStore(
      connectRouter(history)(rootReducer),
      initialState,
      compose(
        applyMiddleware(routerMiddleware(history), thunk),
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__()
      )
    );

    return store;
  }
}
