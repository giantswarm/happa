import { Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { getProviderClusterLocation } from 'MAPI/utils';
import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import React from 'react';
import styled from 'styled-components';

const ValueWrapper = styled.div`
  display: inline-block;
  line-height: 1.7;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => normalizeColor('text-weak', theme)};
`;

interface IClusterDetailWidgetProviderCAPGProps {
  providerCluster: capgv1beta1.IGCPCluster;
}

const ClusterDetailWidgetProviderCAPG: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderCAPGProps>
> = ({ providerCluster }) => {
  const projectID = providerCluster.spec?.project ?? '';

  return (
    <>
      <Text>GCP region</Text>
      <ValueWrapper>
        <code>{getProviderClusterLocation(providerCluster)}</code>
      </ValueWrapper>

      <Text>Project ID</Text>
      <StyledLink
        href={`https://console.cloud.google.com/home/dashboard?project=${projectID}`}
        rel='noopener noreferrer'
        target='_blank'
      >
        <code>{projectID}</code>
        <i
          className='fa fa-open-in-new'
          aria-hidden={true}
          role='presentation'
        />
      </StyledLink>
    </>
  );
};

export default ClusterDetailWidgetProviderCAPG;
