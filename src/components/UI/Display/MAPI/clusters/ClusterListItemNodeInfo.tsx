import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import { IClusterItem } from './types';

function formatWorkerNodePoolsCount(value?: number): string | undefined {
  if (typeof value === 'undefined') return undefined;

  if (value > 1) {
    return `${value} node pools`;
  }

  return `${value} node pool`;
}

function formatWorkerNodesCount(value?: number): string | undefined {
  if (typeof value === 'undefined') return undefined;

  if (value > 1) {
    return `${value} nodes`;
  }

  return `${value} node`;
}

function formatMemory(value?: number): string | undefined {
  if (typeof value === 'undefined') return undefined;

  return `${Math.round(value)} GB RAM`;
}

function formatCPU(value?: number): string | undefined {
  if (typeof value === 'undefined') return undefined;

  const formattedValue = Math.round(value);
  if (formattedValue > 1) {
    return `${formattedValue} CPU cores`;
  }

  return `${formattedValue} CPU core`;
}

const StyledRefreshableLabel = styled(RefreshableLabel)`
  padding: 0;
  margin: 0;
`;

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterListItemNodeInfoProps
  extends Pick<
      IClusterItem,
      | 'workerNodePoolsCount'
      | 'workerNodesCPU'
      | 'workerNodesCount'
      | 'workerNodesMemory'
    >,
    React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterListItemNodeInfo: React.FC<IClusterListItemNodeInfoProps> = ({
  workerNodePoolsCount,
  workerNodesCPU,
  workerNodesCount,
  workerNodesMemory,
  ...props
}) => {
  return (
    <Box direction='row' align='baseline' gap='xsmall' {...props}>
      <Box direction='row' gap='xsmall'>
        {/* @ts-expect-error */}
        <StyledRefreshableLabel value={workerNodePoolsCount}>
          <Text>{formatWorkerNodePoolsCount(workerNodePoolsCount)},</Text>
        </StyledRefreshableLabel>
        {/* @ts-expect-error */}
        <StyledRefreshableLabel value={workerNodesCount}>
          <Text>{formatWorkerNodesCount(workerNodesCount)}</Text>
        </StyledRefreshableLabel>
      </Box>
      <StyledDot />
      {/* @ts-expect-error */}
      <StyledRefreshableLabel value={workerNodesCPU}>
        <Text>{formatCPU(workerNodesCPU)}</Text>
      </StyledRefreshableLabel>
      <StyledDot />
      {/* @ts-expect-error */}
      <StyledRefreshableLabel value={workerNodesMemory}>
        <Text>{formatMemory(workerNodesMemory)}</Text>
      </StyledRefreshableLabel>
    </Box>
  );
};

ClusterListItemNodeInfo.propTypes = {
  workerNodePoolsCount: PropTypes.number,
  workerNodesCPU: PropTypes.number,
  workerNodesCount: PropTypes.number,
  workerNodesMemory: PropTypes.number,
};

export default ClusterListItemNodeInfo;
