import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import configureStore from 'stores/configureStore';
import initialState from 'test_utils/initialState';
import Layout from 'layout';
import React from 'react';
import theme from 'styles/theme';

/**
 * This function will render the whole app with a mocked store in the route
 * provided.
 * @param {String} route.
 * @param {Object} container An HTMLElement.
 */
export function renderRouteWithStore(route = '/', container) {
  const store = configureStore(initialState);

  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[route]}>
          <Layout />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
    container
  );
}
