import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { IClusterItem } from '../types';
import ClusterDetailCounter from './ClusterDetailCounter';
import ClusterDetailWidget from './ClusterDetailWidget';

function formatMemory(value?: number) {
  if (typeof value === 'undefined') return undefined;

  // eslint-disable-next-line no-magic-numbers
  return Math.round(value);
}

function formatCPU(value?: number) {
  if (typeof value === 'undefined') return undefined;

  return Math.round(value);
}

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.global.colors['input-highlight']};
`;

interface IClusterDetailWidgetWorkerNodesProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
      'title'
    >,
    Pick<
      IClusterItem,
      | 'workerNodePoolsCount'
      | 'workerNodesCount'
      | 'workerNodesCPU'
      | 'workerNodesMemory'
    > {
  workerNodesPath: string;
}

const ClusterDetailWidgetWorkerNodes: React.FC<IClusterDetailWidgetWorkerNodesProps> = ({
  workerNodesPath,
  workerNodePoolsCount,
  workerNodesCount,
  workerNodesCPU,
  workerNodesMemory,
  ...props
}) => {
  const hasNoNodePools =
    typeof workerNodePoolsCount === 'number' && workerNodePoolsCount === 0;

  return (
    <ClusterDetailWidget
      title='Worker nodes'
      contentProps={{
        direction: 'row',
        gap: 'small',
        wrap: true,
      }}
      {...props}
    >
      {hasNoNodePools && (
        <Box pad={{ bottom: 'xsmall' }}>
          <Text color='status-warning' margin={{ bottom: 'small' }}>
            No node pools
          </Text>
          <Text size='small'>
            To create node pools, switch to the{' '}
            <StyledLink to={workerNodesPath}>worker nodes</StyledLink> tab.
          </Text>
        </Box>
      )}

      {!hasNoNodePools && (
        <>
          <ClusterDetailCounter
            label='node pool'
            pluralize={true}
            value={workerNodePoolsCount}
          />
          <ClusterDetailCounter
            label='node'
            pluralize={true}
            value={workerNodesCount}
          />
          <ClusterDetailCounter
            label='CPU'
            pluralize={true}
            value={formatCPU(workerNodesCPU)}
          />
          <ClusterDetailCounter
            label='GB RAM'
            value={formatMemory(workerNodesMemory)}
          />
        </>
      )}
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetWorkerNodes.propTypes = {
  workerNodesPath: PropTypes.string.isRequired,
  workerNodePoolsCount: PropTypes.number,
  workerNodesCount: PropTypes.number,
  workerNodesCPU: PropTypes.number,
  workerNodesMemory: PropTypes.number,
};

export default ClusterDetailWidgetWorkerNodes;
