import { Box, Text } from 'grommet';
import { NodePool, ProviderNodePool } from 'MAPI/types';
import { getProviderNodePoolMachineType } from 'MAPI/utils';
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

    const useAlikeInstanceTypes =
      providerNodePool?.apiVersion ===
        'infrastructure.giantswarm.io/v1alpha3' &&
      providerNodePool.spec.provider.worker.useAlikeInstanceTypes;
    const instanceTypes =
      providerNodePool?.apiVersion === 'infrastructure.giantswarm.io/v1alpha3'
        ? providerNodePool.status?.provider?.worker?.instanceTypes
        : undefined;

    return (
      <Box align='center' {...props}>
        <OptionalValue value={machineType} loaderWidth={130}>
          {(value) =>
            useAlikeInstanceTypes ? (
              <TooltipContainer
                content={
                  <Tooltip
                    id={`${providerNodePool.metadata.name}-instance-types`}
                  >
                    <Box width='180px'>
                      <Text size='xsmall' textAlign='center'>
                        Similar instances enabled.
                      </Text>
                      <Text size='xsmall' textAlign='center'>
                        Currently used:{' '}
                        {instanceTypes?.join(', ') ?? <NotAvailable />}
                      </Text>
                    </Box>
                  </Tooltip>
                }
              >
                <div>
                  <MixedInstanceType
                    aria-label={formatMachineTypeLabel(providerNodePool)}
                  >
                    {value}
                  </MixedInstanceType>
                  {instanceTypes && instanceTypes.length > 1 && (
                    <Text
                      size='xsmall'
                      margin={{ left: 'xsmall' }}
                      color='text-weak'
                    >
                      +{instanceTypes.length - 1} more
                    </Text>
                  )}
                </div>
              </TooltipContainer>
            ) : (
              <Code aria-label={formatMachineTypeLabel(providerNodePool)}>
                {' '}
                {value}
              </Code>
            )
          }
        </OptionalValue>
      </Box>
    );
  };

export default WorkerNodesNodePoolItemMachineType;
