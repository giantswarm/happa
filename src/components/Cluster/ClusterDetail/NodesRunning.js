import PropTypes from 'prop-types';
import React from 'react';
import { FallbackMessages } from 'shared/constants';
import { Dot, FallbackSpan } from 'styles';

const NodesRunning = ({
  isClusterCreating,
  workerNodesRunning,
  RAM,
  CPUs,
  nodePools,
}) => {
  if (workerNodesRunning === 0 && isClusterCreating) {
    return (
      <div data-testid='nodes-running'>
        <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>
      </div>
    );
  }

  const nodesSingularPlural = workerNodesRunning === 1 ? ' node' : ' nodes';
  const npSingularPlural =
    nodePools && nodePools.length === 1 ? ' node pool' : ' node pools';

  return (
    <div data-testid='nodes-running'>
      <span>
        {`${workerNodesRunning} ${nodesSingularPlural}`}
        {nodePools && ` in ${nodePools.length} ${npSingularPlural}`}
      </span>
      <span>
        <Dot />
        {RAM} GB RAM
      </span>
      <span>
        <Dot />
        {CPUs} CPUs
      </span>
    </div>
  );
};

NodesRunning.propTypes = {
  isClusterCreating: PropTypes.bool,
  workerNodesRunning: PropTypes.number,
  // TODO Change this when cluster_utils functions are refactored
  RAM: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  CPUs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  nodePools: PropTypes.array,
};

export default NodesRunning;
