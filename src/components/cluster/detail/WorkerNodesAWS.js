import { Code } from 'styles/index';
import { LineDiv, WrapperDiv } from './WorkerNodesAzure';
import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React from 'react';
import RefreshableLabel from 'UI/RefreshableLabel';
import theme from 'styles/theme';

function WorkerNodesAWS({
  az,
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

  // TODO remove after checks
  const workerNodesDesiredText =
    workerNodesDesired !== undefined ? workerNodesDesired : 0;
  const workerNodesRunningText =
    workerNodesRunning !== undefined ? workerNodesRunning : 0;

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
        <Code style={{ background: theme.colors.shade7, marginRight: '10px' }}>
          {instanceName && instanceName}
        </Code>
        <RefreshableLabel value={instanceTypeText}>
          {instanceTypeText}
        </RefreshableLabel>
      </LineDiv>
      <LineDiv>
        <div>Scaling</div>
        <RefreshableLabel value={scalingText} style={{ marginRight: '25px' }}>
          {scalingText}
        </RefreshableLabel>
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
      <LineDiv data-testid='desired-nodes'>
        <div>Desired number</div>
        <RefreshableLabel value={workerNodesDesiredText}>
          {workerNodesDesired}
        </RefreshableLabel>
      </LineDiv>
      <LineDiv data-testid='running-nodes'>
        <div>Current number</div>
        <RefreshableLabel value={workerNodesRunningText}>
          {workerNodesRunning}
        </RefreshableLabel>
      </LineDiv>
    </WrapperDiv>
  );
}

WorkerNodesAWS.propTypes = {
  az: PropTypes.array,
  instanceName: PropTypes.string,
  instanceType: PropTypes.object,
  scaling: PropTypes.object,
  showScalingModal: PropTypes.func,
  workerNodesDesired: PropTypes.number,
  workerNodesRunning: PropTypes.number,
};

export default WorkerNodesAWS;
