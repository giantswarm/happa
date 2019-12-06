import { ConnectedRouter } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { push } from 'connected-react-router';
import TestingLibrary, { render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import configureStore from 'stores/configureStore';
import React from 'react';
import Routes from 'Routes';
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
