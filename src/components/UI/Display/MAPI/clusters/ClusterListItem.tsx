import { Box, Card, CardBody, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
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

  &[aria-disabled='true'] {
    cursor: default;

    :hover,
    :focus {
      box-shadow: none;
    }
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
  workerNodesError: string;
}

const ClusterListItem: React.FC<IClusterListItemProps> = ({
  href,
  name,
  description,
  releaseVersion,
  k8sVersion,
  creationDate,
  deletionDate,
  workerNodePoolsCount,
  workerNodesCPU,
  workerNodesCount,
  workerNodesMemory,
  workerNodesError,
  ...props
}) => {
  const isDeleting = deletionDate !== null;
  const hasError = workerNodesError.length > 0;

  return (
    <StyledLink
      to={isDeleting ? '' : href}
      aria-label={name}
      aria-disabled={isDeleting}
      tabIndex={isDeleting ? -1 : 0}
    >
      <Card
        direction='row'
        elevation='none'
        overflow='visible'
        background={isDeleting ? 'background-back' : 'background-front'}
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

            {isDeleting && (
              <Text color='text-xweak'>
                Deleted {relativeDate(deletionDate!)}
              </Text>
            )}

            {!isDeleting && (
              <ClusterListItemMainInfo
                creationDate={creationDate}
                releaseVersion={releaseVersion}
                k8sVersion={k8sVersion}
              />
            )}

            {!hasError && !isDeleting && (
              <ClusterListItemNodeInfo
                workerNodePoolsCount={workerNodePoolsCount}
                workerNodesCPU={workerNodesCPU}
                workerNodesCount={workerNodesCount}
                workerNodesMemory={workerNodesMemory}
              />
            )}

            {hasError && !isDeleting && (
              <Text color='status-critical'>{workerNodesError}</Text>
            )}
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
  workerNodesError: PropTypes.string.isRequired,
  deletionDate: PropTypes.string,
  releaseVersion: PropTypes.string.isRequired,
  k8sVersion: PropTypes.string,
  workerNodePoolsCount: PropTypes.number,
  workerNodesCPU: PropTypes.number,
  workerNodesCount: PropTypes.number,
  workerNodesMemory: PropTypes.number,
};

export default ClusterListItem;
