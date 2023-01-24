import { IChangeEvent } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import cleanDeep from 'clean-deep';
import { Box, Text } from 'grommet';
import { spinner } from 'images';
import yaml from 'js-yaml';
import {
  fetchAppCatalogEntrySchema,
  fetchAppCatalogEntrySchemaKey,
} from 'MAPI/apps/utils';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { IHttpClient } from 'model/clients/HttpClient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import { CodeBlock } from 'UI/Display/Documentation/CodeBlock';
import Line from 'UI/Display/Documentation/Line';
import InputGroup from 'UI/Inputs/InputGroup';
import RadioInput from 'UI/Inputs/RadioInput';
import Select from 'UI/Inputs/Select';
import JSONSchemaForm from 'UI/JSONSchemaForm';
import testSchema from 'UI/JSONSchemaForm/test.schema.json';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import {
  getDefaultFormData,
  getUiSchema,
  PrototypeProviders,
  prototypeProviders,
  PrototypeSchemas,
  prototypeSchemas,
} from './schemaUtils';

const Wrapper = styled.div`
  position: relative;
  margin: auto;
  text-align: center;
`;

function getAppRepoName(provider: PrototypeProviders): string {
  switch (provider) {
    case 'AWS':
      return 'cluster-aws';
    case 'Azure':
      return 'cluster-azure';
    case 'Cloud Director':
      return 'cluster-cloud-director';
    case 'GCP':
      return 'cluster-gcp';
    case 'Open Stack':
      return 'cluster-openstack';
    case 'VSphere':
      return 'cluster-vsphere';
    default:
      return '';
  }
}

function getAppCatalogEntrySchemaURL(
  provider: PrototypeProviders,
  branch?: string
): string {
  const appRepoName = getAppRepoName(provider);
  const branchName = branch || getDefaultRepoBranch(provider);

  return `https://raw.githubusercontent.com/giantswarm/${appRepoName}/${branchName}/helm/${appRepoName}/values.schema.json`;
}

interface IRepoBranchEntry {
  name: string;
}

async function fetchAppRepoBranches(
  client: IHttpClient,
  _auth: IOAuth2Provider,
  provider: PrototypeProviders
): Promise<IRepoBranchEntry[]> {
  const appRepoName = getAppRepoName(provider);
  const url = `https://api.github.com/repos/giantswarm/${appRepoName}/branches`;

  client.setRequestConfig({
    forceCORS: true,
    url,
    headers: {},
  });

  const response = await client.execute<IRepoBranchEntry[]>();

  return response.data;
}

function fetchAppRepoBranchesKey(provider: PrototypeProviders) {
  const appRepoName = getAppRepoName(provider);

  return `https://api.github.com/repos/giantswarm/${appRepoName}/branches`;
}

function getDefaultRepoBranch(provider: PrototypeProviders) {
  return provider === 'AWS' ? 'master' : 'main';
}

enum FormDataPreviewFormat {
  Json,
  Yaml,
}

// TODO: replace test schema URL with the correct one
// after merging prototype branch into the main branch
const testSchemaURL =
  'https://raw.githubusercontent.com/giantswarm/happa/cluster-app-creation-form-prototype/src/components/UI/JSONSchemaForm/test.schema.json';

const Prompt: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <Line prompt={false} text={children} />;
};

Prompt.displayName = 'Prompt';

interface ICreateClusterAppFormProps {
  namespace: string;
  organizationID: string;
  onCreationCancel?: () => void;
  onCreationComplete?: (clusterId: string) => void;
}

