import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { extractErrorMessage, getProviderClusterLocation } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
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

import { usePermissionsForOrgCredentials } from '../permissions/usePermissionsForOrgCredentials';
import { getCredentialsAccountID } from './utils';

const ValueWrapper = styled.div`
  display: inline-block;
  line-height: 1.7;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => normalizeColor('text-weak', theme)};
`;

interface IClusterDetailWidgetProviderAWSProps {
  providerCluster: infrav1alpha3.IAWSCluster;
}

const ClusterDetailWidgetProviderAWS: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderAWSProps>
> = ({ providerCluster }) => {
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

  const accountID = credentialListIsLoading
    ? undefined
    : credentials
    ? getCredentialsAccountID(credentials)
    : '';

  return (
    <>
      <Text>AWS region</Text>
      <ValueWrapper>
        <code>{getProviderClusterLocation(providerCluster)}</code>
      </ValueWrapper>

      <Text>Account ID</Text>
      <OptionalValue value={accountID}>
        {(value) => (
          <StyledLink
            href={`https://${value}.signin.aws.amazon.com/console`}
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
        )}
      </OptionalValue>
    </>
  );
};

export default ClusterDetailWidgetProviderAWS;
