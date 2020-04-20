import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import rootReducer from 'reducers';
import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';

let store: Store = {} as Store;

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialState: Record<string, any>,
  history: History<History.LocationState>
) {
  store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(routerMiddleware(history), thunk))
  );

  return store;
}
