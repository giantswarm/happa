import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import NotAvailable from 'UI/Display/NotAvailable';

import ClusterListItemOptionalValue from './ClusterListItemOptionalValue';
import { IClusterItem } from './types';

function pluralizeLabel(count: number, base: string) {
  if (count === 1) {
    return base;
  }

  return `${base}s`;
}

function formatWorkerNodePoolsCount(value?: number) {
  if (typeof value === 'undefined') return undefined;

  return value;
}

function formatWorkerNodesCount(value?: number) {
  if (typeof value === 'undefined') return undefined;

  return value;
}

function formatMemory(value?: number) {
  if (typeof value === 'undefined') return undefined;

  // eslint-disable-next-line no-magic-numbers
  return Math.round(value * 10) / 10;
}

function formatCPU(value?: number) {
  if (typeof value === 'undefined') return undefined;

  return Math.round(value);
}

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
    <Box direction='row' align='center' gap='xsmall' {...props}>
      <Box direction='row' gap='xsmall' align='center'>
        <ClusterListItemOptionalValue
          value={workerNodePoolsCount}
          replaceEmptyValue={false}
        >
          {(value) => (
            <Text aria-label='Cluster worker node pools count'>
              {value === -1 ? (
                <NotAvailable />
              ) : (
                formatWorkerNodePoolsCount(value as number)
              )}{' '}
              {pluralizeLabel(value as number, 'node pool')},
            </Text>
          )}
        </ClusterListItemOptionalValue>
        <ClusterListItemOptionalValue
          value={workerNodesCount}
          replaceEmptyValue={false}
        >
          {(value) => (
            <Text aria-label='Cluster worker nodes count'>
              {value === -1 ? (
                <NotAvailable />
              ) : (
                formatWorkerNodesCount(value as number)
              )}{' '}
              {pluralizeLabel(value as number, 'worker node')}
            </Text>
          )}
        </ClusterListItemOptionalValue>
      </Box>
      <StyledDot />
      <ClusterListItemOptionalValue
        value={workerNodesCPU}
        replaceEmptyValue={false}
      >
        {(value) => (
          <Text aria-label='Cluster worker node CPU cores count'>
            {value === -1 ? <NotAvailable /> : formatCPU(value as number)}{' '}
            {pluralizeLabel(value as number, 'CPU core')}
          </Text>
        )}
      </ClusterListItemOptionalValue>
      <StyledDot />
      <ClusterListItemOptionalValue
        value={workerNodesMemory}
        replaceEmptyValue={false}
      >
        {(value) => (
          <Text aria-label='Cluster worker node memory amount'>
            {value === -1 ? <NotAvailable /> : formatMemory(value as number)} GB
            RAM
          </Text>
        )}
      </ClusterListItemOptionalValue>
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
