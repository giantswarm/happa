import Form, { IChangeEvent } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import {
  fetchAppCatalogEntrySchema,
  fetchAppCatalogEntrySchemaKey,
} from 'MAPI/apps/AppList/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import InputGroup from 'UI/Inputs/InputGroup';
import Select from 'UI/Inputs/Select';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

// TODO: prototype
type PrototypeProviders =
  | 'AWS'
  | 'Cloud Director'
  | 'GCP'
  | 'Open Stack'
  | 'VSphere';

const schemaURLForProviders: Record<PrototypeProviders, string> = {
  AWS: 'https://raw.githubusercontent.com/giantswarm/cluster-aws/master/helm/cluster-aws/values.schema.json',
  'Cloud Director':
    'https://raw.githubusercontent.com/giantswarm/cluster-cloud-director/main/helm/cluster-cloud-director/values.schema.json',
  GCP: 'https://raw.githubusercontent.com/giantswarm/cluster-gcp/main/helm/cluster-gcp/values.schema.json',
  'Open Stack':
    'https://raw.githubusercontent.com/giantswarm/cluster-openstack/main/helm/cluster-openstack/values.schema.json',
  VSphere:
    'https://raw.githubusercontent.com/giantswarm/cluster-vsphere/main/helm/cluster-vsphere/values.schema.json',
};

function getAppCatalogEntrySchemaURL(provider: PrototypeProviders) {
  return schemaURLForProviders[provider];
}
//

interface ICreateClusterAppFormProps {
  namespace: string;
  organizationID: string;
  onCreationCancel?: () => void;
  onCreationComplete?: (clusterId: string) => void;
}

const CreateClusterAppForm: React.FC<ICreateClusterAppFormProps> = ({
  onCreationCancel,
  onCreationComplete,
}) => {
  const [isCreating, _setIsCreating] = useState<boolean>(false);

  // TODO: prototype
  const [selectedProvider, setSelectedProvider] = useState<string>(
    Object.keys(schemaURLForProviders)[0]
  );

  const clientFactory = useHttpClientFactory();
  const appSchemaClient = useRef(clientFactory());
  const auth = useAuthProvider();

  const schemaURL = useMemo(() => {
    if (!selectedProvider) return undefined;

    return getAppCatalogEntrySchemaURL(selectedProvider as PrototypeProviders);
  }, [selectedProvider]);

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

  const handleCreation = (
    { formData }: IChangeEvent<RJSFSchema>,
    e: React.FormEvent<HTMLElement>
  ) => {
    e.preventDefault();

    // TODO: create cluster app resources

    if (onCreationComplete) onCreationComplete('');

    // TODO: remove
    // eslint-disable-next-line no-console
    console.log(formData);
  };

  return (
    <Box width={{ max: '100%', width: 'large' }} gap='medium' margin='auto'>
      <InputGroup label='Provider'>
        <Box width='200px'>
          <Select
            value={selectedProvider}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSelectedProvider(e.target.value as PrototypeProviders)
            }
            options={Object.keys(schemaURLForProviders)}
          />
        </Box>
      </InputGroup>
      {!appSchemaIsLoading && (
        <Form
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          schema={appSchema!}
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
      )}
    </Box>
  );
};

export default CreateClusterAppForm;
