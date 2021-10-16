import { Box, Text } from 'grommet';
import React from 'react';
import { CodeBlock, Prompt } from 'UI/Display/Documentation/CodeBlock';

interface ICLIGuideStepProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Box>, 'title'> {
  title: React.ReactNode;
  command?: React.ReactNode;
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
      {command && (
        <CodeBlock>
          <Prompt>{command}</Prompt>
        </CodeBlock>
      )}
      {children}
    </Box>
  );
};

export default CLIGuideStep;
