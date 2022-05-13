import MapiAuthProvider from 'Auth/MAPI/MapiAuthProvider';
import { ConnectedRouter } from 'connected-react-router';
import Footer from 'Footer/Footer';
import { Box, Heading, Text } from 'grommet';
import { History } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import ErrorBoundary from 'shared/ErrorBoundary';
import { DefaultTheme } from 'styled-components';
import ThemeProvider from 'ThemeProvider';
import { FlashMessagesController } from 'UI/Util/FlashMessages/FlashMessagesController';
import FlashMessagesProvider from 'UI/Util/FlashMessages/FlashMessagesProvider';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import Routes from './Routes';

interface IAppProps {
  store: Store;
  theme: DefaultTheme;
  history: History<History.LocationState>;
  auth: IOAuth2Provider;
  flashMessagesController: FlashMessagesController;
}

const App: React.FC<React.PropsWithChildren<IAppProps>> = ({
  store,
  theme,
  history,
  auth,
  flashMessagesController,
}) => (
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
          <FlashMessagesProvider controller={flashMessagesController} />
          <Footer />
        </ConnectedRouter>
      </ThemeProvider>
    </Provider>
  </ErrorBoundary>
);

export default App;
