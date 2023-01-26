import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { Box } from 'grommet';
import React from 'react';

const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({
  idSchema,
  properties,
}) => {
  const isArrayItem = /(_\d+)$/.test(idSchema.$id);

  return (
    <Box gap={isArrayItem ? 'none' : 'small'}>
      {properties.map((element) => (
        <div key={element.name}>{element.content}</div>
      ))}
    </Box>
  );
};

export default ObjectFieldTemplate;
