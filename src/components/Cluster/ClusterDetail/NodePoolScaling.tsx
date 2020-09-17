import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import * as React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import * as Providers from 'shared/constants/providers';
import { INodePool, PropertiesOf } from 'shared/types';

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
}

const NodePoolScaling: React.FC<INodePoolScalingProps> = ({
  nodePool,
  provider,
}) => {
  const { id, scaling, status } = nodePool;
  const { nodes_ready: current, nodes: desired, spot_instances } = status;

  const formatInstanceDistribution = () => {
    const { aws } = nodePool.node_spec;

    let baseCapacity = '-';
    let spotPercentage = '-';

    if (aws?.instance_distribution) {
      baseCapacity = String(aws.instance_distribution.on_demand_base_capacity);
      spotPercentage = String(
        /* eslint-disable-next-line no-magic-numbers */
        100 - aws.instance_distribution.on_demand_percentage_above_base_capacity
      );
    }

    return (
      <>
        On-demand base capacity: {baseCapacity}
        <br />
        Spot instance percentage: {spotPercentage}
      </>
    );
  };

  return (
    <>
      <NodesWrapper data-testid='scaling-min'>{scaling.min}</NodesWrapper>
      <NodesWrapper data-testid='scaling-max'>{scaling.max}</NodesWrapper>
      <NodesWrapper>{desired}</NodesWrapper>
      <NodesWrapper highlight={current < desired}>{current}</NodesWrapper>

      {provider === Providers.AWS && (
        <OverlayTrigger
          overlay={
            <Tooltip id={`${id}-spot-distribution-tooltip`}>
              {formatInstanceDistribution()}
            </Tooltip>
          }
          placement='top'
        >
          <NodesWrapper>{spot_instances}</NodesWrapper>
        </OverlayTrigger>
      )}
    </>
  );
};

NodePoolScaling.propTypes = {
  // @ts-ignore
  nodePool: PropTypes.object.isRequired,
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
};

export default NodePoolScaling;
