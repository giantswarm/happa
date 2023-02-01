import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import { RJSFSchema, RJSFValidationError } from '@rjsf/utils';
import React, { useReducer, useRef } from 'react';

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

interface IRemoveTouchedFieldAction {
  type: 'removeTouchedField';
  value: string;
}

interface IToggleTouchedsFieldAction {
  type: 'toggleTouchedFields';
  value: string[];
}

interface IAttemptSubmitAction {
  type: 'attemptSubmitAction';
}

interface IFormState {
  touchedFields: string[];
  showAllErrors: boolean;
}

type FormAction =
  | IAddTouchedFieldAction
  | IRemoveTouchedFieldAction
  | IToggleTouchedsFieldAction
  | IAttemptSubmitAction;

const reducer: React.Reducer<IFormState, FormAction> = (state, action) => {
  switch (action.type) {
    case 'addTouchedField':
      return {
        ...state,
        touchedFields: Array.from(
          new Set([...state.touchedFields, action.value])
        ),
      };

    case 'removeTouchedField':
      return {
        ...state,
        touchedFields: state.touchedFields.filter(
          (field) => field !== action.value
        ),
      };

    case 'toggleTouchedFields': {
      const newFields = new Set(state.touchedFields);
      for (const id of action.value) {
        if (newFields.has(id)) {
          newFields.delete(id);
        } else {
          newFields.add(id);
        }
      }

      return { ...state, touchedFields: Array.from(newFields) };
    }

    case 'attemptSubmitAction':
      return { ...state, showAllErrors: true };

    default:
      return { ...state };
  }
};

function createInitalState(): IFormState {
  return { touchedFields: [], showAllErrors: false };
}

export interface IFormContext extends IFormState {
  errors: RJSFValidationError[] | undefined;
  removeTouchedField: (id: string) => void;
  toggleTouchedFields: (...ids: string[]) => void;
}

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

  const removeTouchedField = (id: string) => {
    dispatch({ type: 'removeTouchedField', value: id });
  };

  const toggleTouchedFields = (...ids: string[]) => {
    dispatch({ type: 'toggleTouchedFields', value: [...ids] });
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

  const ref = useRef<Form<RJSFSchema> | null>(null);

  return (
    <Form
      fields={customFields}
      widgets={customWidgets}
      templates={customTemplates}
      onChange={handleChange}
      onBlur={handleBlur}
      onError={handleSubmitAttempted}
      formContext={{
        ...state,
        errors: ref.current?.state.errors,
        removeTouchedField,
        toggleTouchedFields,
      }}
      transformErrors={transformErrors}
      ref={ref}
      noHtml5Validate
      liveValidate
      {...props}
    />
  );
};

export default JSONSchemaForm;
