import DocumentTitle from 'components/shared/DocumentTitle';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Switch } from 'react-router-dom';
import Route from 'Route';
import { OrganizationsRoutes } from 'shared/constants/routes';
import styled from 'styled-components';

import ConfigureKubeCTL from './Steps/ConfigureKubectl';
import InstallIngress from './Steps/InstallIngress';
import NextSteps from './Steps/NextSteps';
import Overview from './Steps/Overview';
import SimpleExample from './Steps/SimpleExample';

const Wrapper = styled.div`
  max-width: 800px;
  margin: auto;
`;

const GettingStarted = (props) => {
  const pathParams = {
    orgId: props.match.params.orgId,
    clusterId: props.match.params.clusterId,
  };

  const clusterGuideConfigurationPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.GettingStarted.ConfigureKubeCtl,
    pathParams
  );

  const clusterGuideExamplePath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.GettingStarted.SimpleExample,
    pathParams
  );

  const clusterGuideIngressPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.GettingStarted.InstallIngress,
    pathParams
  );

  const clusterGuideNextStepsPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.GettingStarted.NextSteps,
    pathParams
  );

  const steps = [
    {
      title: 'Get Access',
      description:
        'Enable your Kubernetes CLI to access your Kubernetes cluster at Giant Swarm',
      url: clusterGuideConfigurationPath,
      routePath: OrganizationsRoutes.Clusters.GettingStarted.ConfigureKubeCtl,
      component: ConfigureKubeCTL,
    },

    {
      title: 'Run a simple example',
      description: `To make sure everything works as expected, let's start a hello world application`,
      url: clusterGuideExamplePath,
      routePath: OrganizationsRoutes.Clusters.GettingStarted.SimpleExample,
      component: SimpleExample,
    },

    {
      title: 'Next steps',
      description:
        'We point you to some useful next best actions, like setting up the Kubernetes dashboard',
      url: clusterGuideNextStepsPath,
      routePath: OrganizationsRoutes.Clusters.GettingStarted.NextSteps,
      component: NextSteps,
    },
  ];

  // Insert the install ingress step if the cluster has optional ingress.
  const ingressStep = {
    title: 'Install an ingress controller',
    description: `We'll need an ingress controller before we can access any services from the browser`,
    url: clusterGuideIngressPath,
    routePath: OrganizationsRoutes.Clusters.GettingStarted.InstallIngress,
    component: InstallIngress,
  };

  if (props.hasOptionalIngress) {
    steps.splice(1, 0, ingressStep);
  }

  return (
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
        <Wrapper>
          <Switch>
            <Route
              render={() => <Overview steps={steps} {...props} />}
              exact
              path={OrganizationsRoutes.Clusters.GettingStarted.Overview}
            />
            {steps.map(({ component: Component, routePath, title }, i) => (
              <Route
                render={() => (
                  <Component steps={steps} stepIndex={i} {...props} />
                )}
                exact
                path={routePath}
                key={title}
              />
            ))}
            <Redirect
              path='*'
              to={OrganizationsRoutes.Clusters.GettingStarted.Overview}
            />
          </Switch>
        </Wrapper>
      </Breadcrumb>
    </DocumentTitle>
  );
};

GettingStarted.propTypes = {
  match: PropTypes.object,
  hasOptionalIngress: PropTypes.bool,
};

function mapStateToProps(state, ownProps) {
  const selectedCluster =
    state.entities.clusters.items[ownProps.match.params.clusterId];

  return {
    hasOptionalIngress: selectedCluster?.capabilities?.hasOptionalIngress,
  };
}

export default connect(mapStateToProps)(GettingStarted);
