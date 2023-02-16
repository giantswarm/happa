import { IChangeEvent } from '@rjsf/core';
import { EnumOptionsType, RJSFSchema } from '@rjsf/utils';
import { customizeValidator } from '@rjsf/validator-ajv8';
import Ajv2020 from 'ajv/dist/2020';
import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import cleanDeep from 'clean-deep';
import { push, replace } from 'connected-react-router';
import { Box, Heading, Text } from 'grommet';
import { spinner } from 'images';
import yaml from 'js-yaml';
import {
  fetchAppCatalogEntrySchema,
  fetchAppCatalogEntrySchemaKey,
} from 'MAPI/apps/utils';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { IHttpClient } from 'model/clients/HttpClient';
import { MainRoutes, OrganizationsRoutes } from 'model/constants/routes';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
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
import { toTitleCase } from 'utils/helpers';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import RoutePath from 'utils/routePath';

import {
  cleanDeepWithException,
  getDefaultFormData,
  getUiSchema,
  PrototypeProviders,
  prototypeProviders,
  PrototypeSchemas,
  prototypeSchemas,
} from './schemaUtils';

const validator = customizeValidator({ AjvClass: Ajv2020 });

const Wrapper = styled.div`
  position: relative;
  margin: auto;
  text-align: center;
`;

function getAppRepoName(provider: PrototypeProviders): string {
  return `cluster-${provider}`;
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
  return provider === PrototypeProviders.AWS ? 'master' : 'main';
}

enum FormDataPreviewFormat {
  Json,
  Yaml,
}

const testSchemaURL =
  'https://raw.githubusercontent.com/giantswarm/happa/main/src/components/UI/JSONSchemaForm/test.schema.json';

const Prompt: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <Line prompt={false} text={children} />;
};

Prompt.displayName = 'Prompt';

function formatSchemaSelectLabel(schema: PrototypeSchemas): string {
  switch (schema) {
    case PrototypeProviders.AWS:
    case PrototypeProviders.GCP:
      return schema.toLocaleUpperCase();

    case PrototypeProviders.VSPHERE:
      return 'VSphere';

    default:
      return `${schema
        .split('-')
        .map((word) => toTitleCase(word))
        .join(' ')}`;
  }
}

function formatSchemaSelectOptions(
  schema: PrototypeSchemas[]
): { label: string; value: PrototypeSchemas }[] {
  return schema.map((s) => ({ label: formatSchemaSelectLabel(s), value: s }));
}

interface ICreateClusterAppBundlesProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

// eslint-disable-next-line complexity
const CreateClusterAppBundles: React.FC<ICreateClusterAppBundlesProps> = (
  props
) => {
  const match = useRouteMatch<{
    orgId: string;
    provider?: PrototypeSchemas;
    branch?: string;
  }>();
  const { orgId, provider, branch } = match.params;
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const organizationID = selectedOrg?.name ?? selectedOrg?.id ?? orgId;

  const [isCreating, _setIsCreating] = useState<boolean>(false);

  const [selectedSchema, setSelectedSchema] = useState<PrototypeSchemas>(
    provider
      ? (decodeURIComponent(provider) as PrototypeSchemas)
      : prototypeSchemas[0]
  );
  const selectedProvider = prototypeProviders.find((p) => p === selectedSchema);
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
    branch
      ? decodeURIComponent(branch)
      : selectedProvider
      ? getDefaultRepoBranch(prototypeProviders[0])
      : undefined
  );

  const dispatch = useDispatch();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/init-declarations
    let path: string;

    if (!selectedBranch) {
      path = RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.NewViaAppBundles,
        {
          orgId: organizationID,
        }
      );
    } else {
      path = RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.NewViaAppBundlesProviderBranch,
        {
          orgId: organizationID,
          provider: encodeURIComponent(selectedSchema),
          branch: encodeURIComponent(selectedBranch),
        }
      );
    }

    dispatch(replace(path));
  }, [dispatch, organizationID, selectedBranch, selectedSchema]);

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

  const [formData, setFormData] = useState<RJSFSchema | undefined>(
    getDefaultFormData(selectedSchema, organizationID)
  );
  const formDataKey = useRef<number | undefined>(undefined);
  const cleanFormData = cleanDeep(formData, { emptyStrings: false });

  const resetFormData = (newSchema: PrototypeSchemas) => {
    setFormData(getDefaultFormData(newSchema, organizationID));
    formDataKey.current = Date.now();
  };

  const handleSelectedSchemaChange = (option: EnumOptionsType) => {
    const newSchema = option.value as PrototypeSchemas;
    setSelectedSchema(newSchema);
    const newProvider = prototypeProviders.find((p) => p === newSchema);
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
    if (!data) {
      return;
    }
    setFormData(
      cleanDeepWithException<RJSFSchema>(
        data,
        { emptyStrings: false },
        (value) => Array.isArray(value) && value.length > 0
      ) as RJSFSchema
    );
  };

  const handleCreation = (
    _: IChangeEvent<RJSFSchema>,
    e: React.FormEvent<HTMLElement>
  ) => {
    e.preventDefault();

    // eslint-disable-next-line no-console
    console.log(cleanFormData);
  };

  const handleCreationCancel = () => {
    dispatch(push(MainRoutes.Home));
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
    <Breadcrumb
      data={{ title: 'CREATE CLUSTER APP BUNDLES', pathname: match.url }}
    >
      <DocumentTitle title={`Create Cluster App Bundles | ${orgId}`}>
        <Box {...props}>
          <Box
            fill={true}
            border={{ side: 'bottom' }}
            margin={{ bottom: 'large' }}
          >
            <Heading level={1}>Create a cluster via app bundles</Heading>
          </Box>
          <Box gap='medium'>
            <Box direction='row' gap='medium' width={{ max: 'large' }}>
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
                  value={formatSchemaSelectOptions(prototypeSchemas).find(
                    (s) => s.value === selectedSchema
                  )}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  onChange={(e) => handleSelectedSchemaChange(e.option)}
                  options={formatSchemaSelectOptions(prototypeSchemas)}
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
                        <Button
                          primary={true}
                          type='submit'
                          loading={isCreating}
                        >
                          Create cluster
                        </Button>

                        {!isCreating && (
                          <Button onClick={handleCreationCancel}>Cancel</Button>
                        )}
                      </Box>
                    </Box>
                  </JSONSchemaForm>
                  {formData !== undefined && (
                    <Box margin={{ top: 'large' }} width={{ max: 'large' }}>
                      <Text weight='bold'>Form data preview</Text>
                      <Box
                        direction='row'
                        gap='medium'
                        margin={{ top: 'small' }}
                      >
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
                        {formDataPreviewFormat ===
                          FormDataPreviewFormat.Json && (
                          <Prompt>
                            {JSON.stringify(cleanFormData, null, '\r  ')}
                          </Prompt>
                        )}
                        {formDataPreviewFormat ===
                          FormDataPreviewFormat.Yaml && (
                          <Prompt>
                            {yaml.dump(cleanFormData, {
                              indent: 2,
                              quotingType: '"',
                              lineWidth: -1,
                            })}
                          </Prompt>
                        )}
                      </CodeBlock>
                    </Box>
                  )}
                </>
              ))}
          </Box>
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default CreateClusterAppBundles;
