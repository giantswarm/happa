import { ObjectFieldTemplateProps } from '@rjsf/utils';
import React from 'react';

const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({
  properties,
}) => {
  return (
    <>
      {properties.map((element) => (
        <div key={element.name}>{element.content}</div>
      ))}
    </>
  );
};

export default ObjectFieldTemplate;
