import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import Instructions from 'Cluster/ClusterDetail/Ingress/Instructions';
import { Box, Text } from 'grommet';
import InstallIngressButton from 'MAPI/apps/InstallIngressButton';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { Providers } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React, { useEffect, useMemo } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useLocation, useParams } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';
import useSWR, { KeyedMutator } from 'swr';
import FlashMessage from 'UI/Display/FlashMessage';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClient } from 'utils/hooks/useHttpClient';

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
  mutateCluster?: KeyedMutator<capiv1alpha3.ICluster>;
}

const ClusterDetailIngress: React.FC<IClusterDetailIngressProps> = ({
  provider,
  k8sEndpoint,
  kvmTCPHTTPPort,
  kvmTCPHTTPSPort,
  mutateCluster,
  ...rest
}) => {
  const { pathname } = useLocation();
  const { clusterId } = useParams<{ clusterId: string }>();

  const auth = useAuthProvider();

  const appListClient = useHttpClient();
  const appsPermissions = usePermissionsForApps(
    provider ?? window.config.info.general.provider,
    clusterId
  );
  const appListGetOptions = { namespace: clusterId };

  const appListKey = appsPermissions.canList
    ? applicationv1alpha1.getAppListKey(appListGetOptions)
    : null;

  const {
    data: appList,
    error: appListError,
    isValidating: appListIsValidating,
  } = useSWR<applicationv1alpha1.IAppList, GenericResponseError>(
    appListKey,
    () => applicationv1alpha1.getAppList(appListClient, auth, appListGetOptions)
  );
  const appListIsLoading =
    typeof appsPermissions.canList === 'undefined' ||
    (typeof appList === 'undefined' && appListIsValidating && !appListError);

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);
    }
  }, [appListError]);

  const hasIngress = useMemo(() => {
    const app = findIngressApp(appList?.items);

    return Boolean(app);
  }, [appList?.items]);

  return (
    <DocumentTitle title={`Ingress | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: 'INGRESS',
          pathname,
        }}
      >
        <IngressWrapper {...rest}>
          {appListIsLoading && (
            <Box direction='row' align='center' gap='small'>
              <StyledLoadingIndicator loading={true} />
              <Text color='text-weak'>Loading ingress information…</Text>
            </Box>
          )}

          {!appListIsLoading && !appListError && (
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

          {hasIngress && !appListIsLoading && !appListError && (
            <Instructions
              provider={provider}
              k8sEndpoint={k8sEndpoint}
              kvmTCPHTTPPort={kvmTCPHTTPPort}
              kvmTCPHTTPSPort={kvmTCPHTTPSPort}
            />
          )}

          {!hasIngress && !appListIsLoading && !appListError && (
            <InstallIngressButton
              clusterID={clusterId}
              mutateCluster={mutateCluster}
            />
          )}

          {appListError && (
            <FlashMessage type={FlashMessageType.Danger}>
              <Box>
                <Text weight='bold'>
                  There was a problem fetching apps in the cluster&apos;s
                  namespace.
                </Text>
                <Text>{extractErrorMessage(appListError)}</Text>
              </Box>
            </FlashMessage>
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
