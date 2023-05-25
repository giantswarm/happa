import { Box, BoxProps, Heading } from 'grommet';
import React from 'react';
import styled from 'styled-components';

const Title = styled(Heading)`
  font-size: 18px;
  line-height: 22px;
`;

interface IClusterCreationProgressProps extends BoxProps {
  title?: string;
}

const StatusList: React.FC<
  React.PropsWithChildren<IClusterCreationProgressProps>
> = ({ title, children, ...props }) => {
  return (
    <Box {...props}>
      {title ? (
        <Title level='4' fill margin={{ top: 'none', bottom: 'medium' }}>
          {title}
        </Title>
      ) : null}
      <Box gap='medium'>{children}</Box>
    </Box>
  );
};

export default StatusList;
