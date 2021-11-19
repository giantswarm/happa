import { render, RenderOptions } from '@testing-library/react';
import App from 'App';
import MapiAuthProvider from 'Auth/MAPI/MapiAuthProvider';
import { ConnectedRouter } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import { History } from 'history';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import configureStore from 'model/stores/configureStore';
import { LoggedInUserTypes } from 'model/stores/main/types';
import { IState } from 'model/stores/state';
import React from 'react';
import { Provider } from 'react-redux';
import { MainRoutes } from 'shared/constants/routes';
import theme from 'styles/theme';
import ThemeProvider from 'styles/ThemeProvider';
import { SWRConfig } from 'swr';
import { FlashMessagesController } from 'UI/Util/FlashMessages/FlashMessagesController';
import FlashMessagesProvider from 'UI/Util/FlashMessages/FlashMessagesProvider';

type PropsOf<C> = C extends React.ComponentType<infer P> ? P : never;

export const initialStorage = {
  user: JSON.stringify({
    email: 'developer@giantswarm.io',
    auth: {
      scheme: 'giantswarm',
      token: 'a-valid-token',
    },
    isAdmin: true,
    type: LoggedInUserTypes.GS,
  }),
};

export function createInitialHistory(withRoute: string) {
  return createMemoryHistory({
    initialEntries: [withRoute],
    initialIndex: 0,
  });
}

/**
 * This function will render the whole app with a mocked store in the route
 * provided.
 * @param initialRoute The route to load.
 * @param state The initial store state.
 * @param storage The initial local storage state.
 * @param auth Authentication provider.
 */
export function renderRouteWithStore(
  initialRoute: string = MainRoutes.Home,
  state: Partial<IState> = {},
  storage: Partial<typeof initialStorage> = initialStorage,
  auth: IOAuth2Provider = new TestOAuth2(),
  history: History<History.LocationState> = createInitialHistory(initialRoute)
) {
  localStorage.replaceWith(storage);

  const store = configureStore(state as IState, history, auth);
  const flashMessagesController = FlashMessagesController.getInstance();

  const app = render(
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <App {...{ store, theme, history, auth, flashMessagesController }} />
    </SWRConfig>
  );

  return app;
}

/**
 * Render component in the Theme context
 * @param component The React Component
 * @param props Props to pass to the component
 * @param options Testing library render options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderWithTheme<C extends React.ComponentType<any>>(
  component: C,
  props?: PropsOf<C>,
  options?: RenderOptions
) {
  return render(getComponentWithTheme(component, props), options);
}

/**
 * Include component in the Theme context and return it
 * @param Component The React Component
 * @param props Props to pass to the component
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getComponentWithTheme<C extends React.ComponentType<any>>(
  Component: C,
  props: PropsOf<C> = {} as PropsOf<C>
) {
  const flashMessagesController = FlashMessagesController.getInstance();

  return (
    <ThemeProvider theme={theme}>
      <Component {...props} />
      <FlashMessagesProvider
        controller={flashMessagesController}
        animate={false}
      />
    </ThemeProvider>
  );
}

/**
 * Render component in the Store context
 * @param component The React Component
 * @param props Props to pass to the component
 * @param state Current Store state
 * @param options Testing library render options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderWithStore<C extends React.ComponentType<any>>(
  component: C,
  props?: PropsOf<C>,
  state?: Partial<IState>,
  options?: RenderOptions
) {
  return render(getComponentWithStore(component, props, state), options);
}

/**
 * Include component in the Store context and return it
 * @param Component The React Component
 * @param props Props to pass to the component
 * @param state Current Store state
 * @param storage Current LocalStorage value
 * @param history Current Browser history
 * @param auth Authentication provider.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getComponentWithStore<C extends React.ComponentType<any>>(
  Component: C,
  props: PropsOf<C> = {} as PropsOf<C>,
  state: Partial<IState> = {},
  storage: Partial<typeof initialStorage> = initialStorage,
  history: History<History.LocationState> = createMemoryHistory(),
  auth: IOAuth2Provider = new TestOAuth2(history)
) {
  localStorage.replaceWith(storage);

  const store = configureStore(state as IState, history, auth);
  const flashMessagesController = FlashMessagesController.getInstance();

  const app = (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <MapiAuthProvider auth={auth}>
            <Component {...props} />
          </MapiAuthProvider>
          <FlashMessagesProvider
            controller={flashMessagesController}
            animate={false}
          />
        </ConnectedRouter>
      </ThemeProvider>
    </Provider>
  );

  return app;
}
