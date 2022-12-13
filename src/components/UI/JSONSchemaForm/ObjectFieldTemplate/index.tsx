import { ObjectFieldTemplateProps } from '@rjsf/utils';
import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({
  title,
  properties,
}) => {
  return (
    <InputGroup label={title === '' ? undefined : title}>
      {properties.map((element) => (
        <div key={element.name}>{element.content}</div>
      ))}
    </InputGroup>
  );
};

export default ObjectFieldTemplate;
