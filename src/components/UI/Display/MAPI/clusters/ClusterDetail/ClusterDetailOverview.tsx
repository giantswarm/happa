import { Box } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';

import { IClusterItem } from '../types';
import ClusterDetailOverviewDelete from './ClusterDetailOverviewDelete';
import ClusterDetailWidgetCreated from './ClusterDetailWidgetCreated';
import ClusterDetailWidgetKubernetesAPI from './ClusterDetailWidgetKubernetesAPI';
import ClusterDetailWidgetWorkerNodes from './ClusterDetailWidgetWorkerNodes';

interface IClusterDetailOverviewProps extends IClusterItem {
  onDelete: () => Promise<void>;
  gettingStartedPath: string;
  workerNodesPath: string;
}

const ClusterDetailOverview: React.FC<IClusterDetailOverviewProps> = ({
  onDelete,
  gettingStartedPath,
  workerNodesPath,
  name,
  creationDate,
  k8sApiURL,
  workerNodePoolsCount,
  workerNodesCount,
  workerNodesCPU,
  workerNodesMemory,
}) => {
  const isLoading = typeof name === 'undefined';

  return (
    <Box direction='column' gap='small'>
      <ClusterDetailWidgetWorkerNodes
        workerNodesPath={workerNodesPath}
        workerNodePoolsCount={workerNodePoolsCount}
        workerNodesCount={workerNodesCount}
        workerNodesCPU={workerNodesCPU}
        workerNodesMemory={workerNodesMemory}
      />
      <ClusterDetailWidgetKubernetesAPI
        gettingStartedPath={gettingStartedPath}
        k8sApiURL={k8sApiURL}
      />
      <ClusterDetailWidgetCreated creationDate={creationDate} />
      {!isLoading && (
        <ClusterDetailOverviewDelete
          clusterName={name!}
          onDelete={onDelete}
          border='top'
          margin={{ top: 'medium' }}
        />
      )}
    </Box>
  );
};

ClusterDetailOverview.propTypes = {
  onDelete: PropTypes.func.isRequired,
  gettingStartedPath: PropTypes.string.isRequired,
  workerNodesPath: PropTypes.string.isRequired,
  name: PropTypes.string,
  creationDate: PropTypes.string,
  k8sApiURL: PropTypes.string,
  workerNodePoolsCount: PropTypes.number,
  workerNodesCount: PropTypes.number,
  workerNodesCPU: PropTypes.number,
  workerNodesMemory: PropTypes.number,
};

export default ClusterDetailOverview;
