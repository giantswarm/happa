import PropTypes from 'prop-types';
import React from 'react';
import { FallbackMessages } from 'shared/constants';
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

ClusterDashboardNodes.propTypes = {
  numberOfNodes: PropTypes.number.isRequired,
  isClusterCreating: PropTypes.bool.isRequired,
};

export default ClusterDashboardNodes;
