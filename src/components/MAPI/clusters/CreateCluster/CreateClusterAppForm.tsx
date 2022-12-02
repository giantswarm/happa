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
  | 'Openstack'
  | 'VSphere';

const schemaURLForProviders: Record<PrototypeProviders, string> = {
  AWS: 'https://raw.githubusercontent.com/giantswarm/cluster-aws/master/helm/cluster-aws/values.schema.json',
  'Cloud Director':
    'https://raw.githubusercontent.com/giantswarm/cluster-cloud-director/main/helm/cluster-cloud-director/values.schema.json',
  GCP: 'https://raw.githubusercontent.com/giantswarm/cluster-gcp/main/helm/cluster-gcp/values.schema.json',
  Openstack:
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

  const { data: _appSchema, error: appSchemaError } = useSWR<
    string,
    GenericResponseError
  >(fetchAppCatalogEntrySchemaKey(schemaURL), () =>
    fetchAppCatalogEntrySchema(appSchemaClient.current, auth, schemaURL!)
  );

  useEffect(() => {
    if (appSchemaError) {
      ErrorReporter.getInstance().notify(appSchemaError);
    }
  }, [appSchemaError]);

  const handleCreation = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    if (onCreationComplete) onCreationComplete('');
  };

  return (
    <Box
      as='form'
      onSubmit={handleCreation}
      width={{ max: '100%', width: 'large' }}
      gap='medium'
      margin='auto'
    >
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
      <Box margin={{ top: 'medium' }}>
        <Box direction='row' gap='small'>
          <Button primary={true} type='submit' loading={isCreating}>
            Create cluster
          </Button>

          {!isCreating && <Button onClick={onCreationCancel}>Cancel</Button>}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateClusterAppForm;
