import { Box, Text } from 'grommet';
import { getRelativeDateFromNow } from 'lib/helpers';
import { IClusterUpdateSchedule } from 'MAPI/clusters/utils';
import React from 'react';
import { useTheme } from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

interface IClusterDetailStatusProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  isCreating?: boolean;
  isDeleting?: boolean;
  isConditionUnknown?: boolean;
  isUpgrading?: boolean;
  isUpgradable?: boolean;
  clusterUpdateSchedule?: IClusterUpdateSchedule;
}

const ClusterDetailStatus: React.FC<IClusterDetailStatusProps> = ({
  isCreating,
  isDeleting,
  isConditionUnknown,
  isUpgrading,
  isUpgradable,
  clusterUpdateSchedule,
  ...props
}) => {
  const theme = useTheme();
  let color = theme.colors.yellow1;
  let iconClassName = '';
  let message = '';
  let tooltip = '';

  switch (true) {
    case isCreating:
    case isDeleting:
    case isConditionUnknown:
      return null;

    case isUpgrading:
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade in progress…';
      tooltip =
        'The cluster is currently upgrading. This step usually takes about 30 minutes.';
      break;

    case typeof clusterUpdateSchedule !== 'undefined':
      color = theme.colors.gray;
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade scheduled';
      tooltip = `The cluster will upgrade to ${
        clusterUpdateSchedule!.targetRelease
      } in ${getRelativeDateFromNow(clusterUpdateSchedule!.targetTime)}.`;
      break;

    case isUpgradable:
      iconClassName = 'fa fa-warning';
      message = 'Upgrade available';
      tooltip = `There's a new release version available. Upgrade now to get the latest features.`;
      break;
  }

  return (
    <TooltipContainer content={<Tooltip>{tooltip}</Tooltip>}>
      <Box aria-label='Cluster status' {...props}>
        <Text color={color}>
          <i className={iconClassName} role='presentation' aria-hidden='true' />{' '}
          {message}
        </Text>
      </Box>
    </TooltipContainer>
  );
};

export default ClusterDetailStatus;
