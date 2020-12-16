import { NodePoolsColumnHeader } from 'Cluster/ClusterDetail/V5ClusterDetailTable';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Constants } from 'shared/constants';

interface IV5ClusterDetailTableNodePoolScalingProps {
  supportsAutoscaling?: boolean;
  supportsSpotInstances?: boolean;
}

const V5ClusterDetailTableNodePoolScaling: React.FC<IV5ClusterDetailTableNodePoolScalingProps> = ({
  supportsAutoscaling,
  supportsSpotInstances,
}) => {
  const desiredCountTooltipMessage = supportsAutoscaling
    ? Constants.DESIRED_NODES_EXPLANATION_AUTOSCALER
    : Constants.DESIRED_NODES_EXPLANATION;

  return (
    <>
      {supportsAutoscaling && (
        <>
          <OverlayTrigger
            overlay={
              <Tooltip id='min-tooltip'>
                {Constants.MIN_NODES_EXPLANATION}
              </Tooltip>
            }
            placement='top'
          >
            <NodePoolsColumnHeader>Min</NodePoolsColumnHeader>
          </OverlayTrigger>
          <OverlayTrigger
            overlay={
              <Tooltip id='max-tooltip'>
                {Constants.MAX_NODES_EXPLANATION}
              </Tooltip>
            }
            placement='top'
          >
            <NodePoolsColumnHeader>Max</NodePoolsColumnHeader>
          </OverlayTrigger>
        </>
      )}

      <OverlayTrigger
        overlay={
          <Tooltip id='desired-tooltip'>{desiredCountTooltipMessage}</Tooltip>
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

      {supportsSpotInstances && (
        <OverlayTrigger
          overlay={
            <Tooltip id='spot-tooltip'>
              {Constants.SPOT_NODES_EXPLANATION}
            </Tooltip>
          }
          placement='top'
        >
          <NodePoolsColumnHeader>Spot</NodePoolsColumnHeader>
        </OverlayTrigger>
      )}
    </>
  );
};

V5ClusterDetailTableNodePoolScaling.propTypes = {
  supportsAutoscaling: PropTypes.bool,
  supportsSpotInstances: PropTypes.bool,
};

V5ClusterDetailTableNodePoolScaling.defaultProps = {
  supportsAutoscaling: false,
  supportsSpotInstances: false,
};

export default V5ClusterDetailTableNodePoolScaling;
