'use strict';

import React from 'react';
import DocumentTitle from 'react-document-title';
import { Route, Switch, Redirect } from 'react-router-dom';

import Page0_Overview from './0_overview.js';
import Page1_ConfigureKubeCTL from './1_configure_kubectl.js';
import Page2_SimpleExample from './2_simple_example.js';
import Page3_NextSteps from './3_next_steps.js';

import { Breadcrumb } from 'react-breadcrumbs';

class GettingStarted extends React.Component {
  render() {
    return (
      <DocumentTitle title={'Getting Started | Giant Swarm'}>
        <Breadcrumb
          data={{ title: 'GETTING STARTED', pathname: '/getting-started/' }}
        >
          <div>
            <Switch>
              <Route
                exact
                path='/getting-started/'
                component={Page0_Overview}
              />
              <Route
                exact
                path='/getting-started/configure/'
                component={Page1_ConfigureKubeCTL}
              />
              <Route
                exact
                path='/getting-started/example/'
                component={Page2_SimpleExample}
              />
              <Route
                exact
                path='/getting-started/next-steps/'
                component={Page3_NextSteps}
              />
              <Redirect path='*' to='/getting-started/' />
            </Switch>
          </div>
        </Breadcrumb>
      </DocumentTitle>
    );
  }
}

export default GettingStarted;
