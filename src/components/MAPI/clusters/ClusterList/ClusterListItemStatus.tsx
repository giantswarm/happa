import { Box, Text } from 'grommet';
import { ProviderCluster } from 'MAPI/types';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React, { useMemo } from 'react';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { useTheme } from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import {
  getLatestProviderClusterCondition,
  isClusterCreating,
  isClusterUpgradable,
  isClusterUpgrading,
  isProviderClusterConditionUnknown,
} from '../utils';

interface IClusterListItemStatusProps {
  cluster: capiv1alpha3.ICluster;
  providerCluster: ProviderCluster;
  isAdmin: boolean;
  provider: PropertiesOf<typeof Providers>;
  releases?: releasev1alpha1.IRelease[];
}

const ClusterListItemStatus: React.FC<IClusterListItemStatusProps> = ({
  cluster,
  providerCluster,
  releases,
  isAdmin,
  provider,
}) => {
  const theme = useTheme();

  const latestProviderClusterCondition = useMemo(() => {
    return getLatestProviderClusterCondition(providerCluster);
  }, [providerCluster]);

  const isCreating = isClusterCreating(cluster, latestProviderClusterCondition);

  const isUpgrading = isClusterUpgrading(
    cluster,
    latestProviderClusterCondition
  );

  const isUpgradable = useMemo(
    () => isClusterUpgradable(cluster, provider, isAdmin, releases),
    [cluster, provider, isAdmin, releases]
  );

  const isConditionUnknown = isProviderClusterConditionUnknown(
    latestProviderClusterCondition,
    provider
  );

  let color = theme.colors.yellow1;
  let iconClassName = '';
  let message = '';
  let tooltip = '';

  switch (true) {
    case typeof cluster.metadata.deletionTimestamp !== 'undefined':
      return null;

    case typeof cluster.status === 'undefined':
    case isConditionUnknown:
    case isCreating:
      color = theme.colors.gray;
      iconClassName = 'fa fa-change-in-progress';
      message = 'Cluster creating…';
      tooltip =
        'The cluster is currently creating. This step usually takes about 15 minutes.';
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
    <TooltipContainer content={<Tooltip>{tooltip}</Tooltip>}>
      <Box>
        <Text color={color}>
          <i className={iconClassName} role='presentation' aria-hidden='true' />{' '}
          {message}
        </Text>
      </Box>
    </TooltipContainer>
  );
};

export default ClusterListItemStatus;
