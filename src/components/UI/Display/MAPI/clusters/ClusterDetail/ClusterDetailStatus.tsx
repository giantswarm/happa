import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface IClusterDetailStatusProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  isCreating?: boolean;
  isDeleting?: boolean;
  isUpgrading?: boolean;
  isUpgradable?: boolean;
}

const ClusterDetailStatus: React.FC<IClusterDetailStatusProps> = ({
  isCreating,
  isDeleting,
  isUpgrading,
  isUpgradable,
  ...props
}) => {
  let iconClassName = '';
  let message = '';
  let tooltip = '';

  switch (true) {
    case isCreating:
    case isDeleting:
      return null;

    case isUpgrading:
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade in progress…';
      tooltip =
        'The cluster is currently upgrading. This step usually takes about 30 minutes.';
      break;

    case isUpgradable:
      iconClassName = 'fa fa-warning';
      message = 'Upgrade available';
      tooltip = `There's a new release version available. Upgrade now to get the latest features.`;
      break;
  }

  return (
    <OverlayTrigger
      overlay={<Tooltip id='tooltip'>{tooltip}</Tooltip>}
      placement='top'
    >
      <Box aria-label='Cluster status' {...props}>
        <Text color='status-warning'>
          <i className={iconClassName} role='presentation' aria-hidden='true' />{' '}
          {message}
        </Text>
      </Box>
    </OverlayTrigger>
  );
};

ClusterDetailStatus.propTypes = {
  isCreating: PropTypes.bool,
  isDeleting: PropTypes.bool,
  isUpgrading: PropTypes.bool,
  isUpgradable: PropTypes.bool,
};

export default ClusterDetailStatus;
