import Form, { FormProps } from '@rjsf/core';
import React from 'react';

import ArrayFieldTemplate from './ArrayFieldTemplate';
import BaseInputTemplate from './BaseInputTemplate';
import CheckboxWidget from './CheckboxWidget';
import FieldTemplate from './FieldTemplate';
import ObjectFieldTemplate from './ObjectFieldTemplate';
import SelectWidget from './SelectWidget';
import ToggleWidget from './ToggleWidget';
import UpDownWidget from './UpDownWidget';

const customFields = {};
const customWidgets = {
  checkbox: CheckboxWidget,
  toggle: ToggleWidget,
  updown: UpDownWidget,
  select: SelectWidget,
};
const customTemplates = {
  ArrayFieldTemplate,
  BaseInputTemplate,
  FieldTemplate,
  ObjectFieldTemplate,
};

const JSONSchemaForm: React.FC<FormProps> = (props) => {
  return (
    <Form
      fields={customFields}
      widgets={customWidgets}
      templates={customTemplates}
      {...props}
    />
  );
};

export default JSONSchemaForm;
