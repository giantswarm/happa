import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import { RJSFSchema, RJSFValidationError } from '@rjsf/utils';
import hasIn from 'lodash/hasIn';
import React, { useCallback, useMemo, useReducer, useRef } from 'react';

import ArrayFieldTemplate from './ArrayFieldTemplate';
import BaseInputTemplate from './BaseInputTemplate';
import CheckboxWidget from './CheckboxWidget';
import ErrorListTemplate from './ErrorListTemplate';
import ValidationStatus from './ErrorListTemplate/ValidationStatus';
import FieldErrorTemplate from './FieldErrorTemplate';
import FieldTemplate from './FieldTemplate';
import MultiSchemaField from './MultiSchemaField';
import ObjectFieldTemplate from './ObjectFieldTemplate';
import { preprocessSchema } from './schemaUtils';
import SelectWidget from './SelectWidget';
import {
  cleanPayload,
  cleanPayloadFromDefaults,
  mapErrorPropertyToField,
  transformArraysIntoObjects,
  transformErrors,
} from './utils';

const customFields = {
  OneOfField: MultiSchemaField,
  AnyOfField: MultiSchemaField,
};
const customWidgets = {
  CheckboxWidget,
  SelectWidget,
};
const customTemplates = {
  ArrayFieldTemplate,
  BaseInputTemplate,
  ErrorListTemplate,
  FieldTemplate,
  FieldErrorTemplate,
  ObjectFieldTemplate,
};

export interface IIdConfigs {
  idSeparator: string;
  idPrefix: string;
}

interface IAddTouchedFieldAction {
  type: 'addTouchedField';
  value: string;
}

interface ISetTouchedFieldsAction {
  type: 'setTouchedFields';
  value: string[];
}

interface IToggleTouchedFieldsAction {
  type: 'toggleTouchedFields';
  value: string[];
}

interface IAttemptSubmitAction {
  type: 'attemptSubmitAction';
  value: RJSFValidationError[];
}

interface IFormState {
  touchedFields: string[];
}

type FormAction =
  | IAddTouchedFieldAction
  | ISetTouchedFieldsAction
  | IToggleTouchedFieldsAction
  | IAttemptSubmitAction;

const createReducer =
  (idConfigs: IIdConfigs): React.Reducer<IFormState, FormAction> =>
  (state, action) => {
    switch (action.type) {
      case 'addTouchedField':
        return {
          ...state,
          touchedFields: Array.from(
            new Set([...state.touchedFields, action.value])
          ),
        };

      case 'setTouchedFields':
        return {
          ...state,
          touchedFields: Array.from(new Set(action.value)),
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

      case 'attemptSubmitAction': {
        const fields = action.value.map((e) =>
          mapErrorPropertyToField(e, idConfigs)
        );

        return {
          ...state,
          touchedFields: Array.from(
            new Set([...state.touchedFields, ...fields])
          ),
        };
      }

      default:
        return { ...state };
    }
  };

function createInitalState(): IFormState {
  return { touchedFields: [] };
}

export interface IFormContext extends IFormState {
  errors: RJSFValidationError[] | undefined;
  toggleTouchedFields: (...ids: string[]) => void;
  idConfigs: IIdConfigs;
}

interface IJSONSchemaFormProps extends Omit<FormProps<RJSFSchema>, 'onChange'> {
  fieldsToRemove?: string[];
  onChange: (data: RJSFSchema, cleanData: RJSFSchema) => void;
}

const JSONSchemaForm: React.FC<IJSONSchemaFormProps> = ({
  onChange,
  onError,
  onBlur,
  idPrefix = 'root',
  idSeparator = '_',
  fieldsToRemove,
  formContext,
  formData,
  schema,
  validator,
  ...props
}) => {
  const [state, dispatch] = useReducer(
    createReducer({ idSeparator, idPrefix }),
    createInitalState()
  );

  const addTouchedField = (id?: string) => {
    if (!id) return;
    dispatch({ type: 'addTouchedField', value: id });
  };

  const toggleTouchedFields = (...ids: string[]) => {
    dispatch({ type: 'toggleTouchedFields', value: [...ids] });
  };

  const setTouchedFields = (...ids: string[]) => {
    dispatch({ type: 'setTouchedFields', value: [...ids] });
  };

  const updateTouchedFields = useCallback(
    (data: RJSFSchema, fieldId?: string) => {
      const touchedFields = fieldId
        ? Array.from(new Set([...state.touchedFields, fieldId]))
        : state.touchedFields;

      const newFields = touchedFields.filter((field) => {
        const fieldPath = field.split(idSeparator).slice(1);

        return hasIn(data, fieldPath);
      });

      setTouchedFields(...newFields);
    },
    [idSeparator, state.touchedFields]
  );

  const preprocessedSchema = useMemo(() => {
    return preprocessSchema(schema, fieldsToRemove);
  }, [fieldsToRemove, schema]);

  const onChangeCallback = useCallback(
    (data: RJSFSchema, fieldId?: string) => {
      const cleanData = cleanPayload(
        data,
        preprocessedSchema,
        preprocessedSchema,
        {
          emptyStrings: false,
          isException: (_value, _cleanValue, isArrayItem) => isArrayItem,
        }
      ) as RJSFSchema;

      const cleanDataWithoutDefaultValues = cleanPayloadFromDefaults(
        cleanData,
        preprocessedSchema,
        preprocessedSchema
      ) as RJSFSchema;

      updateTouchedFields(cleanData, fieldId);
      onChange(
        cleanData,
        transformArraysIntoObjects(
          cleanDataWithoutDefaultValues,
          preprocessedSchema,
          preprocessedSchema
        ) as RJSFSchema
      );
    },
    [preprocessedSchema, onChange, updateTouchedFields]
  );

  const idConfigs: IIdConfigs = { idPrefix, idSeparator };

  const ref = useRef<Form<RJSFSchema> | null>(null);

  const handleChange = (data: IChangeEvent<RJSFSchema>, id?: string) => {
    addTouchedField(id);

    if (data.formData) {
      onChangeCallback(data.formData, id);
    }

    if (onError && ref.current?.state.errors) {
      onError(ref.current.state.errors);
    }
  };

  const handleBlur = (id: string, data: unknown) => {
    addTouchedField(id);
    if (onBlur) {
      onBlur(id, data);
    }
  };

  const handleSubmitAttempted = (errors: RJSFValidationError[]) => {
    dispatch({ type: 'attemptSubmitAction', value: errors });
    if (onError) {
      onError(errors);
    }
  };

  return (
    <>
      <Form
        fields={customFields}
        widgets={customWidgets}
        templates={customTemplates}
        onChange={handleChange}
        onBlur={handleBlur}
        onError={handleSubmitAttempted}
        formContext={{
          ...formContext,
          ...state,
          errors: ref.current?.state.errors,
          toggleTouchedFields,
          idConfigs,
        }}
        transformErrors={transformErrors}
        idSeparator={idConfigs.idSeparator}
        idPrefix={idConfigs.idPrefix}
        ref={ref}
        noHtml5Validate
        liveValidate
        formData={formData}
        schema={preprocessedSchema}
        validator={validator}
        showErrorList={false}
        {...props}
      />
      <ValidationStatus
        formContext={{
          ...formContext,
          ...state,
          errors: ref.current?.state.errors,
          idConfigs,
        }}
      />
    </>
  );
};

export default JSONSchemaForm;
