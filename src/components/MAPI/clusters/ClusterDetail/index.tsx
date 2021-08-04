import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import ClusterDetailApps from 'MAPI/apps/ClusterDetailApps';
import ClusterDetailIngress from 'MAPI/apps/ClusterDetailIngress';
import ClusterDetailKeyPairs from 'MAPI/keypairs/ClusterDetailKeyPairs';
import { extractErrorMessage } from 'MAPI/utils';
import ClusterDetailWorkerNodes from 'MAPI/workernodes/ClusterDetailWorkerNodes';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { Tab } from 'react-bootstrap';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, useRouteMatch } from 'react-router';
import Route from 'Route';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import Tabs from 'shared/Tabs';
import { getProvider } from 'stores/main/selectors';
import styled from 'styled-components';
import useSWR from 'swr';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';
import ViewAndEditName from 'UI/Inputs/ViewEditName';

import ClusterDetailOverview from './ClusterDetailOverview';
import { updateClusterDescription } from './utils';

function computePaths(orgName: string, clusterName: string) {
  return {
    Home: RoutePath.createUsablePath(OrganizationsRoutes.Clusters.Detail.Home, {
      orgId: orgName,
      clusterId: clusterName,
    }),
    Apps: RoutePath.createUsablePath(OrganizationsRoutes.Clusters.Detail.Apps, {
      orgId: orgName,
      clusterId: clusterName,
    }),
    Ingress: RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Ingress,
      {
        orgId: orgName,
        clusterId: clusterName,
      }
    ),
    KeyPairs: RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.KeyPairs,
      {
        orgId: orgName,
        clusterId: clusterName,
      }
    ),
    WorkerNodes: RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.WorkerNodes,
      {
        orgId: orgName,
        clusterId: clusterName,
      }
    ),
  };
}

const StyledViewAndEditName = styled(ViewAndEditName)`
  input {
    font-size: 100%;
  }
`;

const ClusterDetail: React.FC<{}> = () => {
  const dispatch = useDispatch();

  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { orgId, clusterId } = match.params;

  const paths = useMemo(() => computePaths(orgId, clusterId), [
    orgId,
    clusterId,
  ]);

  const clientFactory = useHttpClientFactory();

  const auth = useAuthProvider();

  const clusterClient = useRef(clientFactory());
  const orgClient = useRef(clientFactory());

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
    ? capiv1alpha3.getClusterKey(namespace, clusterId)
    : null;

  const { data: cluster, error: clusterError, mutate: mutateCluster } = useSWR<
    capiv1alpha3.ICluster,
    GenericResponseError
  >(clusterKey, () =>
    capiv1alpha3.getCluster(clusterClient.current, auth, namespace!, clusterId)
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
        'Please make sure the Cluster ID is correct and that you have access to it.'
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

  const clusterDescription = cluster
    ? capiv1alpha3.getClusterDescription(cluster)
    : undefined;
  const clusterReleaseVersion = cluster
    ? capiv1alpha3.getReleaseVersion(cluster)
    : undefined;
  const clusterK8sApiURL = cluster
    ? capiv1alpha3.getKubernetesAPIEndpointURL(cluster)
    : undefined;

  const updateDescription = async (newValue: string) => {
    if (!cluster) return;

    try {
      const updatedCluster = await updateClusterDescription(
        clientFactory(),
        auth,
        cluster.metadata.namespace!,
        cluster.metadata.name,
        newValue
      );

      mutateCluster(updatedCluster);

      new FlashMessage(
        `Successfully updated the cluster's description`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `There was a problem updating the cluster's description`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  };

  const provider = useSelector(getProvider);

  return (
    <DocumentTitle title={`Cluster Details | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: clusterId,
          pathname: match.url,
        }}
      >
        <Box>
          <Heading level={1} margin={{ bottom: 'large' }}>
            <Box direction='row' align='center'>
              <ClusterIDLabel
                clusterID={clusterId}
                copyEnabled={true}
                variant={ClusterIDLabelType.Name}
              />{' '}
              <ClusterDetailWidgetOptionalValue
                value={clusterDescription}
                loaderHeight={35}
                loaderWidth={300}
              >
                {(value) => (
                  <StyledViewAndEditName
                    value={value as string}
                    typeLabel='cluster'
                    onSave={updateDescription}
                    aria-label={value as string}
                  />
                )}
              </ClusterDetailWidgetOptionalValue>
            </Box>
          </Heading>
          <Tabs defaultActiveKey={paths.Home} useRoutes={true}>
            <Tab eventKey={paths.Home} title='Overview' />
            <Tab eventKey={paths.WorkerNodes} title='Worker nodes' />
            <Tab eventKey={paths.KeyPairs} title='Key pairs' />
            <Tab eventKey={paths.Apps} title='Apps' />
            <Tab eventKey={paths.Ingress} title='Ingress' />
          </Tabs>
          <Switch>
            <Route
              path={OrganizationsRoutes.Clusters.Detail.WorkerNodes}
              component={ClusterDetailWorkerNodes}
            />
            <Route
              path={OrganizationsRoutes.Clusters.Detail.Apps}
              render={() =>
                cluster && (
                  <ClusterDetailApps releaseVersion={clusterReleaseVersion!} />
                )
              }
            />
            <Route
              path={OrganizationsRoutes.Clusters.Detail.KeyPairs}
              component={ClusterDetailKeyPairs}
            />
            <Route
              path={OrganizationsRoutes.Clusters.Detail.Ingress}
              render={() =>
                cluster && (
                  <ClusterDetailIngress
                    provider={provider}
                    k8sEndpoint={clusterK8sApiURL}
                  />
                )
              }
            />
            <Route
              path={OrganizationsRoutes.Clusters.Detail.Home}
              component={ClusterDetailOverview}
            />
          </Switch>
        </Box>
      </Breadcrumb>
    </DocumentTitle>
  );
};

ClusterDetail.propTypes = {};

export default ClusterDetail;
