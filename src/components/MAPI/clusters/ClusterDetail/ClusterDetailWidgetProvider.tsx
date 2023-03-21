import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Grid } from 'grommet';
import { Cluster, ProviderCluster, ProviderCredential } from 'MAPI/types';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capav1beta1 from 'model/services/mapi/capav1beta1';
import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import useSWR from 'swr';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { usePermissionsForProviderCredentials } from '../permissions/usePermissionsForProviderCredentials';
import ClusterDetailWidgetProviderAWS from './ClusterDetailWidgetProviderAWS';
import ClusterDetailWidgetProviderAzure from './ClusterDetailWidgetProviderAzure';
import ClusterDetailWidgetProviderCAPG from './ClusterDetailWidgetProviderCAPG';
import ClusterDetailWidgetProviderLoader from './ClusterDetailWidgetProviderLoader';
import { fetchProviderCredential, fetchProviderCredentialKey } from './utils';

interface IClusterDetailWidgetProviderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: Cluster;
  providerCluster?: ProviderCluster;
}

const ClusterDetailWidgetProvider: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderProps>
> = ({ cluster, providerCluster, ...props }) => {
  const { orgId } = useParams<{ clusterId: string; orgId: string }>();
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const selectedOrgID = selectedOrg?.name ?? selectedOrg?.id;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const provider = window.config.info.general.provider;

  const { canList, canGet } = usePermissionsForProviderCredentials(
    provider,
    selectedOrg?.namespace ?? ''
  );

  const providerCredentialKey =
    canList && canGet
      ? fetchProviderCredentialKey(cluster, providerCluster, selectedOrgID)
      : undefined;

  const {
    data: providerCredential,
    error: providerCredentialError,
    isLoading: providerCredentialIsLoading,
  } = useSWR<ProviderCredential, GenericResponseError>(
    providerCredentialKey,
    () =>
      fetchProviderCredential(
        clientFactory,
        auth,
        cluster!,
        providerCluster,
        selectedOrgID!
      )
  );

  useEffect(() => {
    if (providerCredentialError) {
      new FlashMessage(
        `Could not fetch provider-specific credentials`,
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(providerCredentialError)
      );

      ErrorReporter.getInstance().notify(providerCredentialError);
    }
  }, [providerCredentialError, orgId]);

  const infrastructureRef = cluster?.spec?.infrastructureRef;
  const { kind } = infrastructureRef || {};

  const isLoading =
    cluster === undefined ||
    providerCluster === undefined ||
    providerCredentialIsLoading;

  return (
    <ClusterDetailWidget title='Provider' inline={true} {...props}>
      <Grid
        columns={['auto', 'flex']}
        gap={{ column: 'small' }}
        align='baseline'
        data-testid='provider-info'
      >
        {isLoading ? (
          <ClusterDetailWidgetProviderLoader />
        ) : kind === capav1beta1.AWSCluster ? (
          <ClusterDetailWidgetProviderAWS
            providerCluster={providerCluster as capav1beta1.IAWSCluster}
            providerCredential={
              providerCredential as capav1beta1.IAWSClusterRoleIdentity
            }
          />
        ) : kind === capgv1beta1.GCPCluster ? (
          <ClusterDetailWidgetProviderCAPG
            providerCluster={providerCluster as capgv1beta1.IGCPCluster}
          />
        ) : kind === capzv1beta1.AzureCluster ? (
          <ClusterDetailWidgetProviderAzure
            providerCluster={providerCluster as capzv1beta1.IAzureCluster}
            providerCredential={
              providerCredential as
                | capzv1beta1.IAzureClusterIdentity
                | legacyCredentials.ICredential
            }
          />
        ) : null}
      </Grid>
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetProvider;
