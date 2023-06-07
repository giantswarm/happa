import { Box, BoxProps, Paragraph, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';
import FlashMessage from 'UI/Display/FlashMessage';

const StyledFlashMessage = styled(FlashMessage)`
  code {
    display: inline-block;
    color: inherit;
    font-size: inherit;
    background-color: transparent;
    padding: 0;
    margin: 0;
    border-radius: 0;
  }
`;

interface IErrorMessageProps extends BoxProps {
  error?: string;
  details?: string;
}

const ErrorMessage: React.FC<React.PropsWithChildren<IErrorMessageProps>> = ({
  error,
  details,
  children,
  ...props
}) => {
  return (
    <Box {...props}>
      <Box direction='row' gap='xsmall' align='baseline'>
        <i className='fa fa-warning' aria-hidden={true} role='presentation' />
        <Text>{children}</Text>
      </Box>
      <Box margin={{ top: 'medium' }}>
        <StyledFlashMessage type={FlashMessageType.Danger}>
          {error ? (
            <Paragraph fill dangerouslySetInnerHTML={{ __html: `${error}:` }} />
          ) : null}
          {details ? (
            <Paragraph fill margin='none'>
              <code>{details}</code>
            </Paragraph>
          ) : null}
        </StyledFlashMessage>
      </Box>
    </Box>
  );
};

export default ErrorMessage;
