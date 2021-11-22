import { Constants, FallbackMessages } from 'model/constants';
import React from 'react';
import { FallbackSpan } from 'styles';
import Button from 'UI/Controls/Button';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import InstanceType from 'UI/Display/Cluster/InstanceType';
import NotAvailable from 'UI/Display/NotAvailable';
import RefreshableLabel from 'UI/Display/RefreshableLabel';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import { LineDiv, ScalingNodeCounter, WrapperDiv } from './WorkerNodesAzure';

function WorkerNodesAWS({
  az,
  isClusterCreating,
  instanceName,
  instanceType,
  scaling,
  showScalingModal,
  workerNodesDesired,
  workerNodesRunning,
}) {
  const instanceTypeText = instanceType
    ? // prettier-ignore
      `${instanceType.cpu_cores} CPUs, ${instanceType.memory_size_gb.toFixed(0)} GB RAM`
    : '0 CPUs, 0 GB RAM';

  const scalingText =
    scaling && scaling.min === scaling.max
      ? `Pinned at ${scaling.min}`
      : `Autoscaling between ${scaling.min} and ${scaling.max}`;

  return (
    <WrapperDiv>
      <LineDiv>
        <div>Availability zones</div>
        <div>
          <AvailabilityZonesLabels zones={az} />
        </div>
      </LineDiv>
      <LineDiv>
        <div>Instance type</div>
        <InstanceType>{instanceName ?? <NotAvailable />}</InstanceType>
        <RefreshableLabel value={instanceTypeText}>
          {instanceTypeText}
        </RefreshableLabel>
      </LineDiv>
      <LineDiv>
        <div>Scaling</div>
        <ScalingNodeCounter value={scalingText}>
          {scalingText}
        </ScalingNodeCounter>
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
      <LineDiv data-testid='desired-nodes'>
        <div>
          Desired number{' '}
          <TooltipContainer
            content={
              <Tooltip id='desired-tooltip'>
                {Constants.DESIRED_NODES_EXPLANATION_AUTOSCALER}
              </Tooltip>
            }
          >
            <i className='fa fa-info' />
          </TooltipContainer>
        </div>
        <RefreshableLabel value={workerNodesDesired}>
          {workerNodesDesired === 0 && isClusterCreating ? (
            <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>
          ) : (
            workerNodesDesired
          )}
        </RefreshableLabel>
      </LineDiv>
      <LineDiv data-testid='running-nodes'>
        <div>Current number</div>
        <RefreshableLabel value={workerNodesRunning}>
          {workerNodesRunning === 0 && isClusterCreating ? (
            <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>
          ) : (
            workerNodesRunning
          )}
        </RefreshableLabel>
      </LineDiv>
    </WrapperDiv>
  );
}

export default WorkerNodesAWS;
