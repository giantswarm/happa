import { Card, CardBody, CardHeader, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Title = styled(Text)`
  text-transform: uppercase;
`;

interface IClusterDetailWidgetProps
  extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string;
  inline?: boolean;
  contentProps?: React.ComponentPropsWithoutRef<typeof CardBody>;
}

const ClusterDetailWidget: React.FC<IClusterDetailWidgetProps> = ({
  title,
  children,
  inline,
  contentProps,
  ...props
}) => {
  return (
    <Card
      direction='row'
      elevation='none'
      overflow='visible'
      background='background-front'
      round='xsmall'
      pad='xsmall'
      wrap={true}
      {...props}
    >
      <CardHeader
        basis={inline ? '200px' : '100%'}
        flex={{ grow: 0, shrink: 1 }}
        margin='small'
      >
        <Title color='text-weak'>{title}</Title>
      </CardHeader>
      <CardBody
        basis='200px'
        flex={{ grow: 1, shrink: 0 }}
        margin='small'
        {...contentProps}
      >
        {children}
      </CardBody>
    </Card>
  );
};

ClusterDetailWidget.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  inline: PropTypes.bool,
  contentProps: PropTypes.object as PropTypes.Requireable<
    IClusterDetailWidgetProps['contentProps']
  >,
};

ClusterDetailWidget.defaultProps = {
  inline: false,
};

export default ClusterDetailWidget;
