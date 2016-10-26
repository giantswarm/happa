'use strict';

import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';

var store;

export default function configureStore(initialState) {
  if (store) {
    return store;
  } else {
    store = createStore(
      rootReducer,
      initialState,
      compose(
        applyMiddleware(thunk, reduxImmutableStateInvariant()),
        window.devToolsExtension ? window.devToolsExtension() : f => f
      )
    );

    return store;
  }
}