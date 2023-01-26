import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import { RJSFSchema, RJSFValidationError } from '@rjsf/utils';
import React, { useRef, useState } from 'react';

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

const JSONSchemaForm: React.FC<FormProps> = ({
  onChange,
  onSubmit,
  ...props
}) => {
  const [touchedFormFields, setTouchedFormFields] = useState<Set<string>>(
    new Set()
  );

  const ref = useRef<Form<RJSFSchema> | null>(null);

  const addTouchedFormField = (id: string) => {
    setTouchedFormFields((state) => new Set(state.add(id)));
  };

  const handleBlur = (id?: string) => {
    if (id) addTouchedFormField(id);
  };

  const handleChange = (data: IChangeEvent<RJSFSchema>, id?: string) => {
    if (id) addTouchedFormField(id);

    if (onChange) {
      onChange(data, id);
    }
  };

  const handleSubmit = (
    data: IChangeEvent<RJSFSchema>,
    event: React.FormEvent<RJSFSchema>
  ) => {
    if (onSubmit) {
      onSubmit(data, event);
    }
  };

  const processErrors = (errors: RJSFValidationError[]) => {
    const filteredFields = Array.from(touchedFormFields).map((field) =>
      field.replace(/^root/, '').replaceAll('_', '.')
    );

    const err = errors.filter((e) =>
      filteredFields.some((f) => (e.property ? f.includes(e.property) : true))
    );

    return err;
  };

  return (
    <Form
      fields={customFields}
      widgets={customWidgets}
      templates={customTemplates}
      onBlur={handleBlur}
      onChange={handleChange}
      onSubmit={handleSubmit}
      ref={ref}
      transformErrors={processErrors}
      noHtml5Validate
      liveValidate
      {...props}
    />
  );
};

export default JSONSchemaForm;
