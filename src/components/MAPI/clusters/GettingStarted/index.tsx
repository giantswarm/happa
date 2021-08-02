import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { Cluster } from 'MAPI/types';
import { extractErrorMessage, fetchCluster, fetchClusterKey } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as metav1 from 'model/services/mapi/metav1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Switch, useRouteMatch } from 'react-router';
import Route from 'Route';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { getProvider } from 'stores/main/selectors';
import useSWR from 'swr';
import GettingStartedGetAccess from 'UI/Display/MAPI/clusters/GettingStarted/GettingStartedGetAccess';
import GettingStartedInstallIngress from 'UI/Display/MAPI/clusters/GettingStarted/GettingStartedInstallIngress';
import GettingStartedNavigation from 'UI/Display/MAPI/clusters/GettingStarted/GettingStartedNavigation';
import GettingStartedNextSteps from 'UI/Display/MAPI/clusters/GettingStarted/GettingStartedNextSteps';
import GettingStartedOverview from 'UI/Display/MAPI/clusters/GettingStarted/GettingStartedOverview';
import GettingStartedSimpleExample from 'UI/Display/MAPI/clusters/GettingStarted/GettingStartedSimpleExample';

import GettingStartedProvider, {
  IGettingStartedStep,
} from './GettingStartedProvider';

function computeSteps(
  organizationName: string,
  clusterName: string
): IGettingStartedStep[] {
  const pathParams = {
    orgId: organizationName,
    clusterId: clusterName,
  };

  const steps = [
    {
      title: 'Get access',
      description:
        'Enable your Kubernetes CLI to access your Kubernetes cluster at Giant Swarm',
      url: RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.GettingStarted.ConfigureKubeCtl,
        pathParams
      ),
      path: OrganizationsRoutes.Clusters.GettingStarted.ConfigureKubeCtl,
      component: GettingStartedGetAccess,
    },
    {
      title: 'Install an ingress controller',
      description: `We'll need an ingress controller before we can access any services from the browser`,
      url: RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.GettingStarted.InstallIngress,
        pathParams
      ),
      path: OrganizationsRoutes.Clusters.GettingStarted.InstallIngress,
      component: GettingStartedInstallIngress,
    },
    {
      title: 'Run a simple example',
      description: `To make sure everything works as expected, let's start a hello world application`,
      url: RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.GettingStarted.SimpleExample,
        pathParams
      ),
      path: OrganizationsRoutes.Clusters.GettingStarted.SimpleExample,
      component: GettingStartedSimpleExample,
    },
    {
      title: 'Next steps',
      description:
        'We point you to some useful next best actions, like setting up the Kubernetes dashboard',
      url: RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.GettingStarted.NextSteps,
        pathParams
      ),
      path: OrganizationsRoutes.Clusters.GettingStarted.NextSteps,
      component: GettingStartedNextSteps,
    },
  ];

  return steps;
}

interface IGettingStartedProps {}

const GettingStarted: React.FC<IGettingStartedProps> = () => {
  const dispatch = useDispatch();

  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { orgId, clusterId } = match.params;

  const provider = useSelector(getProvider);

  const clientFactory = useHttpClientFactory();
  const orgClientFactory = useHttpClientFactory();

  const auth = useAuthProvider();

  const clusterClient = useRef(clientFactory());
  const orgClient = useRef(orgClientFactory());

  const { data: org, error: orgError } = useSWR<
    securityv1alpha1.IOrganization,
    GenericResponseError
  >(securityv1alpha1.getOrganizationKey(orgId), () =>
    securityv1alpha1.getOrganization(orgClient.current, auth, orgId)
  );

  const namespace = org?.status?.namespace;

  useEffect(() => {
    if (orgError) {
      ErrorReporter.getInstance().notify(orgError);

      const errorMessage = extractErrorMessage(orgError);
      new FlashMessage(
        `There was a problem loading cluster <code>${clusterId}</code> for <code>${orgId}</code>`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      if (!namespace) {
        dispatch(push(MainRoutes.Home));
      }
    }
  }, [namespace, orgError, orgId, clusterId, dispatch]);

  const clusterKey = namespace
    ? fetchClusterKey(provider, namespace, clusterId)
    : null;

  const { data: cluster, error: clusterError } = useSWR<
    Cluster,
    GenericResponseError
  >(clusterKey, () =>
    fetchCluster(clusterClient.current, auth, provider, namespace!, clusterId)
  );

  useEffect(() => {
    if (clusterError) {
      ErrorReporter.getInstance().notify(clusterError);
    }

    if (
      metav1.isStatusError(
        clusterError?.data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      new FlashMessage(
        `Cluster <code>${clusterId}</code> not found`,
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the Cluster name is correct and that you have access to it.'
      );

      dispatch(push(MainRoutes.Home));
    } else if (clusterError) {
      const errorMessage = extractErrorMessage(clusterError);
      new FlashMessage(
        `There was a problem loading cluster <code>${clusterId}</code>`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      if (!cluster) {
        dispatch(push(MainRoutes.Home));
      }
    }
  }, [cluster, clusterError, clusterId, dispatch]);

  useEffect(() => {
    if (typeof cluster?.metadata.deletionTimestamp !== 'undefined') {
      new FlashMessage(
        `Cluster <code>${cluster.metadata.name}</code> is currently being deleted`,
        messageType.INFO,
        messageTTL.MEDIUM
      );

      dispatch(push(MainRoutes.Home));
    }
  }, [cluster, dispatch]);

  const homePath = useMemo(
    () =>
      RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.GettingStarted.Overview,
        { orgId, clusterId }
      ),
    [clusterId, orgId]
  );

  const steps = useMemo(() => computeSteps(orgId, clusterId), [
    orgId,
    clusterId,
  ]);

  return (
    <DocumentTitle title={`Getting Started | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: 'GETTING STARTED',
          pathname: match.url,
        }}
      >
        <GettingStartedProvider steps={steps} homePath={homePath}>
          <Box width={{ max: 'xlarge' }} margin='auto'>
            <Switch>
              <Route
                component={GettingStartedOverview}
                exact={true}
                path={OrganizationsRoutes.Clusters.GettingStarted.Overview}
              />

              {steps.map((step) => (
                <Route
                  key={step.path}
                  component={step.component}
                  path={step.path}
                  exact={true}
                />
              ))}

              <Redirect
                to={OrganizationsRoutes.Clusters.GettingStarted.Overview}
              />
            </Switch>
          </Box>
          <GettingStartedNavigation />
        </GettingStartedProvider>
      </Breadcrumb>
    </DocumentTitle>
  );
};

GettingStarted.propTypes = {};

export default GettingStarted;
