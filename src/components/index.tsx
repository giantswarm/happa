import 'babel-polyfill';
// CSS Imports
// Keep the blank lines to allow for a certain ordering!
// eslint-disable-next-line sort-imports
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'noty/lib/noty.css';
import 'styles/app.sass';

import axios from 'axios';
import * as Bowser from 'bowser';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { SentryErrorNotifier } from 'lib/errors/SentryErrorNotifier';
import { makeDefaultConfig } from 'lib/MapiAuth/makeDefaultConfig';
import MapiAuth from 'lib/MapiAuth/MapiAuth';
import React from 'react';
import { render } from 'react-dom';
import { Store } from 'redux';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import configureStore from 'stores/configureStore';
import history from 'stores/history';
import { IState } from 'stores/state';
import theme from 'styles/theme';
import { mergeActionNames } from 'utils/realUserMonitoringUtils';
import { v4 as uuidv4 } from 'uuid';
import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric } from 'web-vitals';

import App from './App';

enum GlobalEnvironment {
  Dev = 'development',
  Kubernetes = 'kubernetes',
  Docker = 'docker-container',
}

const authConfig = makeDefaultConfig();
const auth = new MapiAuth(authConfig);

// Configure the redux store.
const store: Store = configureStore({} as IState, history, auth);

// Generate session ID for real user monitoring.
const sessionID: string = uuidv4();

if (window.config.environment !== GlobalEnvironment.Dev) {
  const errorReporter = ErrorReporter.getInstance();
  errorReporter.notifier = new SentryErrorNotifier({
    projectName: 'happa',
    dsn: window.config.sentryDsn,
    releaseVersion: window.config.sentryReleaseVersion,
    environment: window.config.sentryEnvironment,
  });
}

// Scroll to the top when we change the URL.
history.listen(() => {
  window.scrollTo(0, 0);
});

// Remove the loading class on the body, the javascript has loaded now.
const body = document.getElementsByTagName('body')[0];
body.classList.remove('loading');

// Finally, render the app!
const appContainer = document.getElementById('app');
render(<App {...{ store, theme, history, auth }} />, appContainer);

const getSizes = () => {
  return {
    windowInnerWidth: window.innerWidth,
    windowInnerHeight: window.innerHeight,
    screenHeight: window.screen.height,
    screenWidth: window.screen.width,
    screenAvailableHeight: window.screen.availHeight,
    screenAvailableWidth: window.screen.availWidth,
  };
};

async function submitCustomRUM(
  payloadType: string,
  payloadSchemaVersion: number,
  payload: Record<string, string | number | object>
) {
  if (!window.config.enableRealUserMonitoring) {
    // RUM is disabled.
    return;
  }

  const url: string = `${window.config.apiEndpoint}/v5/analytics/`;

  try {
    await axios.post(url, {
      app_id: 'happa',
      session_id: sessionID,
      payload_type: payloadType,
      payload_schema_version: payloadSchemaVersion,
      payload: payload,
      uri_path: location.pathname,
    });
  } catch (exception) {
    // eslint-disable-next-line no-console
    console.log('Could not submit usage data', exception);
  }
}

// Register a window load and resize event listener
// for window/screen size recording.
const oneSecond: number = 1000;
let resizeRecorderTimeout: number = 0;

window.addEventListener('resize', () => {
  window.clearTimeout(resizeRecorderTimeout);
  resizeRecorderTimeout = window.setTimeout(() => {
    const sizes = getSizes();
    window.DD_RUM?.addUserAction(RUMActions.WindowResize, sizes);
    submitCustomRUM(RUMActions.WindowResize, 1, sizes);
  }, oneSecond);
});

window.addEventListener('load', () => {
  const sizes = getSizes();
  window.DD_RUM?.addUserAction(RUMActions.WindowLoad, sizes);

  // Client information
  const clientInfo = Bowser.parse(window.navigator.userAgent);
  submitCustomRUM(RUMActions.WindowLoad, 2, {
    sizes: sizes,
    client: clientInfo,
  });
});

// Log core web vitals.
const recorded: Record<string, boolean> = {};

function handleReport(rh: Metric) {
  if (rh.id in recorded) {
    return;
  }

  recorded[rh.id] = true;

  const values = {
    web_vitals: { [rh.name.toLowerCase()]: rh.value },
  };
  const actionName = mergeActionNames(RUMActions.WebVitals, rh.name);

  // Submit data to Giant Swarm API
  submitCustomRUM(actionName, 1, values.web_vitals);
}

getCLS(handleReport);
getFID(handleReport);
getFCP(handleReport);
getLCP(handleReport);
getTTFB(handleReport);
