import PropTypes from 'prop-types';
import React from 'react';
import { Dot } from 'styles';

const NodesRunning = ({ workerNodesRunning, RAM, CPUs, nodePools }) => {
  const nodesSingularPlural = workerNodesRunning === 1 ? ' node' : ' nodes';
  const npSingularPlural =
    nodePools && nodePools.length === 1 ? ' node pool' : ' node pools';

  return (
    <div data-testid='nodes-running'>
      {!workerNodesRunning ? (
        <span>0 nodes</span>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

NodesRunning.propTypes = {
  workerNodesRunning: PropTypes.number,
  // TODO Change this when cluster_utils functions are refactored
  RAM: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  CPUs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  nodePools: PropTypes.array,
};

export default NodesRunning;
