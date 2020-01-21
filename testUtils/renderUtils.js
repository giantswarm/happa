import { render } from '@testing-library/react';
import { ConnectedRouter, push } from 'connected-react-router';
import { ThemeProvider } from 'emotion-theming';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import Routes from 'Routes';
import configureStore from 'stores/configureStore';
import theme from 'styles/theme';

const initialStorage = {
  user:
    '"{"email":"developer@giantswarm.io","auth":{"scheme":"giantswarm","token":"a-valid-token"},"isAdmin":true}"',
};

/**
 * This function will render the whole app with a mocked store in the route
 * provided.
 * @param {String} route.
 * @param {HTMLElement} container An HTMLElement.
 */
export function renderRouteWithStore(
  initialRoute = '/',
  state = {},
  storage = initialStorage,
  history = createMemoryHistory()
) {
  localStorage.replaceWith(storage);

  const store = configureStore(state, history);

  const app = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </ThemeProvider>
    </Provider>
  );

  store.dispatch(push(initialRoute));

  return app;
}

/**
 * Render component in the Theme context
 * @param {React.ReactType} component The React Component
 * @param {<P extends Record<string, any>>React.ComponentProps<P>} props Props to pass to the component
 * @param {<Q extends TestingLibrary.Queries>TestingLibrary.RenderOptions<Q>} [options] Testing library render options
 */
export function renderWithTheme(component, props, options) {
  return render(getComponentWithTheme(component, props), options);
}

/**
 * Include component in the Theme context and return it
 * @param {React.ReactType} Component The React Component
 * @param {<P extends Record<string, any>>React.ComponentProps<P>} props Props to pass to the component
 */
export function getComponentWithTheme(Component, props) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...props} />
    </ThemeProvider>
  );
}

/**
 * Render component in the Store context
 * @param {React.ReactType} component The React Component
 * @param {<P extends Record<string, any>>React.ComponentProps<P>} props Props to pass to the component
 * @param {Record<string, any>} state Current Store state
 * @param {<Q extends TestingLibrary.Queries>TestingLibrary.RenderOptions<Q>} [options] Testing library render options
 */
export function renderWithStore(component, props, state, options) {
  return render(getComponentWithStore(component, props, state), options);
}

/**
 * Include component in the Store context and return it
 * @param {React.ReactType} Component The React Component
 * @param {<P extends Record<string, any>>React.ComponentProps<P>} props Props to pass to the component
 * @param {Record<string, any>} state Current Store state
 * @param {Record<string, any>} storage Current LocalStorage value
 * @param {History} history Current Browser history
 */
export function getComponentWithStore(
  Component,
  props = {},
  state = {},
  storage = initialStorage,
  history = createMemoryHistory()
) {
  localStorage.replaceWith(storage);

  const store = configureStore(state, history);

  const app = (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <Component {...props} />
        </ConnectedRouter>
      </ThemeProvider>
    </Provider>
  );

  return app;
}
