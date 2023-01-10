import { ErrorListProps } from '@rjsf/utils';
import { Box, Paragraph } from 'grommet';
import React from 'react';
import { FlashMessageType } from 'styles';
import FlashMessage from 'UI/Display/FlashMessage';

const ErrorListTemplate: React.FC<ErrorListProps> = ({ errors }) => {
  return (
    <FlashMessage type={FlashMessageType.Danger}>
      <Paragraph size='xlarge'>Errors</Paragraph>
      <Box>
        {errors.map((error, idx) => (
          <Paragraph key={idx} fill>
            {error.stack}
          </Paragraph>
        ))}
      </Box>
    </FlashMessage>
  );
};

export default ErrorListTemplate;
