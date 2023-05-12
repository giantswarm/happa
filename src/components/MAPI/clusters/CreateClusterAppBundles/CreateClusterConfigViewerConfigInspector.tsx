import { Box, BoxProps, Text } from 'grommet';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import nnfxDark from 'react-syntax-highlighter/dist/esm/styles/hljs/nnfx-dark';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import useCopyToClipboard from 'utils/hooks/useCopyToClipboard';

const CLIPBOARD_STATE_TIMEOUT = 1000;

const StyledSyntaxHighlighter = styled(SyntaxHighlighter)`
  code > span {
    color: inherit !important;
  }
`;

interface ICreateClusterConfigViewerConfigInspectorProps extends BoxProps {
  data: string;
  filename: string;
}

const CreateClusterConfigViewerConfigInspector: React.FC<
  ICreateClusterConfigViewerConfigInspectorProps
> = ({ data, filename, ...props }) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const fileContents = window.URL.createObjectURL(
    new Blob([data], {
      type: 'application/plain;charset=utf-8',
    })
  );

  const handleMouseLeave = () =>
    setTimeout(() => setClipboardContent(null), CLIPBOARD_STATE_TIMEOUT);

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
          <StyledSyntaxHighlighter
            style={nnfxDark}
            language='yaml'
            customStyle={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'Inconsolata, monospace',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              margin: 0,
              padding: 0,
            }}
          >
            {data}
          </StyledSyntaxHighlighter>
        </Text>
      </Box>

      <Box direction='row' gap='small'>
        <Button
          onClick={() => setClipboardContent(data)}
          onMouseLeave={handleMouseLeave}
        >
          {hasContentInClipboard ? 'Copied' : 'Copy'}
        </Button>
        <a download={filename} href={fileContents}>
          <Button>Download</Button>
        </a>
      </Box>
    </Box>
  );
};

export default CreateClusterConfigViewerConfigInspector;
