import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import Instructions from 'Cluster/ClusterDetail/Ingress/Instructions';
import { Box, Text } from 'grommet';
import InstallIngressButton from 'MAPI/apps/InstallIngressButton';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import { hasClusterAppLabel } from 'MAPI/clusters/utils';
import { Cluster } from 'MAPI/types';
import { extractErrorMessage, fetchCluster, fetchClusterKey } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { Providers } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect, useMemo } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useLocation, useParams } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';
import useSWR, { KeyedMutator } from 'swr';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { usePermissionsForApps } from './permissions/usePermissionsForApps';
import { findIngressApp } from './utils';

const IngressWrapper = styled.div``;

const StyledLoadingIndicator = styled(LoadingIndicator)`
  display: inline-block;

  img {
    display: inline-block;
    vertical-align: middle;
    width: 20px;
  }
`;

interface IClusterDetailIngressProps
  extends React.ComponentPropsWithoutRef<'div'> {
  provider?: PropertiesOf<typeof Providers>;
  k8sEndpoint?: string;
  kvmTCPHTTPPort?: number;
  kvmTCPHTTPSPort?: number;
  mutateCluster?: KeyedMutator<capiv1beta1.ICluster>;
}

const ClusterDetailIngress: React.FC<
  React.PropsWithChildren<IClusterDetailIngressProps>
  // eslint-disable-next-line complexity
> = ({
  k8sEndpoint,
  kvmTCPHTTPPort,
  kvmTCPHTTPSPort,
  mutateCluster,
  ...rest
}) => {
  const provider = rest.provider ?? window.config.info.general.provider;
  const { pathname } = useLocation();
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const orgClient = useHttpClient();
  const orgKey = securityv1alpha1.getOrganizationKey(orgId);
  const { data: org, error: orgError } = useSWR<
    securityv1alpha1.IOrganization,
    GenericResponseError
  >(orgKey, () => securityv1alpha1.getOrganization(orgClient, auth, orgId));

  useEffect(() => {
    if (orgError) {
      ErrorReporter.getInstance().notify(orgError);

      new FlashMessage(
        'There was a problem fetching an organization resource.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(orgError)
      );
    }
  }, [orgError]);

  const namespace = org?.status?.namespace;

  const { canGet: canGetClusters } = usePermissionsForClusters(
    provider,
    namespace ?? ''
  );

  const clusterKey =
    canGetClusters && namespace
      ? fetchClusterKey(provider, namespace, clusterId)
      : null;

  const { data: cluster, error: clusterError } = useSWR<
    Cluster,
    GenericResponseError
  >(clusterKey, () =>
    fetchCluster(clientFactory, auth, provider, namespace!, clusterId)
  );

  useEffect(() => {
    if (clusterError) {
      ErrorReporter.getInstance().notify(clusterError);

      new FlashMessage(
        'There was a problem fetching a cluster resource.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(clusterError)
      );
    }
  }, [clusterError]);

  const isClusterApp = cluster ? hasClusterAppLabel(cluster) : undefined;

  const appListClient = useHttpClient();
  const appsPermissions = usePermissionsForApps(provider, clusterId);

  const appsNamespace =
    typeof isClusterApp === 'undefined'
      ? undefined
      : isClusterApp
      ? namespace
      : clusterId;

  const appListGetOptions = isClusterApp
    ? {
        namespace: appsNamespace,
        labelSelector: {
          matchingLabels: {
            [applicationv1alpha1.labelCluster]: clusterId,
          },
        },
      }
    : { namespace: appsNamespace };

  const appListKey = appsPermissions.canList
    ? applicationv1alpha1.getAppListKey(appListGetOptions)
    : null;

  const { data: appList, error: appListError } = useSWR<
    applicationv1alpha1.IAppList,
    GenericResponseError
  >(appListKey, () =>
    applicationv1alpha1.getAppList(appListClient, auth, appListGetOptions)
  );

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);
    }
  }, [appListError]);

  const hasIngress = useMemo(() => {
    const app = findIngressApp(appList?.items);

    return Boolean(app);
  }, [appList?.items]);

  const hasError =
    typeof orgError !== 'undefined' ||
    typeof clusterError !== 'undefined' ||
    typeof appListError !== 'undefined';

  const isLoadingResources =
    typeof org === 'undefined' &&
    typeof orgError === 'undefined' &&
    typeof cluster === 'undefined' &&
    typeof clusterError === 'undefined' &&
    typeof appList === 'undefined' &&
    typeof appListError === 'undefined';

  return (
    <DocumentTitle title={`Ingress | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: 'INGRESS',
          pathname,
        }}
      >
        <IngressWrapper {...rest}>
          {isLoadingResources && (
            <Box direction='row' align='center' gap='small'>
              <StyledLoadingIndicator loading={true} />
              <Text color='text-weak'>Loading ingress information…</Text>
            </Box>
          )}

          {!isLoadingResources && !hasError && (
            <Box margin={{ bottom: 'medium' }}>
              {hasIngress ? (
                <Text>
                  These details help you to set up Ingress for exposing services
                  in this cluster.
                </Text>
              ) : (
                <Text>
                  In order to expose services via Ingress, you must have{' '}
                  <code>external-dns</code> and an Ingress controller installed.
                  Giant Swarm provides the NGINX Ingress Controller as a managed
                  app.
                </Text>
              )}
            </Box>
          )}

          {hasIngress && !isLoadingResources && !hasError && (
            <Instructions
              provider={provider}
              k8sEndpoint={k8sEndpoint}
              kvmTCPHTTPPort={kvmTCPHTTPPort}
              kvmTCPHTTPSPort={kvmTCPHTTPSPort}
            />
          )}

          {!hasIngress && !isLoadingResources && !hasError && (
            <InstallIngressButton
              clusterID={clusterId}
              appsNamespace={appsNamespace!}
              isClusterApp={isClusterApp!}
              mutateCluster={mutateCluster}
            />
          )}

          {appListError && (
            <FlashMessageComponent type={FlashMessageType.Danger}>
              <Box>
                <Text weight='bold'>
                  There was a problem fetching apps installed on this cluster.
                </Text>
                <Text>{extractErrorMessage(appListError)}</Text>
              </Box>
            </FlashMessageComponent>
          )}
        </IngressWrapper>
      </Breadcrumb>
    </DocumentTitle>
  );
};

ClusterDetailIngress.defaultProps = {
  provider: Providers.AWS,
  k8sEndpoint: '',
  kvmTCPHTTPPort: 0,
  kvmTCPHTTPSPort: 0,
};

export default ClusterDetailIngress;
