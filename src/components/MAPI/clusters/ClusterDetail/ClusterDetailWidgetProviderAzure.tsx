import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Text } from 'grommet';
import { extractErrorMessage, getProviderClusterLocation } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import styled from 'styled-components';
import useSWR from 'swr';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import { usePermissionsForProviderCredentials } from '../permissions/usePermissionsForProviderCredentials';
import { getCredentialsAccountID, getCredentialsAzureTenantID } from './utils';

const ValueWrapper = styled.div`
  display: inline-block;
  line-height: 1.7;
`;

interface IClusterDetailWidgetProviderAzureProps {
  providerCluster: capzv1beta1.IAzureCluster;
}

const ClusterDetailWidgetProviderAzure: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderAzureProps>
> = ({ providerCluster }) => {
  const { orgId } = useParams<{ clusterId: string; orgId: string }>();
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const selectedOrgID = selectedOrg?.name ?? selectedOrg?.id;

  const credentialListClient = useHttpClient();
  const auth = useAuthProvider();

  const provider = window.config.info.general.provider;

  const { canList } = usePermissionsForProviderCredentials(
    provider,
    selectedOrg?.namespace ?? ''
  );

  const credentialListKey =
    canList && selectedOrgID
      ? legacyCredentials.getCredentialListKey(selectedOrgID)
      : undefined;

  const {
    data: credentialList,
    error: credentialListError,
    isLoading: credentialListIsLoading,
  } = useSWR<legacyCredentials.ICredentialList, GenericResponseError>(
    credentialListKey,
    () =>
      legacyCredentials.getCredentialList(
        credentialListClient,
        auth,
        selectedOrgID!
      )
  );

  useEffect(() => {
    if (credentialListError) {
      new FlashMessage(
        `Could not fetch provider-specific credentials for organization ${orgId}`,
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(credentialListError)
      );

      ErrorReporter.getInstance().notify(credentialListError);
    }
  }, [credentialListError, orgId]);

  const credentials = credentialListIsLoading
    ? undefined
    : credentialList?.items;

  const subscriptionID = credentialListIsLoading
    ? undefined
    : credentials
    ? getCredentialsAccountID(credentials)
    : providerCluster.spec?.subscriptionID ?? '';
  const tenantID = credentials ? getCredentialsAzureTenantID(credentials) : '';

  return (
    <>
      <Text>Azure region</Text>
      <ValueWrapper>
        <code>{getProviderClusterLocation(providerCluster)}</code>
      </ValueWrapper>

      <Text>Subscription ID</Text>
      <OptionalValue value={subscriptionID} loaderWidth={250}>
        {(value) => <code>{value}</code>}
      </OptionalValue>

      <Text>Tenant ID</Text>
      <OptionalValue value={tenantID} loaderWidth={250}>
        {(value) => <code>{value}</code>}
      </OptionalValue>
    </>
  );
};

export default ClusterDetailWidgetProviderAzure;
