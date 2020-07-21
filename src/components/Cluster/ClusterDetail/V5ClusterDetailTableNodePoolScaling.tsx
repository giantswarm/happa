import { NodePoolsColumnHeader } from 'Cluster/ClusterDetail/V5ClusterDetailTable';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Constants } from 'shared';

interface IV5ClusterDetailTableNodePoolScalingProps {}

const V5ClusterDetailTableNodePoolScaling: React.FC<IV5ClusterDetailTableNodePoolScalingProps> = () => {
  return (
    <>
      <OverlayTrigger
        overlay={
          <Tooltip id='min-tooltip'>{Constants.MIN_NODES_EXPLANATION}</Tooltip>
        }
        placement='top'
      >
        <NodePoolsColumnHeader>Min</NodePoolsColumnHeader>
      </OverlayTrigger>
      <OverlayTrigger
        overlay={
          <Tooltip id='max-tooltip'>{Constants.MAX_NODES_EXPLANATION}</Tooltip>
        }
        placement='top'
      >
        <NodePoolsColumnHeader>Max</NodePoolsColumnHeader>
      </OverlayTrigger>
      <OverlayTrigger
        overlay={
          <Tooltip id='desired-tooltip'>
            {Constants.DESIRED_NODES_EXPLANATION}
          </Tooltip>
        }
        placement='top'
      >
        <NodePoolsColumnHeader>Desired</NodePoolsColumnHeader>
      </OverlayTrigger>
      <OverlayTrigger
        overlay={
          <Tooltip id='current-tooltip'>
            {Constants.CURRENT_NODES_INPOOL_EXPLANATION}
          </Tooltip>
        }
        placement='top'
      >
        <NodePoolsColumnHeader>Current</NodePoolsColumnHeader>
      </OverlayTrigger>
      <OverlayTrigger
        overlay={
          <Tooltip id='spot-tooltip'>
            {Constants.SPOT_NODES_EXPLNANATION}
          </Tooltip>
        }
        placement='top'
      >
        <NodePoolsColumnHeader>Spot</NodePoolsColumnHeader>
      </OverlayTrigger>
    </>
  );
};

V5ClusterDetailTableNodePoolScaling.propTypes = {};

export default V5ClusterDetailTableNodePoolScaling;
