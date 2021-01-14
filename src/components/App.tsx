import CPAuthProvider from 'Auth/CP/CPAuthProvider';
import { ConnectedRouter } from 'connected-react-router';
import Footer from 'Footer/Footer';
import { Grommet } from 'grommet';
import { History } from 'history';
import PropTypes from 'prop-types';
import React from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import FeatureFlags from 'shared/FeatureFlags';
import { DefaultTheme, ThemeProvider } from 'styled-components';
import styled from 'styled-components';

import Routes from './Routes';

const StyledGrommet = styled(Grommet)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: center;
  max-width: 1200px;
  margin: auto;
  padding: 0px 10px;
`;

interface IAppProps {
  store: Store;
  theme: DefaultTheme;
  history: History<History.LocationState>;
}

const App: React.FC<IAppProps> = ({ store, theme, history }) => (
  <Provider store={store}>
    <StyledGrommet>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          {FeatureFlags.FEATURE_CP_ACCESS && <CPAuthProvider />}

          <main>
            <Routes />
          </main>
          <Footer />
        </ConnectedRouter>
      </ThemeProvider>
    </StyledGrommet>
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
