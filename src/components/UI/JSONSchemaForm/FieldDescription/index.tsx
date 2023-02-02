import { Text } from 'grommet';
import React from 'react';

interface FieldDescriptionProps {
  description?: string;
}

const FieldDescription: React.FC<FieldDescriptionProps> = ({ description }) => {
  return <Text color='text-weak'>{description}</Text>;
};

export default FieldDescription;
