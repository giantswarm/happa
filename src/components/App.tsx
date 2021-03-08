import MapiAuthProvider from 'Auth/MAPI/MapiAuthProvider';
import { ConnectedRouter } from 'connected-react-router';
import Footer from 'Footer/Footer';
import { History } from 'history';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import PropTypes from 'prop-types';
import React from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { DefaultTheme } from 'styled-components';
import ThemeProvider from 'styles/ThemeProvider';

import Routes from './Routes';

interface IAppProps {
  store: Store;
  theme: DefaultTheme;
  history: History<History.LocationState>;
  auth: IOAuth2Provider;
}

const App: React.FC<IAppProps> = ({ store, theme, history, auth }) => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConnectedRouter history={history}>
        <MapiAuthProvider auth={auth}>
          <main>
            <Routes />
          </main>
        </MapiAuthProvider>
        <Footer />
      </ConnectedRouter>
    </ThemeProvider>
  </Provider>
);

// Ignoring these, as we don't want to specify the exact shape of each prop type for now
App.propTypes = {
  // @ts-expect-error
  store: PropTypes.object.isRequired,
  // @ts-expect-error
  theme: PropTypes.object.isRequired,
  // @ts-expect-error
  history: PropTypes.object.isRequired,
  // @ts-expect-error
  auth: PropTypes.object.isRequired,
};

export default hot(module)(App);
