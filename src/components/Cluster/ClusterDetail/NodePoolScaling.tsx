import PropTypes from 'prop-types';
import * as React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { INodePool } from 'shared/types';
import styled from 'styled-components';

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
  const desired = status?.nodes ?? 0;

  const spot_instances = status?.spot_instances ?? 0;

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
              <NodePoolScalingSpotInstancesDetails nodePool={nodePool} />
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
