import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import React, { createContext, useState } from 'react';

import ArrayFieldTemplate from './ArrayFieldTemplate';
import BaseInputTemplate from './BaseInputTemplate';
import CheckboxWidget from './CheckboxWidget';
import ErrorListTemplate from './ErrorListTemplate';
import FieldErrorTemplate from './FieldErrorTemplate';
import FieldTemplate from './FieldTemplate';
import ObjectFieldTemplate from './ObjectFieldTemplate';
import SelectWidget from './SelectWidget';
import ToggleWidget from './ToggleWidget';

const customFields = {};
const customWidgets = {
  checkbox: CheckboxWidget,
  toggle: ToggleWidget,
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

export interface IFormContext {
  touchedFields: Set<string>;
  setTouchedField: (id: string) => void;
}

export const FormContext = createContext<IFormContext | null>(null);

const JSONSchemaForm: React.FC<FormProps> = ({ onChange, ...props }) => {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const setTouchedField = (id?: string) => {
    if (!id) return;
    setTouchedFields((state) => new Set(state.add(id)));
  };

  const handleChange = (data: IChangeEvent<RJSFSchema>, id?: string) => {
    setTouchedField(id);
    if (onChange) {
      onChange(data, id);
    }
  };

  const handleBlur = (id?: string) => {
    setTouchedField(id);
  };

  return (
    <FormContext.Provider value={{ touchedFields, setTouchedField }}>
      <Form
        fields={customFields}
        widgets={customWidgets}
        templates={customTemplates}
        onChange={handleChange}
        onBlur={handleBlur}
        noHtml5Validate
        liveValidate
        {...props}
      />
    </FormContext.Provider>
  );
};

export default JSONSchemaForm;
