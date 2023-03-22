import { Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { getProviderClusterLocation } from 'MAPI/utils';
import * as capav1beta1 from 'model/services/mapi/capav1beta1';
import * as infrav1alpha2 from 'model/services/mapi/infrastructurev1alpha2';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import React from 'react';
import styled from 'styled-components';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

import { getAWSCredentialAccountID } from './utils';

const ValueWrapper = styled.div`
  display: inline-block;
  line-height: 1.7;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => normalizeColor('text-weak', theme)};
`;

interface IClusterDetailWidgetProviderAWSProps {
  providerCluster:
    | capav1beta1.IAWSCluster
    | infrav1alpha2.IAWSCluster
    | infrav1alpha3.IAWSCluster;
  providerCredential?:
    | capav1beta1.IAWSClusterRoleIdentity
    | legacyCredentials.ICredential;
}

const ClusterDetailWidgetProviderAWS: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderAWSProps>
> = ({ providerCluster, providerCredential }) => {
  return (
    <>
      <Text>AWS region</Text>
      <ValueWrapper>
        <code>{getProviderClusterLocation(providerCluster)}</code>
      </ValueWrapper>

      <Text>Account ID</Text>
      <OptionalValue value={getAWSCredentialAccountID(providerCredential)}>
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
