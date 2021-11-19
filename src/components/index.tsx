import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/app.sass';

import * as featureFlags from 'model/featureFlags';
import configureStore from 'model/stores/configureStore';
import history from 'model/stores/history';
import { IState } from 'model/stores/state';
import React from 'react';
import { render } from 'react-dom';
import { Store } from 'redux';
import theme from 'styles/theme';
import { FlashMessagesController } from 'UI/Util/FlashMessages/FlashMessagesController';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { SentryErrorNotifier } from 'utils/errors/SentryErrorNotifier';
import { makeDefaultConfig } from 'utils/MapiAuth/makeDefaultConfig';
import MapiAuth from 'utils/MapiAuth/MapiAuth';
import { RUMService } from 'utils/RUMService';

import App from './App';

featureFlags.init();

const authConfig = makeDefaultConfig();
const auth = new MapiAuth(authConfig);

const flashMessagesController = FlashMessagesController.getInstance();

// Configure the redux store.
const store: Store = configureStore({} as IState, history, auth);

if (window.config.environment !== 'development') {
  const errorReporter = ErrorReporter.getInstance();
  errorReporter.notifier = new SentryErrorNotifier({
    projectName: 'happa',
    dsn: window.config.sentryDsn,
    releaseVersion: window.config.sentryReleaseVersion,
    environment: window.config.sentryEnvironment,
    debug: window.config.sentryDebug,
    sampleRate: window.config.sentrySampleRate,
    history,
  });
}

const rumService = new RUMService(history);
rumService.initEvents();

// Scroll to the top when we change the URL.
history.listen(() => {
  window.scrollTo(0, 0);
});

// Remove the loading class on the body, the javascript has loaded now.
const body = document.getElementsByTagName('body')[0];
body.classList.remove('loading');

// Finally, render the app!
const appContainer = document.getElementById('app');
render(
  <App {...{ store, theme, history, auth, flashMessagesController }} />,
  appContainer
);
