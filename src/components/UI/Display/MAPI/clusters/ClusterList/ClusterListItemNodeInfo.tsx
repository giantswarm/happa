import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import OptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/OptionalValue';
import NotAvailable from 'UI/Display/NotAvailable';

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
  extends React.ComponentPropsWithoutRef<typeof Box> {
  workerNodePoolsCount?: number;
  workerNodesCPU?: number;
  workerNodesCount?: number;
  workerNodesMemory?: number;
}

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
        <OptionalValue value={workerNodePoolsCount} replaceEmptyValue={false}>
          {(value) => (
            <Text>
              {value === -1 ? (
                <NotAvailable />
              ) : (
                formatWorkerNodePoolsCount(value as number)
              )}{' '}
              {pluralizeLabel(value as number, 'node pool')},
            </Text>
          )}
        </OptionalValue>
        <OptionalValue value={workerNodesCount} replaceEmptyValue={false}>
          {(value) => (
            <Text>
              {value === -1 ? (
                <NotAvailable />
              ) : (
                formatWorkerNodesCount(value as number)
              )}{' '}
              {pluralizeLabel(value as number, 'worker node')}
            </Text>
          )}
        </OptionalValue>
      </Box>
      <StyledDot />
      <OptionalValue value={workerNodesCPU} replaceEmptyValue={false}>
        {(value) => (
          <Text>
            {value === -1 ? <NotAvailable /> : formatCPU(value as number)}{' '}
            {pluralizeLabel(value as number, 'CPU core')}
          </Text>
        )}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={workerNodesMemory} replaceEmptyValue={false}>
        {(value) => (
          <Text>
            {value === -1 ? <NotAvailable /> : formatMemory(value as number)} GB
            RAM
          </Text>
        )}
      </OptionalValue>
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
