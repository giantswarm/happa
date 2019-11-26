import { Dot } from 'styles';
import PropTypes from 'prop-types';
import React from 'react';

const NodesRunning = ({ workerNodesRunning, RAM, CPUs, nodePools }) => {
  return (
    <div>
      {!workerNodesRunning ? (
        <span>0 nodes</span>
      ) : (
        <>
          <span>
            {workerNodesRunning}
            {workerNodesRunning === 1 ? ' node' : ' nodes'}
            {nodePools &&
              ` in ${nodePools.length}${
                nodePools.length === 1 ? ' node pool' : ' node pools'
              }`}
          </span>
          <span>
            <Dot />
            {this.state.RAM} GB RAM
          </span>
          <span>
            <Dot />
            {this.state.CPUs} CPUs
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
