import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { FallbackMessages } from 'shared/constants';
import { Dot } from 'styles';
import { isClusterYoungerThanOneHour } from 'utils/clusterUtils';

const FallbackSpan = styled.span`
  opacity: 0.5;
`;

const NodesRunning = ({
  workerNodesRunning,
  createDate,
  RAM,
  CPUs,
  nodePools,
}) => {
  //  If it was created more than an hour ago, then we should not show this message
  //  because something went wrong, so it's best to make it noticeable.
  if (workerNodesRunning === 0 && isClusterYoungerThanOneHour(createDate)) {
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
  workerNodesRunning: PropTypes.number,
  createDate: PropTypes.string,
  // TODO Change this when cluster_utils functions are refactored
  RAM: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  CPUs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  nodePools: PropTypes.array,
};

export default NodesRunning;
