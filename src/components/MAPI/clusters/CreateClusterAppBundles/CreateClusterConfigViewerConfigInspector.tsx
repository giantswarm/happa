import { Box, BoxProps, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import useCopyToClipboard from 'utils/hooks/useCopyToClipboard';

interface ICreateClusterConfigViewerConfigInspectorProps extends BoxProps {
  data: string;
  filename: string;
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
> = ({ data, filename, ...props }) => {
  const [_, setClipboardContent] = useCopyToClipboard();

  const getFileContent = () =>
    window.URL.createObjectURL(
      new Blob([data], {
        type: 'application/plain;charset=utf-8',
      })
    );

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
        <Button onClick={() => setClipboardContent(data)}>Copy</Button>
        <a download={filename} href={getFileContent()}>
          <Button>Download</Button>
        </a>
      </Box>
    </Box>
  );
};

export default CreateClusterConfigViewerConfigInspector;
