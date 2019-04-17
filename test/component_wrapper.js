import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import React from 'react';

import configureStore from './redux.test.config';
import history from '../src/stores/history';

import PromiseMock from 'promise-mock';

PromiseMock.install();

var request = require('superagent');
var config = require('./superagent-mock-config');

var superagentRequest = require('superagent-bluebird-promise');

var logger = function(log)  {
  // console.log('superagent call', log);  // uncomment to watch all requests
};

require('superagent-mock')(request, config, logger);
require('./superagent-promise-mock')(superagentRequest);

const ComponentWrapper = (props) => {
  const defaultRouter = {
    location: {
      pathname: '/',
      search: '',
      hash: '',
      state: undefined
    },
    action: 'POP'
  };

  const store = configureStore({
    router: props.router ? Object.assign({}, defaultRouter, props.router) : defaultRouter
  });

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        {props.children}
      </ConnectedRouter>
    </Provider>
  );
};

export default ComponentWrapper;
