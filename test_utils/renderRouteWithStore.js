import { ConnectedRouter } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import Routes from 'routes';
import configureStore from 'stores/configureStore';
import initialState from 'test_utils/initialState';
import React from 'react';
import theme from 'styles/theme';


/**
 * This function will render the whole app with a mocked store in the route
 * provided.
 * @param {String} route.
 * @param {Object} container An HTMLElement.
 */
export function renderRouteWithStore(
  container,
  state = initialState(),
  history = createMemoryHistory(),
) {

  const store = configureStore(state, history);

  return { store, ...render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </ThemeProvider>
    </Provider>,
    container
  )}
}
