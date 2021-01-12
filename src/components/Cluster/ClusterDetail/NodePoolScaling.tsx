import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import * as React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { INodePool } from 'shared/types';

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
  supportsAutoscaling?: boolean;
  supportsSpotInstances?: boolean;
}

const NodePoolScaling: React.FC<INodePoolScalingProps> = ({
  nodePool,
  supportsAutoscaling,
  supportsSpotInstances,
}) => {
  const { id, scaling, status } = nodePool;

  const current = status?.nodes_ready ?? 0;
  let desired = status?.nodes ?? 0;
  if (!supportsAutoscaling) {
    desired = scaling?.max ?? 0;
  }
  const spot_instances = status?.spot_instances ?? 0;

  const formatInstanceDistribution = () => {
    const aws = nodePool.node_spec?.aws;

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
  supportsAutoscaling: PropTypes.bool,
  supportsSpotInstances: PropTypes.bool,
};

NodePoolScaling.defaultProps = {
  supportsAutoscaling: false,
  supportsSpotInstances: false,
};

export default NodePoolScaling;
