import { Box, Text } from 'grommet';
import React from 'react';

interface ObjectFormFieldProps {
  label: React.ReactNode;
  isArrayItem: boolean;
  help?: React.ReactNode;
  error?: React.ReactNode;
}

const ObjectFormField: React.FC<
  React.PropsWithChildren<ObjectFormFieldProps>
> = ({ label, isArrayItem, help, error, children }) => {
  const helpComponent =
    typeof help === 'string' ? <Text color='text-weak'>{help}</Text> : help;

  return (
    <Box margin={{ bottom: isArrayItem ? 'none' : 'small' }}>
      <Text as='label' weight='bold' margin={{ vertical: 'small' }}>
        {label}
      </Text>
      {help && <Box margin={{ bottom: 'small' }}>{helpComponent}</Box>}
      {error && <Box margin={{ bottom: 'small' }}>{error}</Box>}
      {children}
    </Box>
  );
};

export default ObjectFormField;
