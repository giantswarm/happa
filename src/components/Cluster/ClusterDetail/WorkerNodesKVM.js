import { FallbackMessages } from 'model/constants';
import React from 'react';
import { FallbackSpan } from 'styles';
import Button from 'UI/Controls/Button';
import NotAvailable from 'UI/Display/NotAvailable';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import { LineDiv, ScalingNodeCounter, WrapperDiv } from './WorkerNodesAzure';

function WorkerNodesKVM({
  isClusterCreating,
  worker,
  nodes,
  showScalingModal,
}) {
  const nodeSpecText = worker
    ? `${worker.cpu.cores} CPUs, ${worker.memory.size_gb} GB RAM`
    : '0 CPUs, 0 GB RAM';

  const nodeCount = nodes || <NotAvailable />;

  return (
    <WrapperDiv>
      <LineDiv>
        <div>Node spec</div>
        <RefreshableLabel value={nodeSpecText}>{nodeSpecText}</RefreshableLabel>
      </LineDiv>
      <LineDiv>
        <div>Nodes</div>
        <ScalingNodeCounter value={nodeCount}>
          {nodeCount === 0 && isClusterCreating ? (
            <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>
          ) : (
            nodeCount
          )}
        </ScalingNodeCounter>
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
    </WrapperDiv>
  );
}

export default WorkerNodesKVM;
