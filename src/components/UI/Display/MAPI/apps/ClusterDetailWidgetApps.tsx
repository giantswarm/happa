import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import ClusterDetailCounter from '../clusters/ClusterDetail/ClusterDetailCounter';
import ClusterDetailWidget from '../clusters/ClusterDetail/ClusterDetailWidget';
import { IClusterItem } from '../clusters/types';

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.global.colors['input-highlight']};
`;

interface IClusterDetailWidgetAppsProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
      'title'
    >,
    Pick<IClusterItem, 'appsCount' | 'appsUniqueCount' | 'appsDeployedCount'> {
  appsPath: string;
}

const ClusterDetailWidgetApps: React.FC<IClusterDetailWidgetAppsProps> = ({
  appsPath,
  appsCount,
  appsUniqueCount,
  appsDeployedCount,
  ...props
}) => {
  const hasNoApps = typeof appsCount === 'number' && appsCount === 0;

  return (
    <ClusterDetailWidget
      title='Apps'
      contentProps={{
        direction: 'row',
        gap: 'small',
        wrap: true,
      }}
      {...props}
    >
      {hasNoApps && (
        <Box pad={{ bottom: 'xsmall' }}>
          <Text margin={{ bottom: 'small' }}>No apps installed</Text>
          <Text size='small'>
            To find apps to install, browse our{' '}
            <StyledLink to={appsPath}>apps</StyledLink>.
          </Text>
        </Box>
      )}

      {!hasNoApps && (
        <>
          <ClusterDetailCounter
            label='app'
            pluralize={true}
            value={appsCount}
          />
          <ClusterDetailCounter
            label='unique app'
            pluralize={true}
            value={appsUniqueCount}
          />
          <ClusterDetailCounter label='deployed' value={appsDeployedCount} />
        </>
      )}
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetApps.propTypes = {
  appsPath: PropTypes.string.isRequired,
  appsCount: PropTypes.number,
  appsUniqueCount: PropTypes.number,
  appsDeployedCount: PropTypes.number,
};

export default ClusterDetailWidgetApps;
