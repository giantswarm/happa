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
import monkeyPatchGiantSwarmClient from 'lib/giantswarmClientPatcher';
import { Requester } from 'lib/patchedAirbrakeRequester';
import React from 'react';
import { render } from 'react-dom';
import configureStore from 'stores/configureStore';
import history from 'stores/history';
import theme from 'styles/theme';

import App from './App';

// Configure the redux store.
const store = configureStore({}, history);

// Patch the Giant Swarm client so it has access to the store and can dispatch
// redux actions. This is needed because admin tokens expire after 5 minutes.
// This patches the Giant Swarm client so that it automatically renews the token
// before making a request if needed. And when renewing the token, we'd like to
// update the store with the new token.
monkeyPatchGiantSwarmClient(store);

export let errorReporter = null;

// Configure an airbrake notifier for excption notification.
// But only when not in development.
if (window.config.environment === 'development') {
  // We use the airbrake notifier here instead of rolling our own notification
  // client, it is a stable project used by many. Though instead of sending our
  // exception reports to airbrake we send it to an endpoint of our own API, to
  // ensure no customer data is being shared with a third party.
  errorReporter = new Notifier({
    // projectId and projectKey are not relevant to our exception notification endpoint, but are required to create a valid notifier.
    projectId: 1,
    projectKey: 'happa',
    environment: window.config.environment,
  });

  // Reach into the airbrake notifier instance and modify the private _url and
  // _requester attributes since the constructor does not allow us to edit the
  // url or the headers used during the request easily. We need to set headers so
  // that we can authenticate against our API endpoint.
  errorReporter._url = `${window.config.apiEndpoint}/v5/exception-notifications/`;
  errorReporter._requester = new Requester(store).request;

  // set up a filter for reporting addtional information (happa version)
  errorReporter.addFilter(notice => ({
    ...notice,
    context: { ...notice.context, version: window.config.happaVersion },
  }));
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
