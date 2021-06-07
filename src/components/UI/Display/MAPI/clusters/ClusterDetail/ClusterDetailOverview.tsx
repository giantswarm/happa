import { Box } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';

import { IClusterItem } from '../types';
import ClusterDetailOverviewDelete from './ClusterDetailOverviewDelete';
import ClusterDetailWidgetCreated from './ClusterDetailWidgetCreated';
import ClusterDetailWidgetKubernetesAPI from './ClusterDetailWidgetKubernetesAPI';

interface IClusterDetailOverviewProps extends IClusterItem {
  onDelete: () => Promise<void>;
  gettingStartedPath: string;
}

const ClusterDetailOverview: React.FC<IClusterDetailOverviewProps> = ({
  onDelete,
  gettingStartedPath,
  name,
  creationDate,
  k8sApiURL,
}) => {
  const isLoading = typeof name === 'undefined';

  return (
    <Box direction='column' gap='small'>
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
  name: PropTypes.string,
  creationDate: PropTypes.string,
  k8sApiURL: PropTypes.string,
};

export default ClusterDetailOverview;
