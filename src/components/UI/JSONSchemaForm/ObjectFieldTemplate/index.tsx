import { ObjectFieldTemplateProps } from '@rjsf/utils';
import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({
  title,
  properties,
}) => {
  const children = properties.map((element) => (
    <div key={element.name} className='property-wrapper'>
      {element.content}
    </div>
  ));

  return properties.length === 1 || title === '' ? (
    children
  ) : (
    <InputGroup label={title}>{children}</InputGroup>
  );
};

export default ObjectFieldTemplate;
