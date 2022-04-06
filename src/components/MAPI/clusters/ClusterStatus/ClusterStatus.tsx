import { Box, Text } from 'grommet';
import React from 'react';
import { useTheme } from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import { formatDate } from 'utils/helpers';

import {
  ClusterStatus as ClusterStatusType,
  IClusterUpdateSchedule,
} from '../utils';

interface IClusterStatusProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  status: ClusterStatusType;
  clusterUpdateSchedule?: IClusterUpdateSchedule;
  inheritColor?: boolean;
}

const ClusterStatus: React.FC<IClusterStatusProps> = ({
  status,
  clusterUpdateSchedule,
  inheritColor,
  ...props
}) => {
  const theme = useTheme();

  let color = theme.colors.yellow1;
  let iconClassName = '';
  let message = '';
  let tooltip = '';

  switch (status) {
    case ClusterStatusType.CreationInProgress:
      color = theme.colors.gray;
      iconClassName = 'fa fa-change-in-progress';
      message = 'Cluster creating…';
      tooltip =
        'The cluster is currently creating. This step usually takes about 15 minutes.';
      break;

    case ClusterStatusType.UpgradeInProgress:
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade in progress…';
      tooltip =
        'The cluster is currently upgrading. This step usually takes about 30 minutes.';
      break;

    case ClusterStatusType.UpgradeScheduled:
      color = theme.colors.gray;
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade scheduled';
      tooltip = clusterUpdateSchedule
        ? `The cluster will upgrade to v${
            clusterUpdateSchedule.targetRelease
          } on ${formatDate(clusterUpdateSchedule.targetTime)}`
        : '';
      break;

    case ClusterStatusType.UpgradeAvailable:
      iconClassName = 'fa fa-warning';
      message = 'Upgrade available';
      tooltip = `There's a new release version available. Upgrade now to get the latest features.`;
      break;

    default:
      return null;
  }

  return (
    <TooltipContainer content={<Tooltip>{tooltip}</Tooltip>}>
      <Box aria-label='Cluster status' {...props}>
        <Text color={inheritColor ? undefined : color}>
          <i className={iconClassName} role='presentation' aria-hidden='true' />{' '}
          {message}
        </Text>
      </Box>
    </TooltipContainer>
  );
};

export default ClusterStatus;
