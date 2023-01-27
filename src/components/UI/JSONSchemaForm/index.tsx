import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import { ErrorSchema, RJSFSchema } from '@rjsf/utils';
import { get, set } from 'lodash';
import React, { createContext, useEffect, useRef, useState } from 'react';
import useDebounce from 'utils/hooks/useDebounce';

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

const VALIDATION_ERROR_DEBOUNCE_RATE = 500;

const JSONSchemaForm: React.FC<FormProps<RJSFSchema, RJSFSchema>> = ({
  onChange,
  onSubmit,
  formData,
  ...props
}) => {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const debouncedTouchedFields = useDebounce(
    touchedFields,
    VALIDATION_ERROR_DEBOUNCE_RATE
  );
  const [extraErrors, setExtraErrors] = useState<ErrorSchema>({});

  const setTouchedField = (id?: string) => {
    if (!id) return;
    setTouchedFields(
      (state) =>
        new Set(state.add(id.replace(/^root/, '').replaceAll('_', '.')))
    );
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

  const handleSubmit = (
    data: IChangeEvent<RJSFSchema>,
    event: React.FormEvent<RJSFSchema>
  ) => {
    setTouchedFields(new Set());

    if (onSubmit) {
      onSubmit(data, event);
    }
  };

  const ref = useRef<Form<RJSFSchema> | null>(null);

  useEffect(() => {
    if (!ref.current || !formData) return;

    const { errors, errorSchema } = ref.current.validate(formData);

    const filteredErrors = {};
    for (const e of errors) {
      if (!e.property || !debouncedTouchedFields.has(e.property)) continue;
      const path = [...e.property.split('.'), '__errors'].filter(Boolean);
      set(filteredErrors, path, get(errorSchema, path));
    }
    setExtraErrors(filteredErrors);
  }, [debouncedTouchedFields, formData]);

  return (
    <FormContext.Provider value={{ touchedFields, setTouchedField }}>
      <Form
        fields={customFields}
        widgets={customWidgets}
        templates={customTemplates}
        onChange={handleChange}
        onBlur={handleBlur}
        onSubmit={handleSubmit}
        formData={formData}
        extraErrors={extraErrors}
        ref={ref}
        noHtml5Validate
        {...props}
      />
    </FormContext.Provider>
  );
};

export default JSONSchemaForm;
