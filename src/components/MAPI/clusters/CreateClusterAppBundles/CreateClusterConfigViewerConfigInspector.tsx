import { Box, BoxProps, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

interface ICreateClusterConfigViewerConfigInspectorProps extends BoxProps {
  data: string;
}

const StyledCode = styled.pre`
  background: transparent;
  border: none;
  color: inherit;
  font-family: Inconsolata, monospace;
  font-size: inherit;
  margin: 0;
  padding: 0;
`;

const CreateClusterConfigViewerConfigInspector: React.FC<
  ICreateClusterConfigViewerConfigInspectorProps
> = ({ data, ...props }) => {
  return (
    <Box
      gap='medium'
      margin={{ top: 'medium' }}
      width={{ max: '700px' }}
      {...props}
    >
      <Box
        height={{ max: '425px' }}
        background='codeblock-background'
        pad={{ vertical: '15px', horizontal: 'medium' }}
        round='small'
        overflow='scroll'
      >
        <Text>
          <StyledCode>{data}</StyledCode>
        </Text>
      </Box>
      <Box direction='row' gap='small'>
        <Button>Copy</Button>
        <Button>Download</Button>
      </Box>
    </Box>
  );
};

export default CreateClusterConfigViewerConfigInspector;
