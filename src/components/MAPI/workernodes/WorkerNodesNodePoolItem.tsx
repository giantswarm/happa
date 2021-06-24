import { Box, Text } from 'grommet';
import { NodePool, ProviderNodePool } from 'MAPI/types';
import {
  getNodePoolAvailabilityZones,
  getNodePoolDescription,
  getNodePoolScaling,
  getProviderNodePoolMachineType,
} from 'MAPI/utils';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import Copyable from 'shared/Copyable';
import styled from 'styled-components';
import { Code } from 'styles';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';
import { NodePoolGridRow } from 'UI/Display/MAPI/workernodes/styles';
import ViewAndEditName from 'UI/Inputs/ViewEditName';

import { IWorkerNodesAdditionalColumn } from './types';

function formatMachineTypeLabel(providerNodePool?: ProviderNodePool) {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
      return 'Node pool VM size';
    default:
      return undefined;
  }
}

const Row = styled(Box)<{ additionalColumnsCount?: number }>`
  ${({ additionalColumnsCount }) => NodePoolGridRow(additionalColumnsCount)}
`;

const StyledViewAndEditName = styled(ViewAndEditName)`
  max-width: ${({ theme }) => theme.global.size.medium};

  input {
    font-size: 100%;
    padding: ${({ theme }) => theme.global.edgeSize.xsmall};
  }

  .btn-group {
    top: 0;
    display: flex;
  }
`;

interface IWorkerNodesNodePoolItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  nodePool?: NodePool;
  providerNodePool?: ProviderNodePool;
  additionalColumns?: IWorkerNodesAdditionalColumn[];
}

const WorkerNodesNodePoolItem: React.FC<IWorkerNodesNodePoolItemProps> = ({
  nodePool,
  providerNodePool,
  additionalColumns,
  ...props
}) => {
  const description = nodePool ? getNodePoolDescription(nodePool) : undefined;
  const availabilityZones = nodePool
    ? getNodePoolAvailabilityZones(nodePool)
    : undefined;
  const machineType = providerNodePool
    ? getProviderNodePoolMachineType(providerNodePool)
    : undefined;
  const scaling = useMemo(() => {
    if (!nodePool) return undefined;

    return getNodePoolScaling(nodePool);
  }, [nodePool]);

  const isScalingInProgress = scaling && scaling.desired !== scaling.current;

  const [isEditingDescription, setIsEditingDescription] = useState(false);

  return (
    <Row
      background='background-front'
      round='xsmall'
      additionalColumnsCount={additionalColumns?.length}
      {...props}
    >
      <Box align='center'>
        <ClusterDetailWidgetOptionalValue
          value={nodePool?.metadata.name}
          loaderWidth={70}
          loaderHeight={26}
        >
          {(value) => (
            <Copyable copyText={value as string}>
              <Text aria-label='Node pool name'>
                <Code>{value}</Code>
              </Text>
            </Copyable>
          )}
        </ClusterDetailWidgetOptionalValue>
      </Box>
      <Box>
        <ClusterDetailWidgetOptionalValue value={description} loaderWidth={150}>
          {(value) => (
            <StyledViewAndEditName
              value={value as string}
              typeLabel='node pool'
              onToggleEditingState={setIsEditingDescription}
              aria-label='Node pool description'
            />
          )}
        </ClusterDetailWidgetOptionalValue>
      </Box>
      {!isEditingDescription && (
        <>
          <Box align='center'>
            <ClusterDetailWidgetOptionalValue
              value={machineType}
              loaderWidth={130}
            >
              {(value) => (
                <Code aria-label={formatMachineTypeLabel(providerNodePool)}>
                  {value}
                </Code>
              )}
            </ClusterDetailWidgetOptionalValue>
          </Box>
          <Box align='center'>
            <ClusterDetailWidgetOptionalValue
              value={availabilityZones}
              loaderHeight={26}
            >
              {(value) => (
                <AvailabilityZonesLabels zones={value} labelsChecked={[]} />
              )}
            </ClusterDetailWidgetOptionalValue>
          </Box>
          <Box align='center'>
            <ClusterDetailWidgetOptionalValue
              value={scaling?.min}
              loaderWidth={30}
            >
              {(value) => (
                <Text aria-label='Node pool autoscaler minimum node count'>
                  {value}
                </Text>
              )}
            </ClusterDetailWidgetOptionalValue>
          </Box>
          <Box align='center'>
            <ClusterDetailWidgetOptionalValue
              value={scaling?.max}
              loaderWidth={30}
            >
              {(value) => (
                <Text aria-label='Node pool autoscaler maximum node count'>
                  {value}
                </Text>
              )}
            </ClusterDetailWidgetOptionalValue>
          </Box>
          <Box align='center'>
            <ClusterDetailWidgetOptionalValue
              value={scaling?.desired}
              loaderWidth={30}
            >
              {(value) => (
                <Text aria-label='Node pool autoscaler target node count'>
                  {value}
                </Text>
              )}
            </ClusterDetailWidgetOptionalValue>
          </Box>
          <Box align='center'>
            <ClusterDetailWidgetOptionalValue
              value={scaling?.current}
              loaderWidth={30}
            >
              {(value) => (
                <Box
                  pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}
                  round='xsmall'
                  background={
                    isScalingInProgress ? 'status-warning' : undefined
                  }
                >
                  <Text
                    aria-label='Node pool autoscaler current node count'
                    color={isScalingInProgress ? 'background' : undefined}
                  >
                    {value}
                  </Text>
                </Box>
              )}
            </ClusterDetailWidgetOptionalValue>
          </Box>

          {additionalColumns?.map((column) => (
            <Box key={column.title} align='center'>
              {column.render(nodePool, providerNodePool)}
            </Box>
          ))}

          <Box align='center' />
        </>
      )}
    </Row>
  );
};

WorkerNodesNodePoolItem.propTypes = {
  nodePool: PropTypes.object as PropTypes.Validator<NodePool>,
  providerNodePool: PropTypes.object as PropTypes.Validator<ProviderNodePool>,
  additionalColumns: PropTypes.array,
};

export default WorkerNodesNodePoolItem;
