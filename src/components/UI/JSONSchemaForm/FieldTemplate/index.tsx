import { FieldTemplateProps } from '@rjsf/utils';
import React from 'react';

const FieldTemplate: React.FC<FieldTemplateProps> = ({
  help,
  errors,
  children,
}) => {
  return (
    <div>
      {children}
      {errors}
      {help}
    </div>
  );
};

export default FieldTemplate;
