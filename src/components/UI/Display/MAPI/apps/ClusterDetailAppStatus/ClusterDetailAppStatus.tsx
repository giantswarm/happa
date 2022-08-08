import { Box, Text } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import styled from 'styled-components';

const Title = styled(Text)`
  &::first-letter {
    text-transform: uppercase;
  }
`;

function getStatusColor(status: string) {
  switch (status) {
    case applicationv1alpha1.statusUnknown:
    case applicationv1alpha1.statusUninstalled:
      return { background: 'status-unknown', text: 'text-accent' };

    case applicationv1alpha1.statusDeployed:
      return { background: 'status-ok', text: 'text-strong' };

    case applicationv1alpha1.statusSuperseded:
    case applicationv1alpha1.statusUninstalling:
    case applicationv1alpha1.statusPendingInstall:
    case applicationv1alpha1.statusPendingUpgrade:
    case applicationv1alpha1.statusPendingRollback:
      return { background: 'status-warning', text: 'text-accent' };

    default:
      return { background: 'status-danger', text: 'text-strong' };
  }
}

function formatStatus(status: string) {
  return status.replace(/-/g, ' ');
}

interface IClusterDetailAppStatusProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  status: string;
}

const ClusterDetailAppStatus: React.FC<IClusterDetailAppStatusProps> = ({
  status,
}) => {
  const color = getStatusColor(status);
  const title = formatStatus(status);

  return (
    <Box
      background={color.background}
      round='xxsmall'
      pad={{ vertical: 'xxsmall', horizontal: 'small' }}
    >
      <Title color={color.text} aria-label={`App status: ${title}`}>
        {title}
      </Title>
    </Box>
  );
};

export default ClusterDetailAppStatus;
