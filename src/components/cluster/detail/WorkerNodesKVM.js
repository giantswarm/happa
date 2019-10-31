import { LineDiv, WrapperDiv } from './WorkerNodesAzure';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React from 'react';

function WorkerNodesKVM({ worker, nodes, showScalingModal }) {
  return (
    <WrapperDiv>
      <LineDiv>
        <div>Node spec</div>
        <div>
          {worker && worker.cpu.cores} CPUs, {worker && worker.memory.size_gb}{' '}
          GB RAM
        </div>
      </LineDiv>
      <LineDiv>
        <div>Nodes</div>
        <div style={{ marginRight: '30px' }}>{nodes && nodes}</div>
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
    </WrapperDiv>
  );
}

WorkerNodesKVM.propTypes = {
  worker: PropTypes.object,
  nodes: PropTypes.number,
  showScalingModal: PropTypes.func,
};

export default WorkerNodesKVM;
