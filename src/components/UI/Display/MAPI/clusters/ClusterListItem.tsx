import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import ClusterListItemMainInfo from './ClusterListItemMainInfo';
import ClusterListItemNodeInfo from './ClusterListItemNodeInfo';
import { IClusterItem } from './types';

const StyledRefreshableLabel = styled(RefreshableLabel)`
  padding: 0;
  margin: 0;
`;

interface IClusterListItemProps
  extends IClusterItem,
    React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterListItem: React.FC<IClusterListItemProps> = ({
  name,
  description,
  releaseVersion,
  k8sVersion,
  creationDate,
  workerNodePoolsCount,
  workerNodesCPU,
  workerNodesCount,
  workerNodesMemory,
  ...props
}) => {
  return (
    <Box
      direction='row'
      background='background-front'
      round='xsmall'
      pad='medium'
      gap='small'
      {...props}
    >
      <Box>
        <Text size='large'>
          <ClusterIDLabel clusterID={name} copyEnabled={true} />
        </Text>
      </Box>
      <Box>
        <Box>
          {/* @ts-expect-error */}
          <StyledRefreshableLabel value={description}>
            <Text weight='bold' size='large'>
              {description}
            </Text>
          </StyledRefreshableLabel>
        </Box>
        <ClusterListItemMainInfo
          creationDate={creationDate}
          releaseVersion={releaseVersion}
          k8sVersion={k8sVersion}
        />
        <ClusterListItemNodeInfo
          workerNodePoolsCount={workerNodePoolsCount}
          workerNodesCPU={workerNodesCPU}
          workerNodesCount={workerNodesCount}
          workerNodesMemory={workerNodesMemory}
        />
      </Box>
    </Box>
  );
};

ClusterListItem.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  creationDate: PropTypes.string.isRequired,
  releaseVersion: PropTypes.string.isRequired,
  k8sVersion: PropTypes.string,
  workerNodePoolsCount: PropTypes.number,
  workerNodesCPU: PropTypes.number,
  workerNodesCount: PropTypes.number,
  workerNodesMemory: PropTypes.number,
};

export default ClusterListItem;
