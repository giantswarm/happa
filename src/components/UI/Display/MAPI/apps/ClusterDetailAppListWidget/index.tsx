import { Box, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';

const Title = styled(Text)`
  text-transform: uppercase;
`;

interface IClusterDetailAppListWidgetProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  title: string;
  titleWidth?: string;
  titleColor?: string;
  contentProps?: React.ComponentPropsWithoutRef<typeof Box>;
}

const ClusterDetailAppListWidget: React.FC<
  React.PropsWithChildren<IClusterDetailAppListWidgetProps>
> = ({
  title,
  titleWidth,
  titleColor = 'text-weak',
  children,
  contentProps,
  ...props
}) => {
  return (
    <Box
      pad={{ horizontal: 'xsmall' }}
      direction='column'
      aria-label={title}
      {...props}
    >
      <Box width={{ min: titleWidth }} margin={{ right: 'medium' }}>
        <Title color={titleColor} size='small'>
          {title}
        </Title>
      </Box>
      <Box {...contentProps}>{children}</Box>
    </Box>
  );
};

export default ClusterDetailAppListWidget;
