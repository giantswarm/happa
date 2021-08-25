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
  if (isClusterCreating) {
    return (
      <div data-testid='nodes-running'>
        <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>
      </div>
    );
  }

  const nodesSingularPlural = workerNodesRunning === 1 ? ' node' : ' nodes';
  const npSingularPlural = numNodePools === 1 ? ' node pool' : ' node pools';

  let workerNodesStatus = `${workerNodesRunning} ${nodesSingularPlural}`;
  if (numNodePools) {
    workerNodesStatus += ` in ${numNodePools} ${npSingularPlural}`;
  }

  return (
    <div data-testid='nodes-running'>
      <span>{workerNodesStatus}</span>
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

export default NodesRunning;
