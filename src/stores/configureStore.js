'use strict';

import { createStore, applyMiddleware, compose } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';

var store;

export default function configureStore(initialState, history) {
  if (store) {
    return store;
  } else {
    store = createStore(
      connectRouter(history)(rootReducer),
      initialState,
      compose(
        applyMiddleware(
          routerMiddleware(history),
          thunk,
        ),
        window.devToolsExtension ? window.devToolsExtension() : f => f
      )
    );

    return store;
  }
}
