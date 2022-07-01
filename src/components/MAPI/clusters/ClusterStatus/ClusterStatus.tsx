import { Box, Text } from 'grommet';
import React from 'react';
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
  showFullMessage?: boolean;
}

const ClusterStatus: React.FC<React.PropsWithChildren<IClusterStatusProps>> = ({
  status,
  clusterUpdateSchedule,
  inheritColor,
  showFullMessage,
  ...props
}) => {
  let color = 'text-warning';
  let iconClassName = '';
  let message = '';
  let fullMessage = '';

  switch (status) {
    case ClusterStatusType.CreationInProgress:
      color = 'text-weak';
      iconClassName = 'fa fa-change-in-progress';
      message = 'Cluster creating…';
      fullMessage =
        'The cluster is currently being created. This step usually takes about 15 minutes.';
      break;

    case ClusterStatusType.UpgradeInProgress:
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade in progress…';
      fullMessage =
        'The cluster is currently being upgraded. This step usually takes about 30 minutes.';
      break;

    case ClusterStatusType.UpgradeScheduled:
      color = 'text-weak';
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade scheduled';
      fullMessage = clusterUpdateSchedule
        ? `The cluster will be upgraded to v${
            clusterUpdateSchedule.targetRelease
          } on ${formatDate(clusterUpdateSchedule.targetTime)}`
        : '';
      break;

    case ClusterStatusType.UpgradeAvailable:
      iconClassName = 'fa fa-warning';
      message = 'Upgrade available';
      fullMessage = `There's a new release version available. Upgrade now to get the latest features.`;
      break;

    default:
      return null;
  }

  return showFullMessage ? (
    <Box aria-label='Cluster status' {...props}>
      <Text color={inheritColor ? undefined : color}>
        <i className={iconClassName} role='presentation' aria-hidden='true' />{' '}
        {fullMessage}
      </Text>
    </Box>
  ) : (
    <TooltipContainer content={<Tooltip>{fullMessage}</Tooltip>}>
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
