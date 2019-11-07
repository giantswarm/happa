import 'babel-polyfill';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { ThemeProvider } from 'emotion-theming';
import configureStore from 'stores/configureStore';
import history from 'stores/history';
import monkeyPatchGiantSwarmClient from 'lib/giantswarm_client_patcher';
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

// Remove the loading class on the body, the javascript has loaded now.
const body = document.getElementsByTagName('body')[0];
body.classList.remove('loading');

// Configure the redux store.
const store = configureStore({}, history);

// Patch the Giant Swarm client so it has access to the store and can dispatch
// redux actions. This is needed because admin tokens expire after 5 minutes.
// This patches the Giant Swarm client so that it automatically renews the token
// before making a request if needed. And when renewing the token, we'd like to
// update the store with the new token.
monkeyPatchGiantSwarmClient(store);

history.listen(() => {
  window.scrollTo(0, 0);
});

// Finally, render the app!
const appContainer = document.getElementById('app');

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
