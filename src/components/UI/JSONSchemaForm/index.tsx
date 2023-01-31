import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import React, { createContext, useReducer } from 'react';

import ArrayFieldTemplate from './ArrayFieldTemplate';
import BaseInputTemplate from './BaseInputTemplate';
import CheckboxWidget from './CheckboxWidget';
import ErrorListTemplate from './ErrorListTemplate';
import FieldErrorTemplate from './FieldErrorTemplate';
import FieldTemplate from './FieldTemplate';
import ObjectFieldTemplate from './ObjectFieldTemplate';
import SelectWidget from './SelectWidget';
import ToggleWidget from './ToggleWidget';
import { transformErrors } from './utils';

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

interface IAddTouchedFieldAction {
  type: 'addTouchedField';
  value: string;
}

interface IAttemptSubmitAction {
  type: 'attemptSubmitAction';
}

export interface IFormContext {
  touchedFields: string[];
  showAllErrors: boolean;
}

type FormAction = IAddTouchedFieldAction | IAttemptSubmitAction;

const reducer: React.Reducer<IFormContext, FormAction> = (state, action) => {
  switch (action.type) {
    case 'addTouchedField':
      return {
        ...state,
        touchedFields: Array.from(
          new Set([...state.touchedFields, action.value])
        ),
      };
    case 'attemptSubmitAction':
      return { ...state, showAllErrors: true };
    default:
      return { ...state };
  }
};

function createInitalState(): IFormContext {
  return { touchedFields: [], showAllErrors: false };
}

export const FormContext = createContext<IFormContext | null>(null);

const JSONSchemaForm: React.FC<FormProps> = ({
  onChange,
  onBlur,
  ...props
}) => {
  const [state, dispatch] = useReducer(reducer, createInitalState());

  const addTouchedField = (id?: string) => {
    if (!id) return;
    dispatch({ type: 'addTouchedField', value: id });
  };

  const handleChange = (data: IChangeEvent<RJSFSchema>, id?: string) => {
    addTouchedField(id);
    if (onChange) {
      onChange(data, id);
    }
  };

  const handleBlur = (id: string, data: unknown) => {
    addTouchedField(id);
    if (onBlur) {
      onBlur(id, data);
    }
  };

  const handleSubmitAttempted = () => {
    dispatch({ type: 'attemptSubmitAction' });
  };

  return (
    <Form
      fields={customFields}
      widgets={customWidgets}
      templates={customTemplates}
      onChange={handleChange}
      onBlur={handleBlur}
      onError={handleSubmitAttempted}
      formContext={state}
      transformErrors={transformErrors}
      noHtml5Validate
      liveValidate
      {...props}
    />
  );
};

export default JSONSchemaForm;
