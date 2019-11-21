import { Code } from 'styles/index';
import { LineDiv, WrapperDiv } from './WorkerNodesAzure';
import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React from 'react';
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
        <div>
          {instanceType && instanceType.cpu_cores} CPUs,{' '}
          {instanceType && instanceType.memory_size_gb.toFixed(0)} GB RAM
        </div>
      </LineDiv>
      <LineDiv>
        <div>Scaling</div>
        <div style={{ marginRight: '30px' }}>
          {scaling && scaling.min === scaling.max
            ? `Pinned at ${scaling.min}`
            : `Autoscaling between ${scaling.min} and ${scaling.max}`}
        </div>
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
      <LineDiv data-testid='desired-nodes'>
        <div>Desired number</div>
        <div>{workerNodesDesired && workerNodesDesired}</div>
      </LineDiv>
      <LineDiv data-testid='running-nodes'>
        <div>Current number</div>
        <div>{workerNodesRunning && workerNodesRunning}</div>
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
