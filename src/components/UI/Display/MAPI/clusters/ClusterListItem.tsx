import differenceInHours from 'date-fns/fp/differenceInHours';
import toDate from 'date-fns-tz/toDate';
import { Box, Card, CardBody, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';

import ClusterListItemMainInfo from './ClusterListItemMainInfo';
import ClusterListItemNodeInfo from './ClusterListItemNodeInfo';
import ClusterListItemOptionalValue from './ClusterListItemOptionalValue';
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

const GetStartedButton = styled(Button)`
  text-transform: uppercase;
`;

interface IClusterListItemProps
  extends IClusterItem,
    React.ComponentPropsWithoutRef<typeof Card> {
  href: string;
  workerNodesError: string;
  onGetStartedClick: () => void;
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
  onGetStartedClick,
  ...props
}) => {
  const isDeleting = Boolean(deletionDate);
  const hasError = workerNodesError.length > 0;
  const isLoading = typeof name === 'undefined';

  const displayGetStarted = useMemo(() => {
    if (isDeleting || isLoading || !creationDate) return false;

    const createDate = toDate(creationDate, { timeZone: 'UTC' });
    const age = differenceInHours(createDate)(new Date());

    // Cluster is older than 30 days.
    // eslint-disable-next-line no-magic-numbers
    return age < 30 * 24;
  }, [creationDate, isDeleting, isLoading]);

  const handleOnGetStartedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    onGetStartedClick?.();
  };

  return (
    <StyledLink
      to={isDeleting || isLoading ? '' : href}
      aria-label={name}
      aria-disabled={isDeleting || isLoading}
      tabIndex={isDeleting || isLoading ? -1 : 0}
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
        <CardBody direction='row' gap='xsmall' wrap={true}>
          <Box>
            <ClusterListItemOptionalValue value={name}>
              {(value) => (
                <Text size='large'>
                  <ClusterIDLabel
                    clusterID={value as string}
                    copyEnabled={true}
                  />
                </Text>
              )}
            </ClusterListItemOptionalValue>
          </Box>
          <Box basis='80%'>
            <Box>
              <ClusterListItemOptionalValue value={description}>
                {(value) => (
                  <Text weight='bold' size='large'>
                    {value}
                  </Text>
                )}
              </ClusterListItemOptionalValue>
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

          {displayGetStarted && (
            <Box basis='10%'>
              <GetStartedButton onClick={handleOnGetStartedClick}>
                <i
                  className='fa fa-start'
                  aria-hidden={true}
                  role='presentation'
                />
                Get Started
              </GetStartedButton>
            </Box>
          )}
        </CardBody>
      </Card>
    </StyledLink>
  );
};

ClusterListItem.propTypes = {
  href: PropTypes.string.isRequired,
  workerNodesError: PropTypes.string.isRequired,
  onGetStartedClick: PropTypes.func.isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
  creationDate: PropTypes.string,
  deletionDate: PropTypes.string,
  releaseVersion: PropTypes.string,
  k8sVersion: PropTypes.string,
  workerNodePoolsCount: PropTypes.number,
  workerNodesCPU: PropTypes.number,
  workerNodesCount: PropTypes.number,
  workerNodesMemory: PropTypes.number,
};

export default ClusterListItem;
