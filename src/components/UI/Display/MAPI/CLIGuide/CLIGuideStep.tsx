import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import { CodeBlock, Prompt } from 'UI/Display/Documentation/CodeBlock';

interface ICLIGuideStepProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Box>, 'title'> {
  title: React.ReactNode;
  command: React.ReactNode;
}

const CLIGuideStep: React.FC<ICLIGuideStepProps> = ({
  title,
  command,
  children,
  ...props
}) => {
  return (
    <Box direction='column' gap='small' {...props}>
      <Text>{title}</Text>
      <CodeBlock>
        <Prompt>{command}</Prompt>
      </CodeBlock>
      {children}
    </Box>
  );
};

CLIGuideStep.propTypes = {
  title: PropTypes.string.isRequired,
  command: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default CLIGuideStep;
