import { LineDiv, WrapperDiv } from './WorkerNodesAzure';
import Button from 'UI/Button';
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
        {nodes && nodes !== 0 && (
          <RefreshableLabel value={nodes} style={{ marginRight: '25px' }}>
            {nodes}
          </RefreshableLabel>
        )}
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
