import { LineDiv, WrapperDiv } from './WorkerNodesAzure';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React from 'react';
import RefreshableLabel from 'UI/RefreshableLabel';

function WorkerNodesKVM({ worker, nodes, showScalingModal }) {
  const nodeSpecText = worker
    ? `${worker.cpu.cores} CPUs, ${worker.memory.size_gb} GB RAM`
    : '0 CPUs, 0 GB RAM';

  return (
    <WrapperDiv>
      <LineDiv>
        <div>Node spec</div>
        <RefreshableLabel value={nodeSpecText}>{nodeSpecText}</RefreshableLabel>
      </LineDiv>
      <LineDiv>
        <div>Nodes</div>
        <div style={{ marginRight: '30px' }}>
          {nodes && <RefreshableLabel value={nodes}>{nodes}</RefreshableLabel>}
        </div>
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
