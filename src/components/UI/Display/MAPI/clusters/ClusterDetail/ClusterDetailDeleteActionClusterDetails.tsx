import { Box, Text } from 'grommet';
import { formatDate, relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import NotAvailable from 'UI/Display/NotAvailable';

import { ClusterDetailDeleteActionNameVariant } from './ClusterDetailDeleteAction';

function formatCounterLabel(count: number, label: string) {
  if (count === 1) return `${count} ${label}`;

  return `${count} ${label}s`;
}

function formatUserInstalledAppsCount(count?: number) {
  if (typeof count === 'undefined') {
    return (
      <>
        <NotAvailable /> apps
      </>
    );
  }

  return formatCounterLabel(count, 'app');
}

function formatClusterNameLabel(variant: ClusterDetailDeleteActionNameVariant) {
  switch (variant) {
    case ClusterDetailDeleteActionNameVariant.ID:
      return 'ID';
    case ClusterDetailDeleteActionNameVariant.Name:
      return 'Name';
    default:
      return '';
  }
}

function formatClusterDescriptionLabel(
  variant: ClusterDetailDeleteActionNameVariant
) {
  switch (variant) {
    case ClusterDetailDeleteActionNameVariant.ID:
      return 'Name';
    case ClusterDetailDeleteActionNameVariant.Name:
      return 'Description';
    default:
      return '';
  }
}

function mapActionNameLabelToClusterIDLabelType(
  variant: ClusterDetailDeleteActionNameVariant
): ClusterIDLabelType {
  switch (variant) {
    case ClusterDetailDeleteActionNameVariant.ID:
      return ClusterIDLabelType.ID;
    case ClusterDetailDeleteActionNameVariant.Name:
      return ClusterIDLabelType.Name;
    default:
      return ClusterIDLabelType.Name;
  }
}

interface IClusterDetailDeleteActionClusterDetailsProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  variant: ClusterDetailDeleteActionNameVariant;
  name: string;
  description: string;
  creationDate: string;
  workerNodesCount: number;
  nodePoolsCount: number;
  userInstalledAppsCount?: number;
}

const ClusterDetailDeleteActionClusterDetails: React.FC<IClusterDetailDeleteActionClusterDetailsProps> = ({
  variant,
  name,
  description,
  creationDate,
  workerNodesCount,
  nodePoolsCount,
  userInstalledAppsCount,
  ...props
}) => {
  const nameLabel = formatClusterNameLabel(variant);
  const descriptionLabel = formatClusterDescriptionLabel(variant);

  return (
    <Box direction='column' gap='xsmall' {...props}>
      <Box
        direction='row'
        gap='xsmall'
        align='baseline'
        aria-label={`${nameLabel}: ${name}`}
      >
        <Text>{nameLabel}:</Text>
        <ClusterIDLabel
          clusterID={name}
          variant={mapActionNameLabelToClusterIDLabelType(variant)}
        />
      </Box>
      <Box direction='row'>
        <Text>
          {descriptionLabel}: {description}
        </Text>
      </Box>
      <Box direction='row'>
        <Text>
          Created: {relativeDate(creationDate)} ({formatDate(creationDate)})
        </Text>
      </Box>
      <Box direction='row' gap='xsmall' align='baseline'>
        <Text>
          Has {formatCounterLabel(workerNodesCount, 'worker node')} in{' '}
          {formatCounterLabel(nodePoolsCount, 'node pool')},{' '}
          {formatUserInstalledAppsCount(userInstalledAppsCount)} installed.
        </Text>
      </Box>
    </Box>
  );
};

ClusterDetailDeleteActionClusterDetails.propTypes = {
  variant: (PropTypes.string as PropTypes.Requireable<ClusterDetailDeleteActionNameVariant>)
    .isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  creationDate: PropTypes.string.isRequired,
  workerNodesCount: PropTypes.number.isRequired,
  nodePoolsCount: PropTypes.number.isRequired,
  userInstalledAppsCount: PropTypes.number,
};

export default ClusterDetailDeleteActionClusterDetails;
