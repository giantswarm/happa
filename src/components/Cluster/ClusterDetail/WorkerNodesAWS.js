import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Constants, FallbackMessages } from 'shared/constants';
import { FallbackSpan } from 'styles';
import AvailabilityZonesLabels from 'UI/AvailabilityZonesLabels';
import Button from 'UI/Button';
import InstanceType from 'UI/InstanceType';
import RefreshableLabel from 'UI/RefreshableLabel';

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
        <InstanceType>{instanceName ?? 'n/a'}</InstanceType>
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
          <OverlayTrigger
            overlay={
              <Tooltip id='desired-tooltip'>
                {Constants.DESIRED_NODES_EXPLANATION}
              </Tooltip>
            }
            placement='top'
          >
            <i className='fa fa-info' />
          </OverlayTrigger>
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

WorkerNodesAWS.propTypes = {
  az: PropTypes.array,
  isClusterCreating: PropTypes.bool,
  instanceName: PropTypes.string,
  instanceType: PropTypes.object,
  scaling: PropTypes.object,
  showScalingModal: PropTypes.func,
  workerNodesDesired: PropTypes.number,
  workerNodesRunning: PropTypes.number,
};

export default WorkerNodesAWS;
