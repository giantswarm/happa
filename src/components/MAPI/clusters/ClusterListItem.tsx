import { Box, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import ClusterListItemDetails from './ClusterListItemDetails';

const StyledDot = styled(Dot)`
  padding-left: 0;
`;

interface IClusterListItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  cluster: capiv1alpha3.ICluster;
}

const ClusterListItem: React.FC<IClusterListItemProps> = ({
  cluster,
  ...props
}) => {
  const description = capiv1alpha3.getClusterDescription(cluster);
  const releaseVersion = capiv1alpha3.getReleaseVersion(cluster);

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
          <ClusterIDLabel
            clusterID={cluster.metadata.name}
            copyEnabled={true}
          />
        </Text>
      </Box>
      <Box>
        <Box>
          <RefreshableLabel value={description}>
            <Text weight='bold' size='large'>
              {description}
            </Text>
          </RefreshableLabel>
        </Box>
        <Box direction='row' align='center'>
          <RefreshableLabel value={releaseVersion}>
            <Text>
              <i
                className='fa fa-version-tag'
                title='Release version'
                role='presentation'
              />{' '}
              {releaseVersion}
            </Text>
          </RefreshableLabel>
          <StyledDot />
          <Text>
            Created {relativeDate(cluster.metadata.creationTimestamp)}
          </Text>
        </Box>

        <ClusterListItemDetails cluster={cluster} />
      </Box>
    </Box>
  );
};

ClusterListItem.propTypes = {
  // @ts-expect-error
  cluster: PropTypes.object.isRequired,
};

export default ClusterListItem;
