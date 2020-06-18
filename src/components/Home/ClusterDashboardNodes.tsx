import PropTypes from 'prop-types';
import React from 'react';
import { FallbackMessages } from 'shared/constants';
import { FallbackSpan } from 'styles';
import { isClusterCreating } from 'utils/clusterUtils';

interface IClusterDashboardNodesProps {
  numberOfNodes: number;
  cluster: Record<string, never>;
}

// This component outputs 'Nodes not ready' or the actual number of nodes in the cluster.
const ClusterDashboardNodes: React.FC<IClusterDashboardNodesProps> = ({
  numberOfNodes,
  cluster,
}) => {
  // If it was created more than an hour ago, then we should not show this message
  // because something went wrong, so it's best to make it noticeable.
  if (numberOfNodes === 0 && isClusterCreating(cluster))
    return <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>;

  return (
    <span>{`${numberOfNodes} ${numberOfNodes === 1 ? 'node' : 'nodes'}`}</span>
  );
};

ClusterDashboardNodes.propTypes = {
  numberOfNodes: PropTypes.number.isRequired,
  // @ts-ignore
  cluster: PropTypes.object.isRequired,
};

export default ClusterDashboardNodes;
