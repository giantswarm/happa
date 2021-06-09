import { Box } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';

import { IClusterItem } from '../types';
import ClusterDetailOverviewDelete from './ClusterDetailOverviewDelete';
import ClusterDetailWidgetCreated from './ClusterDetailWidgetCreated';
import ClusterDetailWidgetKubernetesAPI from './ClusterDetailWidgetKubernetesAPI';
import ClusterDetailWidgetLabels from './ClusterDetailWidgetLabels';

interface IClusterDetailOverviewProps extends IClusterItem {
  onDelete: () => Promise<void>;
  gettingStartedPath: string;
  labelsOnChange: React.ComponentPropsWithoutRef<
    typeof ClusterDetailWidgetLabels
  >['onChange'];
  labelsErrorMessage?: string;
  labelsIsLoading?: boolean;
}

const ClusterDetailOverview: React.FC<IClusterDetailOverviewProps> = ({
  onDelete,
  gettingStartedPath,
  name,
  creationDate,
  k8sApiURL,
  labels,
  labelsOnChange,
  labelsErrorMessage,
  labelsIsLoading,
}) => {
  const isLoading = typeof name === 'undefined';

  return (
    <Box direction='column' gap='small'>
      <ClusterDetailWidgetLabels
        labels={labels}
        onChange={labelsOnChange}
        errorMessage={labelsErrorMessage}
        isLoading={labelsIsLoading}
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
  labelsOnChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  creationDate: PropTypes.string,
  k8sApiURL: PropTypes.string,
  labels: PropTypes.object as PropTypes.Requireable<
    IClusterDetailOverviewProps['labels']
  >,
  labelsErrorMessage: PropTypes.string,
  labelsIsLoading: PropTypes.bool,
};

export default ClusterDetailOverview;
