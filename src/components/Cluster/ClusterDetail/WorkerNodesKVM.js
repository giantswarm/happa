import PropTypes from 'prop-types';
import React from 'react';
import { FallbackMessages } from 'shared/constants';
import { FallbackSpan } from 'styles';
import Button from 'UI/Button';
import RefreshableLabel from 'UI/RefreshableLabel';
import { isClusterCreating } from 'utils/clusterUtils';

import { LineDiv, ScalingNodeCounter, WrapperDiv } from './WorkerNodesAzure';

function WorkerNodesKVM({ cluster, worker, nodes, showScalingModal }) {
  const nodeSpecText = worker
    ? `${worker.cpu.cores} CPUs, ${worker.memory.size_gb} GB RAM`
    : '0 CPUs, 0 GB RAM';

  const nodeCount = nodes || 'n/a';

  return (
    <WrapperDiv>
      <LineDiv>
        <div>Node spec</div>
        <RefreshableLabel value={nodeSpecText}>{nodeSpecText}</RefreshableLabel>
      </LineDiv>
      <LineDiv>
        <div>Nodes</div>
        <ScalingNodeCounter value={nodeCount}>
          {nodeCount === 0 && isClusterCreating(cluster) ? (
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

WorkerNodesKVM.propTypes = {
  cluster: PropTypes.object,
  worker: PropTypes.object,
  nodes: PropTypes.number,
  showScalingModal: PropTypes.func,
};

export default WorkerNodesKVM;
