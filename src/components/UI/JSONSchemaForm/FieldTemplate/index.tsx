import { FieldTemplateProps } from '@rjsf/utils';
import React from 'react';

const FieldTemplate: React.FC<FieldTemplateProps> = ({
  help,
  description,
  errors,
  children,
}) => {
  return (
    <div>
      {description}
      {children}
      {errors}
      {help}
    </div>
  );
};

export default FieldTemplate;
