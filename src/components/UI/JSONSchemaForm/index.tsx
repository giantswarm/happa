import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import {
  getDefaultFormState,
  RJSFSchema,
  RJSFValidationError,
} from '@rjsf/utils';
import cloneDeep from 'lodash/cloneDeep';
import hasIn from 'lodash/hasIn';
import merge from 'lodash/merge';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import ArrayFieldTemplate from './ArrayFieldTemplate';
import BaseInputTemplate from './BaseInputTemplate';
import CheckboxWidget from './CheckboxWidget';
import ErrorListTemplate from './ErrorListTemplate';
import FieldErrorTemplate from './FieldErrorTemplate';
import FieldTemplate from './FieldTemplate';
import MultiSchemaField from './MultiSchemaField';
import ObjectFieldTemplate from './ObjectFieldTemplate';
import { preprocessSchema } from './schemaUtils';
import SelectWidget from './SelectWidget';
import {
  cleanPayload,
  mapErrorPropertyToField,
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

interface IJSONSchemaFormProps extends Omit<FormProps, 'onChange'> {
  fieldsToRemove?: string[];
  onChange: (data: RJSFSchema, cleanData: RJSFSchema) => void;
}

const JSONSchemaForm: React.FC<IJSONSchemaFormProps> = ({
  onChange,
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

  const [preprocessedSchema, defaultValues] = useMemo(() => {
    const patchedSchema = preprocessSchema(cloneDeep(schema), fieldsToRemove);
    const defaults: RJSFSchema = getDefaultFormState(
      validator,
      patchedSchema,
      {},
      patchedSchema
    );

    return [patchedSchema, defaults];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validator, schema]);

  const onChangeCallback = useCallback(
    (data: RJSFSchema, fieldId?: string) => {
      const cleanData = cleanPayload<RJSFSchema>(data, {
        emptyStrings: false,
        emptyArrays: false,
        isException: (value) => Array.isArray(value) && value.length > 0,
      }) as RJSFSchema;

      const cleanDataWithoutDefaultValues = cleanPayload<RJSFSchema>(data, {
        emptyStrings: false,
        emptyArrays: false,
        cleanDefaultValues: true,
        defaultValues,
      }) as RJSFSchema;

      updateTouchedFields(cleanData, fieldId);
      onChange(cleanData, cleanDataWithoutDefaultValues);
    },
    [defaultValues, onChange, updateTouchedFields]
  );

  useEffect(() => {
    const formDataWithDefaultValues = merge(
      {},
      defaultValues,
      formData as RJSFSchema
    );
    onChangeCallback(formDataWithDefaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const idConfigs: IIdConfigs = { idPrefix, idSeparator };

  const handleChange = (data: IChangeEvent<RJSFSchema>, id?: string) => {
    addTouchedField(id);

    if (data.formData) {
      onChangeCallback(data.formData, id);
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
      {...props}
    />
  );
};

export default JSONSchemaForm;
