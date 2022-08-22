import { Box, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';

export const TitleWrapper = styled(Box)``;

const Title = styled(Text)`
  text-transform: uppercase;
`;

interface IClusterDetailAppListWidgetProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  title: string;
  titleColor?: string;
  contentProps?: React.ComponentPropsWithoutRef<typeof Box>;
}

const ClusterDetailAppListWidget: React.FC<
  React.PropsWithChildren<IClusterDetailAppListWidgetProps>
> = ({ title, titleColor = 'text-weak', children, contentProps, ...props }) => {
  return (
    <Box
      pad={{ horizontal: 'xsmall' }}
      direction='column'
      aria-label={title}
      {...props}
    >
      <TitleWrapper margin={{ right: 'medium' }}>
        <Title color={titleColor} size='small'>
          {title}
        </Title>
      </TitleWrapper>
      <Box {...contentProps}>{children}</Box>
    </Box>
  );
};

export default ClusterDetailAppListWidget;
