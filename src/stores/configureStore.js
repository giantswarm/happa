import { applyMiddleware, compose, createStore } from 'redux';
import rootReducer from 'reducers';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';

let store = {};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(initialState, history) {
  store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(routerMiddleware(history), thunk))
  );

  return store;
}
