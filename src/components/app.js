import 'babel-polyfill';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { ThemeProvider } from 'emotion-theming';
import configureStore from 'stores/configureStore';
import history from 'stores/history';
import React from 'react';
import Routes from './routes';
import theme from 'styles/theme';

// CSS Imports
// Keep the blank lines to allow for a certain ordering!

import 'normalize.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import 'noty/lib/noty.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'styles/app.sass';

const appContainer = document.getElementById('app');
const body = document.getElementsByTagName('body')[0];

body.classList.remove('loading');

export const store = configureStore({}, history);

history.listen(() => {
  window.scrollTo(0, 0);
});

const renderApp = () =>
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </ThemeProvider>
    </Provider>,
    appContainer
  );

export default hot(module)(renderApp());
