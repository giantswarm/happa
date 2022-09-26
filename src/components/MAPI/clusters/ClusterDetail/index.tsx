import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading } from 'grommet';
import ClusterDetailApps from 'MAPI/apps/ClusterDetailApps';
import ClusterDetailIngress from 'MAPI/apps/ClusterDetailIngress';
import ClusterDetailKeyPairs from 'MAPI/keypairs/ClusterDetailKeyPairs';
import { usePermissionsForReleases } from 'MAPI/releases/permissions/usePermissionsForReleases';
import { getPreviewReleaseVersions } from 'MAPI/releases/utils';
import { Cluster, ProviderCluster } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchCluster,
  fetchClusterKey,
  fetchProviderClusterForCluster,
  fetchProviderClusterForClusterKey,
  getClusterDescription,
  isGitOpsManaged,
  supportsReleases,
} from 'MAPI/utils';
import ClusterDetailWorkerNodes from 'MAPI/workernodes/ClusterDetailWorkerNodes';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { MainRoutes, OrganizationsRoutes } from 'model/constants/routes';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as metav1 from 'model/services/mapi/metav1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch } from 'react-redux';
import { Switch, useRouteMatch } from 'react-router';
import Route from 'Route';
import DocumentTitle from 'shared/DocumentTitle';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';
import useSWR from 'swr';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import GitOpsManagedNote from 'UI/Display/MAPI/GitOpsManaged/GitOpsManagedNote';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { Tab, Tabs } from 'UI/Display/Tabs';
import ViewAndEditName, {
  ViewAndEditNameVariant,
} from 'UI/Inputs/ViewEditName';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';

import ClusterStatusComponent from '../ClusterStatus/ClusterStatus';
import { useClusterStatus } from '../hooks/useClusterStatus';
import { usePermissionsForClusters } from '../permissions/usePermissionsForClusters';
import { ClusterStatus, hasClusterAppLabel } from '../utils';
import ClusterDetailActions from './ClusterDetailActions';
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
    ClientCertificates: RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.ClientCertificates,
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
    Actions: RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Actions,
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

const StyledFlashMessage = styled(FlashMessageComponent)`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacingPx * 5}px;
`;

