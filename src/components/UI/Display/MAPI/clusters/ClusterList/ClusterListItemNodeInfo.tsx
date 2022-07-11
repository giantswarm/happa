import { Box, Text } from 'grommet';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { getHumanReadableMemory } from 'utils/helpers';

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
  const formattedMemory = getHumanReadableMemory(value, 1);

  return `${formattedMemory.value} ${formattedMemory.unit} RAM`;
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

const ClusterListItemNodeInfo: React.FC<
  React.PropsWithChildren<IClusterListItemNodeInfoProps>
> = ({
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
                formatWorkerNodePoolsCount(value)
              )}{' '}
              {pluralizeLabel(value, 'node pool')},
            </Text>
          )}
        </OptionalValue>
        <OptionalValue value={workerNodesCount} replaceEmptyValue={false}>
          {(value) => (
            <Text>
              {value === -1 ? <NotAvailable /> : formatWorkerNodesCount(value)}{' '}
              {pluralizeLabel(value, 'worker node')}
            </Text>
          )}
        </OptionalValue>
      </Box>
      <StyledDot />
      <OptionalValue value={workerNodesCPU} replaceEmptyValue={false}>
        {(value) => (
          <Text>
            {value === -1 ? <NotAvailable /> : formatCPU(value)}{' '}
            {pluralizeLabel(value, 'CPU core')}
          </Text>
        )}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={workerNodesMemory} replaceEmptyValue={false}>
        {(value) => (
          <Text>{value === -1 ? <NotAvailable /> : formatMemory(value)}</Text>
        )}
      </OptionalValue>
    </Box>
  );
};

export default ClusterListItemNodeInfo;
