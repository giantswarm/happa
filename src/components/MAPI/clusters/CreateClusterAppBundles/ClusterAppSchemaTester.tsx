import { EnumOptionsType, RJSFSchema } from '@rjsf/utils';
import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { replace } from 'connected-react-router';
import { Box, Heading, Text } from 'grommet';
import { spinner } from 'images';
import {
  fetchAppCatalogEntrySchema,
  fetchAppCatalogEntrySchemaKey,
} from 'MAPI/apps/utils';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { IHttpClient } from 'model/clients/HttpClient';
import { Providers } from 'model/constants';
import { AccountSettingsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { selectOrganizations } from 'model/stores/organization/selectors';
import { IState } from 'model/stores/state';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import InputGroup from 'UI/Inputs/InputGroup';
import Select from 'UI/Inputs/Select';
import testSchema from 'UI/JSONSchemaForm/test.schema.json';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { toTitleCase } from 'utils/helpers';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import RoutePath from 'utils/routePath';

import CreateClusterAppBundlesForm from './CreateClusterAppBundlesForm';
import {
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

function getAppCatalogEntrySchemaURL(
  provider: PrototypeProviders,
  branch?: string
): string {
  const appRepoName =
    applicationv1alpha1.getClusterAppNameForProvider(provider);
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
  const appRepoName =
    applicationv1alpha1.getClusterAppNameForProvider(provider);
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
  const appRepoName =
    applicationv1alpha1.getClusterAppNameForProvider(provider);

  return `https://api.github.com/repos/giantswarm/${appRepoName}/branches`;
}

function getDefaultRepoBranch(provider: PrototypeProviders) {
  return provider === Providers.CAPA ? 'master' : 'main';
}

const testSchemaURL =
  'https://raw.githubusercontent.com/giantswarm/happa/main/src/components/UI/JSONSchemaForm/test.schema.json';

function formatSchemaSelectLabel(schema: PrototypeSchemas): string {
  switch (schema) {
    case Providers.CAPA:
      return 'AWS';
    case Providers.CAPZ:
      return 'Azure';
    case Providers.GCP:
      return schema.toLocaleUpperCase();
    case Providers.VSPHERE:
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

function getProviderFromPath(providerFromPath: string): PrototypeSchemas {
  switch (providerFromPath) {
    case 'aws':
      return Providers.CAPA;
    case 'azure':
      return Providers.CAPZ;
    default:
      return decodeURIComponent(providerFromPath) as PrototypeSchemas;
  }
}

function getPathForProvider(provider: PrototypeSchemas): string {
  switch (provider) {
    case Providers.CAPA:
      return 'aws';
    case Providers.CAPZ:
      return 'azure';
    default:
      return encodeURIComponent(provider);
  }
}

interface IClusterAppSchemaTesterProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterAppSchemaTester: React.FC<IClusterAppSchemaTesterProps> = (
  props
) => {
  const match = useRouteMatch<{
    provider?: string;
    branch?: string;
  }>();
  const { provider, branch } = match.params;

  const selectedOrgName = useSelector(
    (state: IState) => state.main.selectedOrganization
  );
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = selectedOrgName
    ? organizations[selectedOrgName]
    : undefined;

  const organizationID = selectedOrg?.name ?? selectedOrg?.id ?? '';

  const [isCreating, _setIsCreating] = useState<boolean>(false);

  const [selectedSchema, setSelectedSchema] = useState<PrototypeSchemas>(
    provider ? getProviderFromPath(provider) : prototypeSchemas[0]
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
        AccountSettingsRoutes.Experiments.ClusterAppSchemaTester
      );
    } else {
      path = RoutePath.createUsablePath(
        AccountSettingsRoutes.Experiments.ClusterAppSchemaTesterProviderBranch,
        {
          provider: getPathForProvider(selectedSchema),
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

  const rawSchema = selectedProvider
    ? providerSchema
    : (testSchema as RJSFSchema);

  const appSchemaIsLoading =
    rawSchema === undefined && providerSchemaError === undefined;

  const handleSelectedSchemaChange = (option: EnumOptionsType) => {
    const newSchema = option.value as PrototypeSchemas;
    setSelectedSchema(newSchema);
    const newProvider = prototypeProviders.find((p) => p === newSchema);
    setSelectedBranch(
      newProvider ? getDefaultRepoBranch(newProvider) : undefined
    );
  };

  const handleSelectedBranchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedBranch(e.target.value);
  };

  const handleFormSubmit = (
    _e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
    _clusterName: string,
    data: RJSFSchema | undefined
  ) => {
    // eslint-disable-next-line no-console
    console.log(data);
  };

  const version =
    selectedBranch && selectedBranch.startsWith('release-')
      ? selectedBranch.replace('release-v', '').replace('x', '0')
      : '0.0.0';

  return (
    <Breadcrumb
      data={{ title: 'CLUSTER APP SCHEMA TESTER', pathname: match.url }}
    >
      <DocumentTitle title='Cluster App Schema Tester'>
        <Box {...props}>
          <Box
            fill={true}
            border={{ side: 'bottom' }}
            margin={{ bottom: 'large' }}
          >
            <Heading level={1}>Cluster app schema tester</Heading>
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
              (typeof rawSchema === 'undefined' ? (
                <Text>
                  No <code>values.schema.json</code> file found for the selected
                  branch.
                </Text>
              ) : (
                <CreateClusterAppBundlesForm
                  schema={rawSchema}
                  provider={selectedSchema}
                  organization={organizationID}
                  appVersion={version}
                  onSubmit={handleFormSubmit}
                  key={`${selectedSchema}${selectedBranch}`}
                  render={({ formDataPreview }) => {
                    return (
                      <Box
                        width={{ max: 'large' }}
                        margin={{ top: 'medium' }}
                        pad={{ top: 'medium' }}
                        border='top'
                        gap='small'
                      >
                        <Text weight='bold'>Form data preview</Text>
                        {formDataPreview}
                      </Box>
                    );
                  }}
                >
                  <Box margin={{ vertical: 'medium' }}>
                    <Box direction='row' gap='small'>
                      <Button primary={true} type='submit' loading={isCreating}>
                        Test form submit
                      </Button>
                    </Box>
                  </Box>
                </CreateClusterAppBundlesForm>
              ))}
          </Box>
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default ClusterAppSchemaTester;
