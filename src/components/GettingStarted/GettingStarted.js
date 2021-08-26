import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import RoutePath from 'lib/routePath';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Switch, useParams } from 'react-router-dom';
import Route from 'Route';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import { selectClusterById } from 'stores/cluster/selectors';
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
  const { clusterId, orgId } = useParams();

  const selectedCluster = useSelector((state) =>
    selectClusterById(state, clusterId)
  );

  const clusterExists =
    typeof selectedCluster !== 'undefined' && selectedCluster !== null;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!clusterExists) {
      new FlashMessage(
        `Cluster <code>${clusterId}</code> no longer exists.`,
        messageType.INFO,
        messageTTL.MEDIUM
      );

      dispatch(push(MainRoutes.Home));
    }
  }, [clusterExists, clusterId, dispatch]);

  const pathParams = {
    orgId,
    clusterId,
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

  if (selectedCluster?.capabilities?.hasOptionalIngress) {
    steps.splice(1, 0, ingressStep);
  }

  return (
    <DocumentTitle title='Getting Started'>
      <Breadcrumb
        data={{
          title: 'GETTING STARTED',
          pathname: RoutePath.createUsablePath(
            OrganizationsRoutes.Clusters.GettingStarted.Overview,
            { clusterId, orgId }
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

export default GettingStarted;
