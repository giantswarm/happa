import { Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { getControlPlaneNodeLocation } from 'MAPI/utils';
import * as capav1beta2 from 'model/services/mapi/capav1beta2';
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

interface IClusterDetailWidgetProviderAWSManagedProps {
  controlPlaneNode: capav1beta2.IAWSManagedControlPlane;
  providerCredential?: capav1beta2.IAWSClusterRoleIdentity;
}

const ClusterDetailWidgetProviderAWSManaged: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderAWSManagedProps>
> = ({ controlPlaneNode, providerCredential }) => {
  return (
    <>
      <Text>AWS region</Text>
      <ValueWrapper>
        <code>{getControlPlaneNodeLocation(controlPlaneNode)}</code>
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

export default ClusterDetailWidgetProviderAWSManaged;
