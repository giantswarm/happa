import { FormProps, IChangeEvent } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import { customizeValidator } from '@rjsf/validator-ajv8';
import Ajv2020 from 'ajv/dist/2020';
import cleanDeep from 'clean-deep';
import yaml from 'js-yaml';
import { generateUID } from 'MAPI/utils';
import { Providers } from 'model/constants';
import React, { useMemo, useState } from 'react';
import { CodeBlock } from 'UI/Display/Documentation/CodeBlock';
import Line from 'UI/Display/Documentation/Line';
import JSONSchemaForm, { IFormContext } from 'UI/JSONSchemaForm';

import {
  cleanDeepWithException,
  getFormProps,
  getProviderForPrototypeSchema,
  preprocessSchema,
  PrototypeSchemas,
} from './schemaUtils';

const validator = customizeValidator({ AjvClass: Ajv2020 });

const Prompt: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
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
  onSubmit: (clusterName: string, formData: RJSFSchema | undefined) => void;
  onChange?: (args: {
    formData: RJSFSchema | undefined;
    cleanFormData: RJSFSchema | undefined;
  }) => void;
  render: (args: { formDataPreview: React.ReactNode }) => React.ReactNode;
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
  ...props
}) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const clusterName = useMemo(() => generateUID(5), [provider, appVersion]);

  const [formProps, setFormProps] = useState<
    Pick<FormProps<RJSFSchema>, 'uiSchema' | 'formData'>
  >(getFormProps(provider, appVersion, clusterName, organization));

  const cleanFormData = cleanDeep(formProps.formData, { emptyStrings: false });

  const handleSubmit = (
    _: IChangeEvent<RJSFSchema>,
    e: React.FormEvent<HTMLElement>
  ) => {
    e.preventDefault();

    onSubmit(clusterName, cleanFormData);
  };

  const handleFormDataChange = (rawFormData: RJSFSchema | undefined) => {
    if (!rawFormData) {
      return;
    }
    const formData = cleanDeepWithException<RJSFSchema>(
      rawFormData,
      { emptyStrings: false },
      (value) => Array.isArray(value) && value.length > 0
    ) as RJSFSchema;

    setFormProps((prev) => {
      return {
        ...prev,
        formData,
      };
    });

    if (onChange) {
      onChange({ formData, cleanFormData });
    }
  };

  const processedSchema = useMemo(() => {
    return preprocessSchema(schema);
  }, [schema]);

  return (
    <>
      <JSONSchemaForm
        schema={processedSchema}
        uiSchema={formProps.uiSchema}
        formContext={{
          schemaProvider: getProviderForPrototypeSchema(provider),
        }}
        validator={validator}
        formData={formProps.formData}
        showErrorList='bottom'
        onSubmit={handleSubmit}
        onChange={handleFormDataChange}
        {...props}
      />
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
