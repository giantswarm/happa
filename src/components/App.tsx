import MapiAuthProvider from 'Auth/MAPI/MapiAuthProvider';
import { ConnectedRouter } from 'connected-react-router';
import Footer from 'Footer/Footer';
import { Box, Heading, Text } from 'grommet';
import { History } from 'history';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import React from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import ErrorBoundary from 'shared/ErrorBoundary';
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
  <ErrorBoundary
    reportError={true}
    fallback={
      <Box justify='center' align='center' height={{ min: '100vh' }}>
        <Box>
          <Heading level={1}>
            {' '}
            <i
              className='fa fa-warning'
              role='presentation'
              aria-hidden='true'
            />{' '}
            Something went wrong
          </Heading>
          <Text>
            We&apos;ve been notified. You can try again by refreshing the page.
          </Text>
        </Box>
      </Box>
    }
  >
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
  </ErrorBoundary>
);

export default hot(module)(App);