const CreateClusterAppForm: React.FC<ICreateClusterAppFormProps> = ({
  onCreationCancel,
  organizationID,
}) => {
  const [isCreating, _setIsCreating] = useState<boolean>(false);

  const [selectedSchema, setSelectedSchema] = useState<PrototypeSchemas>(
    prototypeSchemas[0]
  );
  const selectedProvider = prototypeProviders.find(
    (provider) => provider === selectedSchema
  );
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
    selectedProvider ? getDefaultRepoBranch(prototypeProviders[0]) : undefined
  );

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appRepoBranchesClient = useRef(clientFactory());
  const appRepoBranchesKey = selectedProvider
    ? fetchAppRepoBranchesKey(selectedProvider)
    : null;

  const { data: repoBranches, error: repoBranchesError } = useSWR<
    IRepoBranchEntry[],
    GenericResponseError
  >(appRepoBranchesKey, () =>
    fetchAppRepoBranches(appRepoBranchesClient.current, auth, selectedProvider!)
  );

  useEffect(() => {
    if (repoBranchesError) {
      ErrorReporter.getInstance().notify(repoBranchesError);
    }
  }, [repoBranchesError]);

  const appSchemaClient = useRef(clientFactory());

  const schemaURL = useMemo(() => {
    if (!selectedProvider) return undefined;

    return getAppCatalogEntrySchemaURL(selectedProvider, selectedBranch);
  }, [selectedBranch, selectedProvider]);

  const appSchemaKey = selectedProvider
    ? fetchAppCatalogEntrySchemaKey(schemaURL)
    : null;
  const { data: providerSchema, error: providerSchemaError } = useSWR<
    RJSFSchema,
    GenericResponseError
  >(appSchemaKey, () =>
    fetchAppCatalogEntrySchema(appSchemaClient.current, auth, schemaURL!)
  );

  useEffect(() => {
    if (providerSchemaError) {
      new FlashMessage(
        'Something went wrong while trying to fetch external app schema.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(providerSchemaError)
      );
      ErrorReporter.getInstance().notify(providerSchemaError);
    }
  }, [providerSchemaError]);

  const appSchema = selectedProvider
    ? providerSchema
    : (testSchema as RJSFSchema);

  const appSchemaIsLoading =
    appSchema === undefined && providerSchemaError === undefined;

  const [formData, setFormData] = useState<RJSFSchema>(
    getDefaultFormData(selectedSchema, organizationID)
  );
  const formDataKey = useRef<number | undefined>(undefined);
  const cleanFormData = cleanDeep(formData, { emptyStrings: false });

  const resetFormData = (newSchema: PrototypeSchemas) => {
    setFormData(getDefaultFormData(newSchema, organizationID));
    formDataKey.current = Date.now();
  };

  const handleSelectedSchemaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSchema = e.target.value as PrototypeSchemas;
    setSelectedSchema(newSchema);
    const newProvider = prototypeProviders.find(
      (provider) => provider === newSchema
    );
    setSelectedBranch(
      newProvider ? getDefaultRepoBranch(newProvider) : undefined
    );
    resetFormData(newSchema);
  };

  const handleSelectedBranchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedBranch(e.target.value);
    resetFormData(selectedSchema);
  };

  const handleFormDataChange = ({
    formData: data,
  }: IChangeEvent<RJSFSchema>) => {
    setFormData(data);
  };

  const handleCreation = (
    _: IChangeEvent<RJSFSchema>,
    e: React.FormEvent<HTMLElement>
  ) => {
    e.preventDefault();

    // TODO: don't create cluster app resources for now
    // and disable navigating to cluster details page

    // eslint-disable-next-line no-console
    console.log(cleanFormData);
    resetFormData(selectedSchema);
  };

  const [formDataPreviewFormat, setFormDataPreviewFormat] =
    useState<FormDataPreviewFormat>(FormDataPreviewFormat.Json);

  // TODO: replace when we use app version instead of branch name
  const version =
    selectedBranch && selectedBranch.startsWith('release-')
      ? selectedBranch.replace('release-', '').replace('x', '0')
      : 'v0.0.0';

  const uiSchema = useMemo(
    () => getUiSchema(selectedSchema, version),
    [version, selectedSchema]
  );

  return (
    <Box width={{ max: '100%', width: 'large' }} gap='medium' margin='auto'>
      <Box direction='row' gap='medium'>
        <InputGroup
          label='Schema'
          info={
            <a
              target='_blank'
              rel='noopener noreferrer'
              href={selectedProvider ? schemaURL : testSchemaURL}
            >
              <Text color='text-weak' size='small'>
                Open schema in new tab <i className='fa fa-open-in-new' />
              </Text>
            </a>
          }
        >
          <Select
            value={selectedSchema}
            onChange={handleSelectedSchemaChange}
            options={prototypeSchemas.slice()}
          />
        </InputGroup>
        {selectedProvider && (
          <Box flex={{ grow: 1 }}>
            <InputGroup label='Branch'>
              <Select
                value={selectedBranch}
                onChange={handleSelectedBranchChange}
                options={repoBranches?.map((entry) => entry.name) ?? []}
              />
            </InputGroup>
          </Box>
        )}
      </Box>
      {appSchemaIsLoading && (
        <Wrapper>
          <img className='loader' src={spinner} />
        </Wrapper>
      )}
      {!appSchemaIsLoading &&
        typeof providerSchemaError === 'undefined' &&
        (typeof appSchema === 'undefined' ? (
          <Text>
            No <code>values.schema.json</code> file found for the selected
            branch.
          </Text>
        ) : (
          <>
            <JSONSchemaForm
              schema={appSchema}
              uiSchema={uiSchema}
              validator={validator}
              formData={formData}
              showErrorList='bottom'
              onSubmit={handleCreation}
              onChange={handleFormDataChange}
              key={formDataKey.current}
            >
              <Box margin={{ vertical: 'medium' }}>
                <Box direction='row' gap='small'>
                  <Button primary={true} type='submit' loading={isCreating}>
                    Create cluster
                  </Button>

                  {!isCreating && (
                    <Button onClick={onCreationCancel}>Cancel</Button>
                  )}
                </Box>
              </Box>
            </JSONSchemaForm>
            {formData !== undefined && (
              <Box margin={{ top: 'large' }}>
                <Text weight='bold'>Form data preview</Text>
                <Box direction='row' gap='medium' margin={{ top: 'small' }}>
                  <RadioInput
                    label='JSON'
                    name='json'
                    checked={
                      formDataPreviewFormat === FormDataPreviewFormat.Json
                    }
                    onChange={() =>
                      setFormDataPreviewFormat(FormDataPreviewFormat.Json)
                    }
                  />
                  <RadioInput
                    label='YAML'
                    name='yaml'
                    checked={
                      formDataPreviewFormat === FormDataPreviewFormat.Yaml
                    }
                    onChange={() =>
                      setFormDataPreviewFormat(FormDataPreviewFormat.Yaml)
                    }
                  />
                </Box>
                <CodeBlock>
                  {formDataPreviewFormat === FormDataPreviewFormat.Json && (
                    <Prompt>
                      {JSON.stringify(cleanFormData, null, '\r  ')}
                    </Prompt>
                  )}
                  {formDataPreviewFormat === FormDataPreviewFormat.Yaml && (
                    <Prompt>
                      {yaml.dump(cleanFormData, {
                        indent: 2,
                        quotingType: '"',
                      })}
                    </Prompt>
                  )}
                </CodeBlock>
              </Box>
            )}
          </>
        ))}
    </Box>
  );
};

export default CreateClusterAppForm;