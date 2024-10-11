import { Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import * as capvv1beta1 from 'model/services/mapi/capvv1beta1';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

const StyledLink = styled.a`
  color: ${({ theme }) => normalizeColor('text-weak', theme)};
`;

interface IClusterDetailWidgetProviderAWSProps {
  providerCluster: capvv1beta1.IVSphereCluster;
}

const ClusterDetailWidgetProviderAWS: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderAWSProps>
> = ({ providerCluster }) => {
  const vCenter = useMemo(() => {
    if (!providerCluster) return undefined;

    return providerCluster.spec?.server ?? '';
  }, [providerCluster]);

  return (
    <>
      <Text>vCenter</Text>
      <OptionalValue value={vCenter}>
        {(value) => (
          <StyledLink
            href={`https://${value}/ui`}
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
