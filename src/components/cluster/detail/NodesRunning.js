import { Dot } from 'styles';
import PropTypes from 'prop-types';
import React from 'react';

const NodesRunning = ({ workerNodesRunning, RAM, CPUs, nodePools }) => {
  const nodeSingularPlural = workerNodesRunning === 1 ? ' node' : ' nodes';
  const npSingularPlural =
    nodePools.length === 1 ? ' node pool' : ' node pools';

  return (
    <div>
      {!workerNodesRunning ? (
        <span>0 nodes</span>
      ) : (
        <>
          <span>
            {`${workerNodesRunning} ${nodeSingularPlural} `}
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
  RAM: PropTypes.number,
  CPUs: PropTypes.number,
  nodePools: PropTypes.array,
};

export default NodesRunning;
