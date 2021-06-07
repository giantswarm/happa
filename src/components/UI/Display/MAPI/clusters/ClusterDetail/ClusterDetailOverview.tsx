import { Box } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';

import { IClusterItem } from '../types';
import ClusterDetailOverviewDelete from './ClusterDetailOverviewDelete';
import ClusterDetailWidgetCreated from './ClusterDetailWidgetCreated';

interface IClusterDetailOverviewProps extends IClusterItem {
  onDelete: () => Promise<void>;
}

const ClusterDetailOverview: React.FC<IClusterDetailOverviewProps> = ({
  onDelete,
  name,
  creationDate,
}) => {
  const isLoading = typeof name === 'undefined';

  return (
    <Box>
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
  name: PropTypes.string,
  creationDate: PropTypes.string,
};

export default ClusterDetailOverview;
