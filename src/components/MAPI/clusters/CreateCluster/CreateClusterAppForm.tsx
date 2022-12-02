import Form, { IChangeEvent } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { spinner } from 'images';
import {
  fetchAppCatalogEntrySchema,
  fetchAppCatalogEntrySchemaKey,
} from 'MAPI/apps/AppList/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { IHttpClient } from 'model/clients/HttpClient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import InputGroup from 'UI/Inputs/InputGroup';
import Select from 'UI/Inputs/Select';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

const Wrapper = styled.div`
  position: relative;
  margin: auto;
  text-align: center;
`;

type PrototypeProviders =
  | 'AWS'
  | 'Cloud Director'
  | 'GCP'
  | 'Open Stack'
  | 'VSphere';

const prototypeProviders: PrototypeProviders[] = [
  'AWS',
  'Cloud Director',
  'GCP',
  'Open Stack',
  'VSphere',
];

function getAppRepoName(provider: PrototypeProviders): string {
  switch (provider) {
    case 'AWS':
      return 'cluster-aws';
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

interface ICreateClusterAppFormProps {
  namespace: string;
  organizationID: string;
  onCreationCancel?: () => void;
  onCreationComplete?: (clusterId: string) => void;
}

const CreateClusterAppForm: React.FC<ICreateClusterAppFormProps> = ({
  onCreationCancel,
}) => {
  const [isCreating, _setIsCreating] = useState<boolean>(false);

  const [selectedProvider, setSelectedProvider] = useState<PrototypeProviders>(
    prototypeProviders[0]
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    getDefaultRepoBranch(prototypeProviders[0])
  );

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appRepoBranchesClient = useRef(clientFactory());

  const { data: repoBranches, error: repoBranchesError } = useSWR<
    IRepoBranchEntry[],
    GenericResponseError
  >(fetchAppRepoBranchesKey(selectedProvider), () =>
    fetchAppRepoBranches(appRepoBranchesClient.current, auth, selectedProvider)
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

  const { data: appSchema, error: appSchemaError } = useSWR<
    RJSFSchema,
    GenericResponseError
  >(fetchAppCatalogEntrySchemaKey(schemaURL), () =>
    fetchAppCatalogEntrySchema(appSchemaClient.current, auth, schemaURL!)
  );

  useEffect(() => {
    if (appSchemaError) {
      ErrorReporter.getInstance().notify(appSchemaError);
    }
  }, [appSchemaError]);

  const appSchemaIsLoading =
    appSchema === undefined && appSchemaError === undefined;

  const handleSelectedProviderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newProvider = e.target.value as PrototypeProviders;
    setSelectedProvider(newProvider);
    setSelectedBranch(getDefaultRepoBranch(newProvider));
  };

  const handleCreation = (
    { formData }: IChangeEvent<RJSFSchema>,
    e: React.FormEvent<HTMLElement>
  ) => {
    e.preventDefault();

    // TODO: don't create cluster app resources for now
    // and disable navigating to cluster details page

    // eslint-disable-next-line no-console
    console.log(formData);
  };

  return (
    <Box width={{ max: '100%', width: 'large' }} gap='medium' margin='auto'>
      <Box direction='row' gap='medium'>
        <InputGroup label='Provider'>
          <Select
            value={selectedProvider}
            onChange={handleSelectedProviderChange}
            options={prototypeProviders}
          />
        </InputGroup>
        <Box flex={{ grow: 1 }}>
          <InputGroup label='Branch'>
            <Select
              value={selectedBranch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSelectedBranch(e.target.value)
              }
              options={repoBranches?.map((entry) => entry.name) ?? []}
            />
          </InputGroup>
        </Box>
      </Box>
      {appSchemaIsLoading && (
        <Wrapper>
          <img className='loader' src={spinner} />
        </Wrapper>
      )}
      {!appSchemaIsLoading &&
        (typeof appSchema === 'undefined' ? (
          <Text>
            No <code>values.schema.json</code> file found for the selected
            branch.
          </Text>
        ) : (
          <Form
            schema={appSchema}
            validator={validator}
            onSubmit={handleCreation}
          >
            <Box margin={{ top: 'medium' }}>
              <Box direction='row' gap='small'>
                <Button primary={true} type='submit' loading={isCreating}>
                  Create cluster
                </Button>

                {!isCreating && (
                  <Button onClick={onCreationCancel}>Cancel</Button>
                )}
              </Box>
            </Box>
          </Form>
        ))}
    </Box>
  );
};

export default CreateClusterAppForm;
