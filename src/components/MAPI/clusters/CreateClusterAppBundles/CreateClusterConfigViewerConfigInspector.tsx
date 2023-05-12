import { Box, BoxProps, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import hybrid from 'react-syntax-highlighter/dist/esm/styles/hljs/hybrid';
import styled, { keyframes } from 'styled-components';
import Button from 'UI/Controls/Button';
import useCopyToClipboard from 'utils/hooks/useCopyToClipboard';

import { CLUSTER_CREATION_FORM_MAX_WIDTH } from '.';

const StyledSyntaxHighlighter = styled(SyntaxHighlighter)`
  code {
    scroll-width: 'thin';
    scrollbar-gutter: stable;
    scrollbar-color: ${({ theme }) =>
      `${normalizeColor('text-xxweak', theme)} transparent`};

    ::-webkit-scrollbar {
      background-color: ${({ theme }) => normalizeColor('text-xxweak', theme)};
      border-radius: 5px;
      width: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #4a4a4a;
      border-radius: 5px;
    }

    span:last-child {
      display: inline-block;
      margin-bottom: 5px;
    }
  }
`;

const appear = keyframes`
  from {
    opacity: 0;
    transform: scale(0, 0);
  }

  to {
    opacity: 1;
    transform: scale(1, 1);
  }
`;

const StyledIcon = styled.i`
  display: inline-block;
  font-size: 20px;
  opacity: 0;

  &.animate {
    animation: 200ms ease-in ${appear} forwards;
  }
`;

interface ICreateClusterConfigViewerConfigInspectorProps extends BoxProps {
  info: React.ReactNode;
  data: string;
  filename: string;
}

const CreateClusterConfigViewerConfigInspector: React.FC<
  ICreateClusterConfigViewerConfigInspectorProps
> = ({ info, data, filename, ...props }) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const fileContents = window.URL.createObjectURL(
    new Blob([data], {
      type: 'application/plain;charset=utf-8',
    })
  );

  return (
    <Box
      gap='medium'
      width={{ max: CLUSTER_CREATION_FORM_MAX_WIDTH }}
      {...props}
    >
      <Box
        direction='row'
        gap='xsmall'
        align='baseline'
        width={{ max: CLUSTER_CREATION_FORM_MAX_WIDTH }}
      >
        <i className='fa fa-info' aria-hidden={true} role='presentation' />
        <Text>{info}</Text>
      </Box>
      <StyledSyntaxHighlighter
        style={hybrid}
        language='yaml'
        customStyle={{
          border: 'none',
          borderRadius: '10px',
          fontFamily: 'Inconsolata, monospace',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          padding: '0',
        }}
        codeTagProps={{
          style: {
            display: 'block',
            maxHeight: '425px',
            margin: '5px 5px 5px 15px',
            overflow: 'auto',
            scrollbarWidth: 'thin',
          },
        }}
      >
        {data}
      </StyledSyntaxHighlighter>
      <Box direction='row' gap='small' align='baseline'>
        <a download={filename} href={fileContents}>
          <Button>Download</Button>
        </a>
        <Button
          onClick={() => setClipboardContent(data)}
          onMouseLeave={() => setClipboardContent(null)}
        >
          Copy
        </Button>
        <StyledIcon
          role='presentation'
          className={`fa fa-done ${hasContentInClipboard ? 'animate' : ''}`}
        />
      </Box>
    </Box>
  );
};

export default CreateClusterConfigViewerConfigInspector;
