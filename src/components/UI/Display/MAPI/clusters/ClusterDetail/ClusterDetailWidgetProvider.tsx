import { Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';

import { IClusterItem } from '../types';
import ClusterDetailWidget from './ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from './ClusterDetailWidgetOptionalValue';

const StyledDot = styled(Dot)`
  padding: 0;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => theme.global.colors['text-weak'].dark};
`;

interface IClusterDetailWidgetProviderProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
      'title'
    >,
    Pick<IClusterItem, 'region' | 'accountID'> {
  regionLabel?: string;
  accountIDLabel?: string;
  accountIDPath?: string;
}

const ClusterDetailWidgetProvider: React.FC<IClusterDetailWidgetProviderProps> = ({
  regionLabel,
  accountIDLabel,
  region,
  accountID,
  accountIDPath,
  ...props
}) => {
  return (
    <ClusterDetailWidget
      title='Provider'
      inline={true}
      contentProps={{
        direction: 'row',
        gap: 'xsmall',
        wrap: true,
        align: 'center',
      }}
      {...props}
    >
      <ClusterDetailWidgetOptionalValue value={regionLabel} loaderWidth={85}>
        {(value) => <Text>{value}</Text>}
      </ClusterDetailWidgetOptionalValue>
      <ClusterDetailWidgetOptionalValue value={region} loaderWidth={80}>
        {(value) => (
          <Text>
            <code>{value}</code>
          </Text>
        )}
      </ClusterDetailWidgetOptionalValue>
      <StyledDot />
      <ClusterDetailWidgetOptionalValue value={accountIDLabel}>
        {(value) => <Text>{value}</Text>}
      </ClusterDetailWidgetOptionalValue>
      <ClusterDetailWidgetOptionalValue value={accountID} loaderWidth={300}>
        {(value) => (
          <StyledLink
            color='text-weak'
            href={accountIDPath}
            rel='noopener noreferrer'
            target='_blank'
          >
            <code>{value}</code>
            <i
              className='fa fa-open-in-new'
              aria-hidden={true}
              role='presentation'
            />
          </StyledLink>
        )}
      </ClusterDetailWidgetOptionalValue>
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetProvider.propTypes = {
  regionLabel: PropTypes.string,
  accountIDLabel: PropTypes.string,
  accountIDPath: PropTypes.string,
  region: PropTypes.string,
  accountID: PropTypes.string,
};

export default ClusterDetailWidgetProvider;
