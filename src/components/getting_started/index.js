import { Breadcrumb } from 'react-breadcrumbs';
import { Redirect, Route, Switch } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import Page0_Overview from './0_overview.js';
import Page1_ConfigureKubeCTL from './1_configure_kubectl.js';
import Page2_SimpleExample from './2_simple_example.js';
import Page3_NextSteps from './3_next_steps.js';
import PropTypes from 'prop-types';
import React from 'react';

class GettingStarted extends React.Component {
  render() {
    return (
      <DocumentTitle title={'Getting Started | Giant Swarm'}>
        <Breadcrumb
          data={{
            title: 'GETTING STARTED',
            pathname:
              '/organizations/' +
              this.props.match.params.orgId +
              '/clusters/' +
              this.props.match.params.clusterId +
              '/getting-started/',
          }}
        >
          <div>
            <Switch>
              <Route
                component={Page0_Overview}
                exact
                path='/organizations/:orgId/clusters/:clusterId/getting-started/'
              />
              <Route
                component={Page1_ConfigureKubeCTL}
                exact
                path='/organizations/:orgId/clusters/:clusterId/getting-started/configure/'
              />
              <Route
                component={Page2_SimpleExample}
                exact
                path='/organizations/:orgId/clusters/:clusterId/getting-started/example/'
              />
              <Route
                component={Page3_NextSteps}
                exact
                path='/organizations/:orgId/clusters/:clusterId/getting-started/next-steps/'
              />
              <Redirect
                path='*'
                to='/organizations/:orgId/clusters/:clusterId/getting-started/'
              />
            </Switch>
          </div>
        </Breadcrumb>
      </DocumentTitle>
    );
  }
}

GettingStarted.propTypes = {
  match: PropTypes.object,
};

export default GettingStarted;
