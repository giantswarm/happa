import CPAuthProvider from 'Auth/CP/CPAuthProvider';
import { ConnectedRouter } from 'connected-react-router/immutable';
import { ThemeProvider } from 'emotion-theming';
import Footer from 'Footer/Footer';
import { History } from 'history';
import PropTypes from 'prop-types';
import React from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import FeatureFlags from 'shared/FeatureFlags';
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
        {FeatureFlags.FEATURE_CP_ACCESS && <CPAuthProvider />}

        <main>
          <Routes />
        </main>
        <Footer />
      </ConnectedRouter>
    </ThemeProvider>
  </Provider>
);

// Ignoring these, as we don't want to specify the exact shape of each prop type for now
App.propTypes = {
  // @ts-ignore
  store: PropTypes.object.isRequired,
  // @ts-ignore
  theme: PropTypes.object.isRequired,
  // @ts-ignore
  history: PropTypes.object.isRequired,
};

export default hot(module)(App);
