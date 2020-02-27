import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'emotion-theming';
import PropTypes from 'prop-types';
import React from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';

import Routes from './Routes';

const App = ({ store, theme, history }) => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </ThemeProvider>
  </Provider>
);

App.propTypes = {
  store: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default hot(module)(App);
