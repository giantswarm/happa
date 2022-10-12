import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { extractErrorMessage, getProviderClusterLocation } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capav1beta1 from 'model/services/mapi/capav1beta1';
import { extractIDFromARN } from 'model/services/mapi/legacy/credentials';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import { usePermissionsForAWSClusterRoleIdentities } from '../permissions/usePermissionsForAWSClusterRoleIdentities';

const ValueWrapper = styled.div`
  display: inline-block;
  line-height: 1.7;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => normalizeColor('text-weak', theme)};
`;

interface IClusterDetailWidgetProviderCAPAProps {
  providerCluster: capav1beta1.IAWSCluster;
}

const ClusterDetailWidgetProviderCAPA: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderCAPAProps>
> = ({ providerCluster }) => {
  const auth = useAuthProvider();
  const httpClient = useHttpClient();

  const roleIdentityRef =
    providerCluster.spec?.identityRef?.kind === 'AWSClusterRoleIdentity'
      ? providerCluster.spec?.identityRef
      : undefined;

  const provider = window.config.info.general.provider;
  const { canGet: canGetRoleIdentity } =
    usePermissionsForAWSClusterRoleIdentities(provider, 'default');

  const roleIdentityKey =
    roleIdentityRef && canGetRoleIdentity
      ? capav1beta1.getAWSClusterRoleIdentityKey(roleIdentityRef.name)
      : undefined;

  const {
    data: roleIdentity,
    isValidating: roleIdentityIsValidating,
    error: roleIdentityError,
  } = useSWR<capav1beta1.IAWSClusterRoleIdentity, GenericResponseError>(
    roleIdentityKey,
    () =>
      capav1beta1.getAWSClusterRoleIdentity(
        httpClient,
        auth,
        roleIdentityRef!.name
      )
  );

  useEffect(() => {
    if (roleIdentityError) {
      new FlashMessage(
        `Could not fetch AWSClusterRoleIdentity resource`,
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(roleIdentityError)
      );

      ErrorReporter.getInstance().notify(roleIdentityError);
    }
  }, [roleIdentityError]);

  const roleIdentityIsLoading =
    typeof roleIdentity === 'undefined' && roleIdentityIsValidating;

  const accountID = roleIdentityIsLoading
    ? undefined
    : roleIdentity
    ? extractIDFromARN(roleIdentity.spec?.roleARN) ?? ''
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

export default ClusterDetailWidgetProviderCAPA;
