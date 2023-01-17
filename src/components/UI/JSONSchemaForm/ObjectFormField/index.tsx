import { Box, Text } from 'grommet';
import React from 'react';

interface ObjectFormFieldProps {
  label: string;
  isArrayItem: boolean;
  help?: string;
  error?: React.ReactNode;
}

const ObjectFormField: React.FC<
  React.PropsWithChildren<ObjectFormFieldProps>
> = ({ label, isArrayItem, help, error, children }) => {
  return (
    <Box margin={{ bottom: isArrayItem ? 'none' : 'small' }}>
      <Text as='label' weight='bold' margin={{ vertical: 'small' }}>
        {label}
      </Text>
      {help && (
        <Box margin={{ bottom: 'small' }}>
          <Text color='text-weak' size='small'>
            {help}
          </Text>
        </Box>
      )}
      {error && <Box margin={{ bottom: 'small' }}>{error}</Box>}
      {children}
    </Box>
  );
};

export default ObjectFormField;
