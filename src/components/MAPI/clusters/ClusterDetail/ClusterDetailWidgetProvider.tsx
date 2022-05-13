import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { ProviderCluster } from 'MAPI/types';
import {
  extractErrorMessage,
  getProviderClusterAccountID,
  getProviderClusterLocation,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { Providers } from 'model/constants';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import styled from 'styled-components';
import useSWR from 'swr';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import { usePermissionsForOrgCredentials } from '../permissions/usePermissionsForOrgCredentials';
import { getCredentialsAccountID, getCredentialsAzureTenantID } from './utils';

export function getClusterRegionLabel(cluster?: capiv1beta1.ICluster) {
  if (!cluster) return undefined;

  switch (cluster.spec?.infrastructureRef?.kind) {
    case capzv1beta1.AzureCluster:
      return 'Azure region';

    case infrav1alpha3.AWSCluster:
      return 'AWS region';

    default:
      return '';
  }
}

export function getClusterAccountIDLabel(cluster?: capiv1beta1.ICluster) {
  if (!cluster) return undefined;

  switch (cluster.spec?.infrastructureRef?.kind) {
    case capzv1beta1.AzureCluster:
      return 'Subscription ID';

    case infrav1alpha3.AWSCluster:
      return 'Account ID';

    default:
      return '';
  }
}

export function getClusterAccountIDPath(
  cluster?: capiv1beta1.ICluster,
  accountID?: string
) {
  if (!cluster || !accountID) return undefined;

  switch (cluster.spec?.infrastructureRef?.kind) {
    case infrav1alpha3.AWSCluster:
      return `https://${accountID}.signin.aws.amazon.com/console`;

    default:
      return '';
  }
}

const GROUP_LABEL_SIZE = {
  small: 90,
  medium: 115,
};

interface IGroupLabelProps {
  size: 'small' | 'medium';
}

const GroupLabel = styled.div<IGroupLabelProps>`
  min-width: ${({ size }) => GROUP_LABEL_SIZE[size]}px;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => theme.global.colors['text-weak'].dark};
`;

interface IClusterDetailWidgetProviderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1beta1.ICluster;
  providerCluster?: ProviderCluster;
}

const ClusterDetailWidgetProvider: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderProps>
> = ({ cluster, providerCluster, ...props }) => {
  const { orgId } = useParams<{ clusterId: string; orgId: string }>();
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const selectedOrgID = selectedOrg?.name ?? selectedOrg?.id;

  const credentialListClient = useHttpClient();
  const auth = useAuthProvider();

  const provider = window.config.info.general.provider;

  const { canList } = usePermissionsForOrgCredentials(
    provider,
    selectedOrg?.namespace ?? ''
  );

  const credentialListKey =
    cluster && canList && selectedOrgID
      ? legacyCredentials.getCredentialListKey(selectedOrgID)
      : null;

  const { data: credentialList, error: credentialListError } = useSWR<
    legacyCredentials.ICredentialList,
    GenericResponseError
  >(credentialListKey, () =>
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

  const accountID = credentialListKey
    ? getCredentialsAccountID(credentialList?.items)
    : getProviderClusterAccountID(providerCluster);
  const accountIDPath = getClusterAccountIDPath(cluster, accountID);

  const azureTenantID = credentialListKey
    ? getCredentialsAzureTenantID(credentialList?.items)
    : providerCluster
    ? ''
    : undefined;

  const region = getProviderClusterLocation(providerCluster);

  return (
    <ClusterDetailWidget title='Provider' inline={true} {...props}>
      <Box direction='row' align='center' data-testid='provider-group'>
        <GroupLabel size={provider === Providers.AWS ? 'small' : 'medium'}>
          <OptionalValue
            loaderWidth={85}
            value={getClusterRegionLabel(cluster)}
          >
            {(value) => <Text>{value}</Text>}
          </OptionalValue>
        </GroupLabel>
        <OptionalValue value={region}>
          {(value) => (
            <Text>
              <code>{value}</code>
            </Text>
          )}
        </OptionalValue>
      </Box>
      <Box direction='row' align='center' data-testid='provider-group'>
        <GroupLabel size={provider === Providers.AWS ? 'small' : 'medium'}>
          <OptionalValue
            loaderWidth={85}
            value={getClusterAccountIDLabel(cluster)}
          >
            {(value) => <Text>{value}</Text>}
          </OptionalValue>
        </GroupLabel>
        <OptionalValue value={accountID} loaderWidth={200}>
          {(value) =>
            accountIDPath === '' ? (
              <code>{value}</code>
            ) : (
              <StyledLink
                color='text-weak'
                href={accountIDPath}
                rel='noopener noreferrer'
                target='_blank'
              >
                <code>{value}</code>
                <i
                  className='fa fa-open-in-new'
                  aria-hidden={true}
                  role='presentation'
                />
              </StyledLink>
            )
          }
        </OptionalValue>
      </Box>
      {provider === Providers.AZURE && (
        <Box direction='row' align='center' data-testid='provider-group'>
          <GroupLabel size='medium'>
            <OptionalValue
              loaderWidth={85}
              value={azureTenantID !== undefined ? 'Tenant ID' : undefined}
            >
              {(value) => <Text>{value}</Text>}
            </OptionalValue>
          </GroupLabel>
          <OptionalValue value={azureTenantID} loaderWidth={250}>
            {(value) => <code>{value}</code>}
          </OptionalValue>
        </Box>
      )}
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetProvider;
