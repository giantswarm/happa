import { Box, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
import { HttpClientImpl } from 'model/clients/HttpClient';
import {
  getClusterList,
  getClusterListKey,
} from 'model/services/mapi/clusters/getClusterList';
import {
  getClusterName,
  getReleaseVersion,
} from 'model/services/mapi/clusters/key';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { getCPAuthUser } from 'stores/cpauth/selectors';
import styled from 'styled-components';
import { Dot } from 'styles';
import useSWR from 'swr';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

const StyledDot = styled(Dot)`
  padding-left: 0;
`;

interface IClusterListProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

// TODO(axbarsan): Create a hook for this;
const client = new HttpClientImpl();

const ClusterList: React.FC<IClusterListProps> = () => {
  const user = useSelector(getCPAuthUser);
  const { data, error, isValidating } = useSWR(
    getClusterListKey(user),
    getClusterList(client, user!)
  );

  if (!user) {
    return <div>Not authenticated</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Initial load.
  if (!data) {
    return <div>Loading...</div>;
  }

  // Initial and other loads.
  if (isValidating) {
    return <div>Loading...</div>;
  }

  return (
    <Box direction='column' gap='medium'>
      {data.items.map((cluster) => {
        const name = getClusterName(cluster);
        const releaseVersion = getReleaseVersion(cluster);

        return (
          <Box
            key={cluster.metadata.name}
            direction='row'
            background='background-front'
            round='xsmall'
            pad='medium'
            gap='small'
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
                <RefreshableLabel value={name}>
                  <Text weight='bold' size='large'>
                    {name}
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
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ClusterList;
