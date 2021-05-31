import { Box, Card, CardBody, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import ClusterListItemMainInfo from './ClusterListItemMainInfo';
import ClusterListItemNodeInfo from './ClusterListItemNodeInfo';
import { IClusterItem } from './types';

const StyledLink = styled(Link)`
  transition: box-shadow 0.1s ease-in-out;
  display: block;
  border-radius: ${(props) => props.theme.rounding}px;

  :hover,
  :focus {
    text-decoration: none;
    outline: none;
    box-shadow: ${(props) =>
      `0 0 0 1px ${props.theme.global.colors.text.dark}`};
  }
`;

const StyledRefreshableLabel = styled(RefreshableLabel)`
  padding: 0;
  margin: 0;
`;

interface IClusterListItemProps
  extends IClusterItem,
    React.ComponentPropsWithoutRef<typeof Card> {
  href: string;
}

const ClusterListItem: React.FC<IClusterListItemProps> = ({
  href,
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
    <StyledLink to={href} aria-label={name}>
      <Card
        direction='row'
        elevation='none'
        overflow='visible'
        background='background-front'
        round='xsmall'
        pad='medium'
        gap='small'
        {...props}
      >
        <CardBody direction='row' gap='xsmall'>
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
        </CardBody>
      </Card>
    </StyledLink>
  );
};

ClusterListItem.propTypes = {
  href: PropTypes.string.isRequired,
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
