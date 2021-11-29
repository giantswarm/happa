import { Box, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';

const Title = styled(Text)`
  text-transform: uppercase;
`;

interface IClusterDetailAppListWidgetProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  title: string;
  contentProps?: React.ComponentPropsWithoutRef<typeof Box>;
}

const ClusterDetailAppListWidget: React.FC<
  IClusterDetailAppListWidgetProps
> = ({ title, children, contentProps, ...props }) => {
  return (
    <Box pad='xsmall' direction='column' aria-label={title} {...props}>
      <Box>
        <Title color='text-weak' size='small'>
          {title}
        </Title>
      </Box>
      <Box {...contentProps}>{children}</Box>
    </Box>
  );
};

export default ClusterDetailAppListWidget;
