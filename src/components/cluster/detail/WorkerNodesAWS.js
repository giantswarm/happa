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
        <RefreshableLabel value={(instanceType.cpu_cores, instanceType.memory)}>
          {instanceType && instanceType.cpu_cores} CPUs,{' '}
          {instanceType && instanceType.memory_size_gb.toFixed(0)} GB RAM
        </RefreshableLabel>
      </LineDiv>
      <LineDiv>
        <div>Scaling</div>
        <RefreshableLabel
          dataItems={[scaling.min, scaling.max]}
          style={{ marginRight: '25px' }}
        >
          {scaling && scaling.min === scaling.max
            ? `Pinned at ${scaling.min}`
            : `Autoscaling between ${scaling.min} and ${scaling.max}`}
        </RefreshableLabel>
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
      <LineDiv data-testid='desired-nodes'>
        <div>Desired number</div>
        {workerNodesDesired !== undefined && (
          <RefreshableLabel value={[workerNodesDesired]}>
            {workerNodesDesired}
          </RefreshableLabel>
        )}
      </LineDiv>
      <LineDiv data-testid='running-nodes'>
        <div>Current number</div>
        {workerNodesRunning !== undefined && (
          <RefreshableLabel value={[workerNodesRunning]}>
            {workerNodesRunning}
          </RefreshableLabel>
        )}
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
