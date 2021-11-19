import { Text } from 'grommet';
import * as React from 'react';
import { Providers } from 'shared/constants';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import NodePoolScalingSpotInstancesDetails from './NodePoolScalingSpotInstancesDetails';

const NodesWrapper = styled.div<{ highlight?: boolean }>`
  width: 36px;
  height: 30px;
  line-height: 31px;
  text-align: center;
  border-radius: 3px;
  white-space: nowrap;
  background-color: ${({ theme, highlight }) =>
    highlight && theme.colors.goldBackground};
`;

interface INodePoolScalingProps {
  nodePool: INodePool;
  provider: PropertiesOf<typeof Providers>;
  supportsAutoscaling?: boolean;
  supportsSpotInstances?: boolean;
}

const NodePoolScaling: React.FC<INodePoolScalingProps> = ({
  nodePool,
  provider,
  supportsAutoscaling,
  supportsSpotInstances,
}) => {
  const { id, scaling, status } = nodePool;

  const current = status?.nodes_ready ?? 0;
  const desired = status?.nodes ?? 0;

  const spotInstancesCount = status?.spot_instances ?? 0;
  const spotInstancesEnabled = getIsSpotInstancesEnabled(provider, nodePool);

  return (
    <>
      {supportsAutoscaling && (
        <>
          <NodesWrapper data-testid='scaling-min'>
            {scaling?.min ?? 0}
          </NodesWrapper>
          <NodesWrapper data-testid='scaling-max'>
            {scaling?.max ?? 0}
          </NodesWrapper>
        </>
      )}

      <NodesWrapper>{desired}</NodesWrapper>
      <NodesWrapper highlight={current !== desired}>{current}</NodesWrapper>

      {supportsSpotInstances && (
        <TooltipContainer
          content={
            <Tooltip id={`${id}-spot-instances-tooltip`}>
              <Text size='xsmall'>
                <NodePoolScalingSpotInstancesDetails
                  provider={provider}
                  nodePool={nodePool}
                />
              </Text>
            </Tooltip>
          }
        >
          <NodesWrapper>
            {provider === Providers.AWS && spotInstancesCount}
            {provider === Providers.AZURE && (
              <i
                title={spotInstancesEnabled ? 'Enabled' : 'Disabled'}
                className={spotInstancesEnabled ? 'fa fa-done' : 'fa fa-close'}
              />
            )}
          </NodesWrapper>
        </TooltipContainer>
      )}
    </>
  );
};

NodePoolScaling.defaultProps = {
  supportsAutoscaling: false,
  supportsSpotInstances: false,
};

export default NodePoolScaling;

function getIsSpotInstancesEnabled(provider: string, nodePool: INodePool) {
  switch (provider) {
    case Providers.AZURE:
      return nodePool.node_spec?.azure?.spot_instances?.enabled ?? false;
    case Providers.AWS:
      return (
        (nodePool.node_spec?.aws?.instance_distribution
          ?.on_demand_percentage_above_base_capacity ?? 0) > 0
      );
    default:
      return false;
  }
}
