import PropTypes from 'prop-types';
import React from 'react';
import { FallbackMessages } from 'shared/constants';
import { FallbackSpan } from 'styles';
import { isClusterYoungerThanOneHour } from 'utils/clusterUtils';

interface IClusterDashboardNodes {
  numberOfNodes: number;
  createDate: string;
}

// This component outputs 'Nodes not ready' or the actual number of nodes in the cluster.
function ClusterDashboardNodes({
  numberOfNodes,
  createDate,
}: IClusterDashboardNodes): React.ReactElement {
  // If it was created more than an hour ago, then we should not show this message
  // because something went wrong, so it's best to make it noticeable.
  if (numberOfNodes === 0 && isClusterYoungerThanOneHour(createDate))
    return <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>;

  return (
    <span>{`${numberOfNodes} ${numberOfNodes === 1 ? 'node' : 'nodes'}`}</span>
  );
}

ClusterDashboardNodes.propTypes = {
  createDate: PropTypes.string,
  numberOfNodes: PropTypes.number,
};

export default ClusterDashboardNodes;
