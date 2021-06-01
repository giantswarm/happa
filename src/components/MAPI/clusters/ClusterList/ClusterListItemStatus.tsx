import { Box, Text } from 'grommet';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { useTheme } from 'styled-components';

import { isClusterUpgradable } from '../utils';

interface IClusterListItemStatusProps {
  cluster: capiv1alpha3.ICluster;
  isAdmin: boolean;
  provider: PropertiesOf<typeof Providers>;
  releases?: releasev1alpha1.IRelease[];
}

const ClusterListItemStatus: React.FC<IClusterListItemStatusProps> = ({
  cluster,
  releases,
  isAdmin,
  provider,
}) => {
  const theme = useTheme();

  const isCreating =
    capiv1alpha3.isConditionTrue(cluster, capiv1alpha3.conditionTypeCreating) &&
    capiv1alpha3.isConditionFalse(
      cluster,
      capiv1alpha3.conditionTypeCreating,
      capiv1alpha3.withReasonCreationCompleted(),
      capiv1alpha3.withReasonExistingObject()
    );

  const isUpgrading =
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

  const isUpgradable = useMemo(
    () => isClusterUpgradable(cluster, provider, isAdmin, releases),
    [cluster, provider, isAdmin, releases]
  );

  let color = theme.colors.yellow1;
  let iconClassName = '';
  let message = '';
  let tooltip = '';

  switch (true) {
    case typeof cluster?.metadata.deletionTimestamp !== 'undefined':
      return null;

    case typeof cluster.status === 'undefined':
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
      <Box aria-label='Cluster status'>
        <Text color={color}>
          <i className={iconClassName} role='presentation' aria-hidden='true' />{' '}
          {message}
        </Text>
      </Box>
    </OverlayTrigger>
  );
};

ClusterListItemStatus.propTypes = {
  cluster: (PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>)
    .isRequired,
  isAdmin: PropTypes.bool.isRequired,
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
  releases: PropTypes.array,
};

export default ClusterListItemStatus;
