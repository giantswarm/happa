import { FormProps, IChangeEvent } from '@rjsf/core';
import { RJSFSchema, RJSFValidationError } from '@rjsf/utils';
import { customizeValidator } from '@rjsf/validator-ajv8';
import Ajv2020 from 'ajv/dist/2020';
import yaml from 'js-yaml';
import { generateUID } from 'MAPI/utils';
import { Providers } from 'model/constants';
import React, { useMemo, useState } from 'react';
import { CodeBlock } from 'UI/Display/Documentation/CodeBlock';
import Line from 'UI/Display/Documentation/Line';
import JSONSchemaForm, { IFormContext } from 'UI/JSONSchemaForm';

import {
  getFormProps,
  getProviderForPrototypeSchema,
  PrototypeSchemas,
} from './schemaUtils';

const validator = customizeValidator({ AjvClass: Ajv2020 });

export const Prompt: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <Line prompt={false} text={children} />;
};

Prompt.displayName = 'Prompt';

export interface ICreateClusterFormContext extends IFormContext {
  schemaProvider?: PropertiesOf<typeof Providers>;
}

interface ICreateClusterAppBundlesFormProps {
  schema: RJSFSchema;
  provider: PrototypeSchemas;
  organization: string;
  appVersion: string;
  render: (args: { formDataPreview: React.ReactNode }) => React.ReactNode;
  onSubmit: (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
    clusterName: string,
    formData: RJSFSchema | undefined
  ) => void;
  onChange?: (args: {
    formData: RJSFSchema | undefined;
    cleanFormData: RJSFSchema | undefined;
    clusterName: string;
  }) => void;
  onError?: (errors: RJSFValidationError[]) => void;
  formData?: RJSFSchema;
  clusterName?: string;
  id?: string;
}

const CreateClusterAppBundlesForm: React.FC<
  React.PropsWithChildren<ICreateClusterAppBundlesFormProps>
> = ({
  schema,
  provider,
  organization,
  appVersion,
  onSubmit,
  onChange,
  children,
  formData,
  ...props
}) => {
  const clusterName = useMemo(
    () => props.clusterName || generateUID(5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [provider, appVersion]
  );

  const [formProps, setFormProps] = useState<
    Pick<FormProps<RJSFSchema>, 'uiSchema' | 'formData'>
  >({
    ...getFormProps(provider, appVersion, clusterName, organization),
    ...(formData && { formData }),
  });

  const [cleanFormData, setCleanFormData] = useState<RJSFSchema>();

  const handleSubmit = (
    _: IChangeEvent<RJSFSchema>,
    e: React.FormEvent<HTMLElement>
  ) => {
    e.preventDefault();

    onSubmit(
      e as React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
      clusterName,
      cleanFormData
    );
  };

  const handleFormDataChange = (data: RJSFSchema, cleanData: RJSFSchema) => {
    setFormProps((prev) => {
      return {
        ...prev,
        formData: data,
      };
    });
    setCleanFormData(cleanData);

    if (onChange) {
      onChange({ formData: data, cleanFormData: cleanData, clusterName });
    }
  };

  return (
    <>
      <JSONSchemaForm
        schema={schema}
        uiSchema={formProps.uiSchema}
        formContext={{
          schemaProvider: getProviderForPrototypeSchema(provider),
        }}
        validator={validator}
        formData={formProps.formData}
        onSubmit={handleSubmit}
        onChange={handleFormDataChange}
        {...props}
      >
        {
          // eslint-disable-next-line react/jsx-no-useless-fragment
          children ? children : <></>
        }
      </JSONSchemaForm>
      {props.render({
        formDataPreview:
          cleanFormData !== undefined ? (
            <CodeBlock>
              <Prompt>
                {yaml.dump(cleanFormData, {
                  indent: 2,
                  quotingType: '"',
                  lineWidth: -1,
                })}
              </Prompt>
            </CodeBlock>
          ) : null,
      })}
    </>
  );
};

export default CreateClusterAppBundlesForm;
