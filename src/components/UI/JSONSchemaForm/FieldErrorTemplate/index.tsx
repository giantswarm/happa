import { FieldErrorProps } from '@rjsf/utils';
import { Text } from 'grommet';
import React from 'react';

const FieldErrorTemplate: React.FC<FieldErrorProps> = ({ errors }) => {
  if (typeof errors === 'undefined') {
    return null;
  }

  return (
    <>
      {errors.map((error, idx) => (
        <Text key={idx} size='small' color='text-error'>
          {typeof error === 'string'
            ? `${error[0].toLocaleUpperCase()}${error.slice(1)}`
            : error}
        </Text>
      ))}
    </>
  );
};

export default FieldErrorTemplate;
