import { Box } from 'grommet';
import { NodePool, ProviderNodePool } from 'MAPI/types';
import { getProviderNodePoolMachineType } from 'MAPI/utils';
import React from 'react';
import { Code } from 'styles';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

function formatMachineTypeLabel(providerNodePool?: ProviderNodePool) {
  switch (providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return `VM size: ${getProviderNodePoolMachineType(providerNodePool)}`;

    case 'infrastructure.giantswarm.io/v1alpha3':
      return `Instance type: ${getProviderNodePoolMachineType(
        providerNodePool
      )}`;

    default:
      return undefined;
  }
}

interface IWorkerNodesNodePoolItemMachineTypeProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  nodePool?: NodePool;
  providerNodePool?: ProviderNodePool;
}

const WorkerNodesNodePoolItemMachineType: React.FC<IWorkerNodesNodePoolItemMachineTypeProps> =
  ({ nodePool, providerNodePool, ...props }) => {
    const machineType = nodePool
      ? getProviderNodePoolMachineType(providerNodePool)
      : undefined;

    return (
      <Box align='center' {...props}>
        <OptionalValue value={machineType} loaderWidth={130}>
          {(value) => (
            <Code aria-label={formatMachineTypeLabel(providerNodePool)}>
              {value}
            </Code>
          )}
        </OptionalValue>
      </Box>
    );
  };

export default WorkerNodesNodePoolItemMachineType;
