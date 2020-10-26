import 'babel-polyfill';
// CSS Imports
// Keep the blank lines to allow for a certain ordering!
// eslint-disable-next-line sort-imports
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'noty/lib/noty.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'styles/app.sass';

import { Notifier } from '@airbrake/browser';
import CPAuth from 'lib/CPAuth/CPAuth';
import ErrorReporter from 'lib/errors/ErrorReporter';
import monkeyPatchGiantSwarmClient from 'lib/giantswarmClientPatcher';
import { Requester } from 'lib/patchedAirbrakeRequester';
import React from 'react';
import { render } from 'react-dom';
import { Store } from 'redux';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import FeatureFlags from 'shared/FeatureFlags';
import configureStore from 'stores/configureStore';
import history from 'stores/history';
import { IState } from 'stores/state';
import theme from 'styles/theme';
import { mergeActionNames } from 'utils/realUserMonitoringUtils';
import { getCLS, getFID, getLCP, Metric } from 'web-vitals';

import App from './App';

enum GlobalEnvironment {
  Dev = 'development',
  Kubernetes = 'kubernetes',
  Docker = 'docker-container',
}

interface IGlobalConfig {
  apiEndpoint: string;
  cpApiEndpoint: string;
  audience: string;
  cpAudience: string;
  passageEndpoint: string;
  environment: GlobalEnvironment;
  ingressBaseDomain: string;
  awsCapabilitiesJSON: string;
  azureCapabilitiesJSON: string;
  happaVersion: string;
  defaultRequestTimeoutSeconds: number;
}

declare global {
  interface Window {
    config: IGlobalConfig;
  }
}

// eslint-disable-next-line @typescript-eslint/init-declarations
let cpAccess: CPAuth | undefined;
if (FeatureFlags.FEATURE_CP_ACCESS) {
  cpAccess = CPAuth.getInstance();
}

// Configure the redux store.
const store: Store = configureStore({} as IState, history, cpAccess);

// Patch the Giant Swarm client so it has access to the store and can dispatch
// redux actions. This is needed because admin tokens expire after 5 minutes.
// This patches the Giant Swarm client so that it automatically renews the token
// before making a request if needed. And when renewing the token, we'd like to
// update the store with the new token.
monkeyPatchGiantSwarmClient(store);

// Configure an airbrake notifier for excption notification.
// But only when not in development.
if (window.config.environment !== GlobalEnvironment.Dev) {
  // We use the airbrake notifier here instead of rolling our own notification
  // client, it is a stable project used by many. Though instead of sending our
  // exception reports to airbrake we send it to an endpoint of our own API, to
  // ensure no customer data is being shared with a third party.
  const airbrake = new Notifier({
    // projectId and projectKey are not relevant to our exception notification endpoint, but are required to create a valid notifier.
    projectId: 1,
    projectKey: 'happa',
    environment: window.config.environment,
  });

  // Reach into the airbrake notifier instance and modify the private _url and
  // _requester attributes since the constructor does not allow us to edit the
  // url or the headers used during the request easily. We need to set headers so
  // that we can authenticate against our API endpoint.
  // @ts-ignore
  airbrake._url = `${window.config.apiEndpoint}/v5/exception-notifications/`;
  // @ts-ignore
  airbrake._requester = new Requester(store).request;

  // set up a filter for reporting addtional information (happa version)
  airbrake.addFilter((notice) => ({
    ...notice,
    context: { ...notice.context, version: window.config.happaVersion },
  }));

  const errorReporter = ErrorReporter.getInstance();
  errorReporter.notifier = airbrake;
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
render(<App {...{ store, theme, history }} />, appContainer);

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

// Register a window load and resize event listener
// for window/screen size recording.
const oneSecond: number = 1000;
let resizeRecorderTimeout: number = 0;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeRecorderTimeout);
  resizeRecorderTimeout = window.setTimeout(() => {
    window.DD_RUM?.addUserAction(RUMActions.WindowResize, getSizes());
  }, oneSecond);
});
window.addEventListener('load', () => {
  window.DD_RUM?.addUserAction(RUMActions.WindowLoad, getSizes());
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
  window.DD_RUM?.addUserAction(actionName, values);
}

getCLS(handleReport);
getFID(handleReport);
getLCP(handleReport);
