import DocumentTitle from 'components/shared/DocumentTitle';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { Redirect, Route, Switch } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';

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
          OrganizationsRoutes.Clusters.GettingStarted.Overview,
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
            path={OrganizationsRoutes.Clusters.GettingStarted.Overview}
          />
          <Route
            component={Page1_ConfigureKubeCTL}
            exact
            path={OrganizationsRoutes.Clusters.GettingStarted.ConfigureKubeCtl}
          />
          <Route
            component={Page2_SimpleExample}
            exact
            path={OrganizationsRoutes.Clusters.GettingStarted.SimpleExample}
          />
          <Route
            component={Page3_NextSteps}
            exact
            path={OrganizationsRoutes.Clusters.GettingStarted.NextSteps}
          />
          <Redirect
            path='*'
            to={OrganizationsRoutes.Clusters.GettingStarted.Overview}
          />
        </Switch>
      </div>
    </Breadcrumb>
  </DocumentTitle>
);

GettingStarted.propTypes = {
  match: PropTypes.object,
};

export default GettingStarted;
