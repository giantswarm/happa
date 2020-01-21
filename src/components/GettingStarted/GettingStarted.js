import DocumentTitle from 'components/shared/DocumentTitle';
import RoutePath from 'lib/RoutePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Organizations } from 'shared/constants/routes';

import Page1_ConfigureKubeCTL from './Steps/ConfigureKubectl';
import Page3_NextSteps from './Steps/NextSteps';
import Page0_Overview from './Steps/Overview';
import Page2_SimpleExample from './Steps/SimpleExample';

const GettingStarted = props => (
  <DocumentTitle title='Getting Started'>
    <Breadcrumb
      data={{
        title: 'GETTING STARTED',
        pathname: RoutePath.createUsablePath(
          Organizations.GettingStarted.Overview,
          {
            clusterId: props.match.params.clusterId,
            orgId: props.match.params.orgId,
          }
        ),
      }}
    >
      <div>
        <Switch>
          <Route
            component={Page0_Overview}
            exact
            path={Organizations.GettingStarted.Overview}
          />
          <Route
            component={Page1_ConfigureKubeCTL}
            exact
            path={Organizations.GettingStarted.ConfigureKubeCtl}
          />
          <Route
            component={Page2_SimpleExample}
            exact
            path={Organizations.GettingStarted.SimpleExample}
          />
          <Route
            component={Page3_NextSteps}
            exact
            path={Organizations.GettingStarted.NextSteps}
          />
          <Redirect path='*' to={Organizations.GettingStarted.Overview} />
        </Switch>
      </div>
    </Breadcrumb>
  </DocumentTitle>
);

GettingStarted.propTypes = {
  match: PropTypes.object,
};

export default GettingStarted;
