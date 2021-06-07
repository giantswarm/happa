import { Text } from 'grommet';
import { formatDate, relativeDate } from 'lib/helpers';
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

interface IClusterDetailWidgetCreatedProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
      'title'
    >,
    Pick<IClusterItem, 'creationDate'> {}

const ClusterDetailWidgetCreated: React.FC<IClusterDetailWidgetCreatedProps> = ({
  creationDate,
  ...props
}) => {
  return (
    <ClusterDetailWidget
      title='Created'
      inline={true}
      contentProps={{
        direction: 'row',
        gap: 'xsmall',
        wrap: true,
        align: 'center',
      }}
      {...props}
    >
      <ClusterDetailWidgetOptionalValue value={creationDate}>
        {(value) => <Text>{relativeDate(value as string)}</Text>}
      </ClusterDetailWidgetOptionalValue>
      <StyledDot />
      <ClusterDetailWidgetOptionalValue value={creationDate} loaderWidth={150}>
        {(value) => <Text>{formatDate(value as string)}</Text>}
      </ClusterDetailWidgetOptionalValue>
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetCreated.propTypes = {
  creationDate: PropTypes.string,
};

export default ClusterDetailWidgetCreated;
