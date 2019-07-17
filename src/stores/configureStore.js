import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import history from './history';
import rootReducer from 'reducers';
import thunk from 'redux-thunk';

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
