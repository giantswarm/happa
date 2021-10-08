import { NodePoolsColumnHeader } from 'Cluster/ClusterDetail/V5ClusterDetailTable';
import React from 'react';
import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import V5ClusterDetailTableSpotInstancesTab from './V5ClusterDetailTableSpotInstancesTab';

interface IV5ClusterDetailTableNodePoolScalingProps {
  provider: PropertiesOf<typeof Providers>;
  supportsAutoscaling?: boolean;
  supportsSpotInstances?: boolean;
}

const V5ClusterDetailTableNodePoolScaling: React.FC<IV5ClusterDetailTableNodePoolScalingProps> =
  ({ provider, supportsAutoscaling, supportsSpotInstances }) => {
    const desiredCountTooltipMessage = supportsAutoscaling
      ? Constants.DESIRED_NODES_EXPLANATION_AUTOSCALER
      : Constants.DESIRED_NODES_EXPLANATION;

    return (
      <>
        {supportsAutoscaling && (
          <>
            <TooltipContainer
              content={
                <Tooltip id='min-tooltip'>
                  {Constants.MIN_NODES_EXPLANATION}
                </Tooltip>
              }
            >
              <NodePoolsColumnHeader>Min</NodePoolsColumnHeader>
            </TooltipContainer>
            <TooltipContainer
              content={
                <Tooltip id='max-tooltip'>
                  {Constants.MAX_NODES_EXPLANATION}
                </Tooltip>
              }
            >
              <NodePoolsColumnHeader>Max</NodePoolsColumnHeader>
            </TooltipContainer>
          </>
        )}

        <TooltipContainer
          content={
            <Tooltip id='desired-tooltip'>{desiredCountTooltipMessage}</Tooltip>
          }
        >
          <NodePoolsColumnHeader>Desired</NodePoolsColumnHeader>
        </TooltipContainer>
        <TooltipContainer
          content={
            <Tooltip id='current-tooltip'>
              {Constants.CURRENT_NODES_INPOOL_EXPLANATION}
            </Tooltip>
          }
        >
          <NodePoolsColumnHeader>Current</NodePoolsColumnHeader>
        </TooltipContainer>

        {supportsSpotInstances && (
          <V5ClusterDetailTableSpotInstancesTab provider={provider} />
        )}
      </>
    );
  };

V5ClusterDetailTableNodePoolScaling.defaultProps = {
  supportsAutoscaling: false,
  supportsSpotInstances: false,
};

export default V5ClusterDetailTableNodePoolScaling;
