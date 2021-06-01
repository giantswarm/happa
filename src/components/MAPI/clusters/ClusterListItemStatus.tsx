import { Box, Text } from 'grommet';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import PropTypes from 'prop-types';
import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTheme } from 'styled-components';

interface IClusterListItemStatusProps {
  cluster?: capiv1alpha3.ICluster;
}

const ClusterListItemStatus: React.FC<IClusterListItemStatusProps> = ({
  cluster,
}) => {
  const theme = useTheme();

  const isCreating =
    cluster &&
    capiv1alpha3.isConditionTrue(cluster, capiv1alpha3.conditionTypeCreating) &&
    capiv1alpha3.isConditionFalse(
      cluster,
      capiv1alpha3.conditionTypeCreating,
      capiv1alpha3.withReasonCreationCompleted(),
      capiv1alpha3.withReasonExistingObject()
    );

  const isUpgrading =
    cluster &&
    capiv1alpha3.isConditionTrue(
      cluster,
      capiv1alpha3.conditionTypeUpgrading,
      capiv1alpha3.withReasonUpgradePending()
    ) &&
    capiv1alpha3.isConditionFalse(
      cluster,
      capiv1alpha3.conditionTypeUpgrading,
      capiv1alpha3.withReasonUpgradeNotStarted(),
      capiv1alpha3.withReasonUpgradeCompleted()
    );

  // TODO(axbarsan): Check if the cluster can be upgraded.
  const isUpgradable = false as boolean;

  let color = theme.colors.yellow1;
  let iconClassName = '';
  let message = '';
  let tooltip = '';

  switch (true) {
    case typeof cluster === 'undefined':
    case typeof cluster?.metadata.deletionTimestamp !== 'undefined':
      return null;

    case isUpgradable:
      iconClassName = 'fa fa-warning';
      message = 'Upgrade available';
      tooltip = `There's a new release version available. Upgrade now to get the latest features.`;
      break;

    case typeof cluster !== 'undefined' &&
      typeof cluster!.status === 'undefined':
    case isCreating:
      color = theme.colors.gray;
      iconClassName = 'fa fa-change-in-progress';
      message = 'Cluster creating…';
      tooltip =
        'The cluster is currently creating. This step usually takes about 30 minutes.';
      break;

    case isUpgrading:
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade in progress…';
      tooltip =
        'The cluster is currently upgrading. This step usually takes about 30 minutes.';
      break;
  }

  return (
    <OverlayTrigger
      overlay={<Tooltip id='tooltip'>{tooltip}</Tooltip>}
      placement='top'
    >
      <Box
        //   onClick={handleClick}
        aria-label={message}
      >
        <Text color={color}>
          <i className={iconClassName} role='presentation' aria-hidden='true' />{' '}
          {message}
        </Text>
      </Box>
    </OverlayTrigger>
  );
};

ClusterListItemStatus.propTypes = {
  cluster: PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>,
};

export default ClusterListItemStatus;
