import Form, { FormProps } from '@rjsf/core';
import React from 'react';

import ArrayFieldTemplate from './ArrayFieldTemplate';
import BaseInputTemplate from './BaseInputTemplate';
import CheckboxWidget from './CheckboxWidget';
import ErrorListTemplate from './ErrorListTemplate';
import FieldErrorTemplate from './FieldErrorTemplate';
import FieldTemplate from './FieldTemplate';
import ObjectFieldTemplate from './ObjectFieldTemplate';
import SelectWidget from './SelectWidget';
import { ID_SEPARATOR } from './utils';

const customFields = {};
const customWidgets = {
  checkbox: CheckboxWidget,
  select: SelectWidget,
};
const customTemplates = {
  ArrayFieldTemplate,
  BaseInputTemplate,
  ErrorListTemplate,
  FieldTemplate,
  FieldErrorTemplate,
  ObjectFieldTemplate,
};

const JSONSchemaForm: React.FC<Omit<FormProps, 'idSeparator'>> = (props) => {
  return (
    <Form
      fields={customFields}
      widgets={customWidgets}
      templates={customTemplates}
      noHtml5Validate
      idSeparator={ID_SEPARATOR}
      {...props}
    />
  );
};

export default JSONSchemaForm;
