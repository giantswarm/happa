import PropTypes from 'prop-types';
import React, { FC } from 'react';
import { FallbackMessages } from 'shared/constants';
import { Dot, FallbackSpan } from 'styles';

interface INodesRunningProps {
  CPUs: number;
  RAM: number;
  isClusterCreating: boolean;
  workerNodesRunning: number;
  numNodePools?: number;
}

const NodesRunning: FC<INodesRunningProps> = ({
  CPUs,
  RAM,
  isClusterCreating,
  numNodePools,
  workerNodesRunning,
}) => {
  if (workerNodesRunning === 0 && isClusterCreating) {
    return (
      <div data-testid='nodes-running'>
        <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>
      </div>
    );
  }

  const nodesSingularPlural = workerNodesRunning === 1 ? ' node' : ' nodes';
  const npSingularPlural = numNodePools === 1 ? ' node pool' : ' node pools';

  return (
    <div data-testid='nodes-running'>
      <span>
        {`${workerNodesRunning} ${nodesSingularPlural}`}
        {numNodePools && ` in ${numNodePools} ${npSingularPlural}`}
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
  CPUs: PropTypes.number.isRequired,
  RAM: PropTypes.number.isRequired,
  isClusterCreating: PropTypes.bool.isRequired,
  workerNodesRunning: PropTypes.number.isRequired,
  numNodePools: PropTypes.number,
};

export default NodesRunning;
