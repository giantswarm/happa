import { Box, Text } from 'grommet';
import { NodePool, ProviderNodePool } from 'MAPI/types';
import {
  getProviderNodePoolMachineTypes,
  INodePoolMachineTypesAWS,
  INodePoolMachineTypesAzure,
} from 'MAPI/utils';
import React from 'react';
import styled from 'styled-components';
import { Code } from 'styles';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const MixedInstanceType = styled(Code)`
  background: ${({ theme }) => theme.global.colors['accent-strong'].dark};
  color: ${({ theme }) => theme.global.colors.text.dark};
`;

function formatMachineTypeLabel(providerNodePool?: ProviderNodePool) {
  const machineTypes = getProviderNodePoolMachineTypes(providerNodePool);

  switch (providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return `VM size: ${machineTypes?.primary ?? 'n/a'}`;

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return `Instance type: ${machineTypes?.primary ?? 'n/a'}`;

    default:
      return undefined;
  }
}

interface IWorkerNodesNodePoolItemMachineTypeProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  nodePool?: NodePool;
  providerNodePool?: ProviderNodePool;
}

const WorkerNodesNodePoolItemMachineType: React.FC<
  IWorkerNodesNodePoolItemMachineTypeProps
> = ({ nodePool, providerNodePool, ...props }) => {
  const machineTypes =
    nodePool && providerNodePool
      ? getProviderNodePoolMachineTypes(providerNodePool)
      : undefined;

  const allMachineTypes = (machineTypes as INodePoolMachineTypesAWS | undefined)
    ?.all;

  const similarInstances =
    (machineTypes as INodePoolMachineTypesAWS | undefined)?.similarInstances ??
    false;

  return (
    <Box align='center' {...props}>
      <OptionalValue value={machineTypes} loaderWidth={130}>
        {(value) =>
          similarInstances ? (
            <TooltipContainer
              content={
                <Tooltip
                  id={`${providerNodePool!.metadata.name}-instance-types`}
                >
                  <Box width='180px'>
                    <Text size='xsmall' textAlign='center'>
                      Similar instances enabled.
                    </Text>
                    <Text size='xsmall' textAlign='center'>
                      Currently used:{' '}
                      {allMachineTypes!.join(', ') || <NotAvailable />}
                    </Text>
                  </Box>
                </Tooltip>
              }
            >
              <div>
                <MixedInstanceType
                  aria-label={formatMachineTypeLabel(providerNodePool)}
                >
                  {(value as INodePoolMachineTypesAWS).primary}
                </MixedInstanceType>
                {allMachineTypes!.length > 1 && (
                  <Text
                    size='xsmall'
                    margin={{ left: 'xsmall' }}
                    color='text-weak'
                  >
                    +{allMachineTypes!.length - 1} more
                  </Text>
                )}
              </div>
            </TooltipContainer>
          ) : (
            <Code aria-label={formatMachineTypeLabel(providerNodePool)}>
              {(value as INodePoolMachineTypesAzure).primary}
            </Code>
          )
        }
      </OptionalValue>
    </Box>
  );
};

export default WorkerNodesNodePoolItemMachineType;
