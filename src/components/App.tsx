import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'emotion-theming';
import { History } from 'history';
import PropTypes from 'prop-types';
import React from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { ITheme } from 'styles';

import Routes from './Routes';

interface IAppProps {
  store: Store;
  theme: ITheme;
  history: History<History.LocationState>;
}

const App: React.FC<IAppProps> = ({ store, theme, history }) => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </ThemeProvider>
  </Provider>
);

// Ignoring these, as we don't want to specify the exact shape of each prop type for now
App.propTypes = {
  store: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  // @ts-ignore
  history: PropTypes.object.isRequired,
};

export default hot(module)(App);
