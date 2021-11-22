import { FallbackMessages } from 'model/constants';
import React from 'react';
import { FallbackSpan } from 'styles';

interface IClusterDashboardNodesProps {
  numberOfNodes: number;
  isClusterCreating: boolean;
}

// This component outputs 'Nodes not ready' or the actual number of nodes in the cluster.
const ClusterDashboardNodes: React.FC<IClusterDashboardNodesProps> = ({
  numberOfNodes,
  isClusterCreating,
}) => {
  if (numberOfNodes === 0 && isClusterCreating)
    return <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>;

  return (
    <span>{`${numberOfNodes} ${numberOfNodes === 1 ? 'node' : 'nodes'}`}</span>
  );
};

export default ClusterDashboardNodes;