const ClusterDetail: React.FC<React.PropsWithChildren<{}>> = () => {
  const dispatch = useDispatch();

  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { orgId, clusterId } = match.params;

  const paths = useMemo(
    () => computePaths(orgId, clusterId),
    [orgId, clusterId]
  );

  const clientFactory = useHttpClientFactory();

  const auth = useAuthProvider();

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
        (
          <>
            There was a problem loading cluster <code>{clusterId}</code> for{' '}
            <code>{orgId}</code>
          </>
        ),
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      if (!namespace) {
        dispatch(push(MainRoutes.Home));
      }
    }
  }, [namespace, orgError, orgId, clusterId, dispatch]);

  const provider = window.config.info.general.provider;

  const { canGet: canGetCluster, canUpdate: canUpdateCluster } =
    usePermissionsForClusters(provider, namespace ?? '');

  const clusterKey =
    canGetCluster && namespace
      ? fetchClusterKey(provider, namespace, clusterId)
      : null;

  const {
    data: cluster,
    error: clusterError,
    mutate: mutateCluster,
  } = useSWR<Cluster, GenericResponseError>(clusterKey, () =>
    fetchCluster(clientFactory, auth, provider, namespace!, clusterId)
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
        (
          <>
            Cluster <code>{clusterId}</code> not found
          </>
        ),
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the Cluster ID is correct and that you have access to it.'
      );

      dispatch(push(MainRoutes.Home));
    } else if (clusterError) {
      const errorMessage = extractErrorMessage(clusterError);
      new FlashMessage(
        (
          <>
            There was a problem loading cluster <code>{clusterId}</code>
          </>
        ),
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
        (
          <>
            Cluster <code>{cluster.metadata.name}</code> is currently being
            deleted
          </>
        ),
        messageType.INFO,
        messageTTL.MEDIUM
      );

      dispatch(push(MainRoutes.Home));
    }
  }, [cluster, dispatch]);

  // TODO: remove once preview releases are supported
  const releaseListClient = useRef(clientFactory());

  const { canList: canListReleases } = usePermissionsForReleases(
    provider,
    'default'
  );
  const isReleasesSupportedByProvider = supportsReleases(provider);

  const releaseListKey =
    canListReleases && isReleasesSupportedByProvider
      ? releasev1alpha1.getReleaseListKey()
      : null;

  const { data: releaseList, error: releaseListError } = useSWR<
    releasev1alpha1.IReleaseList,
    GenericResponseError
  >(releaseListKey, () =>
    releasev1alpha1.getReleaseList(releaseListClient.current, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  const isPreviewRelease = useMemo(() => {
    if (!cluster || !releaseList?.items) return undefined;

    const releaseVersion = capiv1beta1.getReleaseVersion(cluster);
    const previewReleaseVersions = getPreviewReleaseVersions(
      releaseList?.items
    );

    return previewReleaseVersions.some(
      (version) => version === `v${releaseVersion}`
    );
  }, [cluster, releaseList?.items]);

  // Redirect to home page if the cluster uses a preview release
  useEffect(() => {
    if (cluster && isPreviewRelease) {
      new FlashMessage(
        (
          <>
            Cluster <code>{cluster.metadata.name}</code> uses a preview release.
            Cluster details are not available at this time.
          </>
        ),
        messageType.INFO,
        messageTTL.LONG
      );

      dispatch(push(MainRoutes.Home));
    }
  }, [cluster, dispatch, isPreviewRelease]);

  const providerClusterKey = cluster
    ? fetchProviderClusterForClusterKey(cluster)
    : null;

  const {
    data: providerCluster,
    error: providerClusterError,
    isValidating: providerClusterIsValidating,
  } = useSWR<ProviderCluster, GenericResponseError>(providerClusterKey, () =>
    fetchProviderClusterForCluster(clientFactory, auth, cluster!)
  );

  useEffect(() => {
    if (providerClusterError) {
      ErrorReporter.getInstance().notify(providerClusterError);
    }
  }, [providerClusterError]);

  const providerClusterIsLoading =
    typeof providerCluster === 'undefined' &&
    typeof providerClusterError === 'undefined' &&
    providerClusterIsValidating;

  const clusterDescription = useMemo(() => {
    if (!cluster || providerClusterIsLoading) return undefined;

    return getClusterDescription(cluster, providerCluster);
  }, [cluster, providerCluster, providerClusterIsLoading]);
  const isClusterApp = cluster ? hasClusterAppLabel(cluster) : undefined;
  const clusterVersion = useMemo(() => {
    if (!cluster) return undefined;

    return isClusterApp
      ? capiv1beta1.getClusterAppVersion(cluster)
      : capiv1beta1.getReleaseVersion(cluster);
  }, [cluster, isClusterApp]);

  const clusterK8sApiURL = cluster
    ? capiv1beta1.getKubernetesAPIEndpointURL(cluster)
    : undefined;

  const { status: clusterStatus, clusterUpdateSchedule } = useClusterStatus(
    cluster,
    providerCluster,
    releaseList?.items
  );

  const updateDescription = async (newValue: string) => {
    if (!cluster) return;

    try {
      const updatedCluster = await updateClusterDescription(
        clientFactory,
        auth,
        provider,
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

      ErrorReporter.getInstance().notify(err as Error);
    }
  };

  const isReadOnly = useMemo(() => {
    if (!cluster) return true;

    return hasClusterAppLabel(cluster);
  }, [cluster]);

  return (
    <DocumentTitle title={`Cluster Details | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: clusterId,
          pathname: match.url,
        }}
      >
        <Box>
          <Heading level={1} margin={{ bottom: 'medium' }}>
            <Box direction='row' align='center'>
              <ClusterIDLabel
                clusterID={clusterId}
                copyEnabled={true}
                variant={ClusterIDLabelType.Name}
              />{' '}
              <OptionalValue
                value={clusterDescription}
                loaderHeight={35}
                loaderWidth={300}
              >
                {(value) => (
                  <StyledViewAndEditName
                    value={value}
                    typeLabel='cluster'
                    onSave={updateDescription}
                    aria-label={value}
                    variant={ViewAndEditNameVariant.Description}
                    readOnly={isReadOnly}
                    unauthorized={!canUpdateCluster}
                  />
                )}
              </OptionalValue>
            </Box>
          </Heading>
          {cluster && isGitOpsManaged(cluster) && (
            <GitOpsManagedNote margin={{ bottom: 'medium' }} />
          )}
          {clusterStatus === ClusterStatus.CreationInProgress && (
            <StyledFlashMessage
              type={FlashMessageType.Info}
              data-testid='cluster-status'
            >
              <ClusterStatusComponent
                status={clusterStatus}
                clusterUpdateSchedule={clusterUpdateSchedule}
                inheritColor={true}
                showFullMessage={true}
              />
            </StyledFlashMessage>
          )}
          <Tabs useRoutes={true} margin={{ top: 'medium' }}>
            <Tab path={paths.Home} title='Overview' />
            <Tab path={paths.WorkerNodes} title='Worker nodes' />
            <Tab path={paths.ClientCertificates} title='Client certificates' />
            <Tab path={paths.Apps} title='Apps' />
            <Tab path={paths.Ingress} title='Ingress' />
            {!isReadOnly && <Tab path={paths.Actions} title='Actions' />}
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
                  <ClusterDetailApps
                    clusterVersion={clusterVersion}
                    isClusterApp={isClusterApp}
                    isClusterCreating={
                      clusterStatus === ClusterStatus.CreationInProgress
                    }
                  />
                )
              }
            />
            <Route
              path={OrganizationsRoutes.Clusters.Detail.ClientCertificates}
              component={ClusterDetailKeyPairs}
            />
            <Route
              path={OrganizationsRoutes.Clusters.Detail.Ingress}
              render={() =>
                cluster && (
                  <ClusterDetailIngress
                    provider={provider}
                    isClusterApp={isClusterApp}
                    k8sEndpoint={clusterK8sApiURL}
                    mutateCluster={mutateCluster}
                  />
                )
              }
            />
            {!isReadOnly && (
              <Route
                path={OrganizationsRoutes.Clusters.Detail.Actions}
                component={ClusterDetailActions}
              />
            )}
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

export default ClusterDetail;
