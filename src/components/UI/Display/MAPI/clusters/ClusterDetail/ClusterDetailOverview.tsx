import { Box, Text } from 'grommet';
import { formatDate, relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';

import { IClusterItem } from '../types';
import ClusterDetailOverviewDelete from './ClusterDetailOverviewDelete';
import ClusterDetailWidget from './ClusterDetailWidget';

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterDetailOverviewProps extends IClusterItem {
  onDelete: () => Promise<void>;
}

const ClusterDetailOverview: React.FC<IClusterDetailOverviewProps> = ({
  onDelete,
  name,
  creationDate,
}) => {
  if (!name || !creationDate) return null;

  return (
    <Box>
      <ClusterDetailWidget title='Created' inline={true}>
        <Text>{relativeDate(creationDate)}</Text>
        <StyledDot />
        <Text>{formatDate(creationDate)}</Text>
      </ClusterDetailWidget>
      <ClusterDetailOverviewDelete
        clusterName={name}
        onDelete={onDelete}
        border='top'
        margin={{ top: 'medium' }}
      />
    </Box>
  );
};

ClusterDetailOverview.propTypes = {
  onDelete: PropTypes.func.isRequired,
  name: PropTypes.string,
  creationDate: PropTypes.string,
};

export default ClusterDetailOverview;
