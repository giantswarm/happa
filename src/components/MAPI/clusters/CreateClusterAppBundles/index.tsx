import { RJSFSchema } from '@rjsf/utils';
import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading, Text } from 'grommet';
import { spinner } from 'images';
import yaml from 'js-yaml';
import {
  fetchAppCatalogEntrySchema,
  fetchAppCatalogEntrySchemaKey,
  normalizeAppVersion,
} from 'MAPI/apps/utils';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { MainRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { getAppCatalogEntryValuesSchemaURL } from 'model/services/mapi/applicationv1alpha1';
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
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';
import { compare } from 'utils/semver';

import CreateClusterAppBundlesForm from './CreateClusterAppBundlesForm';
import { PrototypeSchemas } from './schemaUtils';
import {
  createClusterAppResources,
  fetchClusterAppACEList,
  fetchClusterAppACEListKey,
  fetchClusterDefaultAppsACEList,
  fetchClusterDefaultAppsACEListKey,
} from './utils';

const Wrapper = styled.div`
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function getLatestAppCatalogEntry(
  entries: applicationv1alpha1.IAppCatalogEntry[]
): applicationv1alpha1.IAppCatalogEntry {
  return entries
    .slice()
    .sort((a, b) =>
      compare(
        normalizeAppVersion(b.spec.version),
        normalizeAppVersion(a.spec.version)
      )
    )[0];
}

interface ICreateClusterAppBundlesProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

// eslint-disable-next-line complexity
const CreateClusterAppBundles: React.FC<ICreateClusterAppBundlesProps> = (
  props
) => {
  const match = useRouteMatch<{
    orgId: string;
  }>();
  const { orgId } = match.params;
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const organizationID = selectedOrg?.name ?? selectedOrg?.id ?? orgId;

  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();
  const dispatch = useDispatch();

  const [isCreating, setIsCreating] = useState<boolean>(false);

  const clusterDefaultAppsACEClient = useRef(clientFactory());
  const {
    data: clusterDefaultAppsACEList,
    error: clusterDefaultAppsACEListError,
    isLoading: clusterDefaultAppsACEIsLoading,
  } = useSWR<applicationv1alpha1.IAppCatalogEntryList, GenericResponseError>(
    fetchClusterDefaultAppsACEListKey(),
    () =>
      fetchClusterDefaultAppsACEList(
        clusterDefaultAppsACEClient.current,
        auth,
        provider
      )
  );

  const latestClusterDefaultAppsACE = useMemo(() => {
    if (!clusterDefaultAppsACEList) return undefined;

    return getLatestAppCatalogEntry(clusterDefaultAppsACEList.items);
  }, [clusterDefaultAppsACEList]);

  const clusterAppACEClient = useRef(clientFactory());
  const {
    data: clusterAppACEList,
    error: clusterAppACEListError,
    isLoading: clusterAppACEIsLoading,
  } = useSWR<applicationv1alpha1.IAppCatalogEntryList, GenericResponseError>(
    fetchClusterAppACEListKey,
    () => fetchClusterAppACEList(clusterAppACEClient.current, auth, provider)
  );

  useEffect(() => {
    if (clusterAppACEListError || clusterDefaultAppsACEListError) {
      const errorMessage = extractErrorMessage(
        clusterAppACEListError ?? clusterDefaultAppsACEListError
      );

      new FlashMessage(
        'There was a problem loading app versions.',
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(
        clusterAppACEListError ?? clusterDefaultAppsACEListError!
      );
    }
  }, [clusterAppACEListError, clusterDefaultAppsACEListError]);

  const latestClusterAppACE = useMemo(() => {
    if (!clusterAppACEList) return undefined;

    return getLatestAppCatalogEntry(clusterAppACEList.items);
  }, [clusterAppACEList]);

  const schemaURL = latestClusterAppACE
    ? getAppCatalogEntryValuesSchemaURL(latestClusterAppACE)
    : undefined;

  const appSchemaClient = useRef(clientFactory());

  const appSchemaKey = latestClusterAppACE
    ? fetchAppCatalogEntrySchemaKey(schemaURL)
    : null;
  const {
    data: appSchema,
    error: appSchemaError,
    isLoading: appSchemaIsLoading,
  } = useSWR<RJSFSchema, GenericResponseError>(appSchemaKey, () =>
    fetchAppCatalogEntrySchema(appSchemaClient.current, auth, schemaURL!)
  );

  useEffect(() => {
    if (appSchemaError) {
      new FlashMessage(
        'Something went wrong while trying to fetch external app schema.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(appSchemaError)
      );
      ErrorReporter.getInstance().notify(appSchemaError);
    }
  }, [appSchemaError]);

  const handleCreation = async (
    clusterName: string,
    formData: RJSFSchema | undefined
  ) => {
    if (!formData) return;

    setIsCreating(true);

    try {
      await createClusterAppResources(clientFactory, auth, {
        clusterName,
        organization: orgId,
        clusterAppVersion: latestClusterAppACE!.spec.version,
        defaultAppsVersion: latestClusterDefaultAppsACE!.spec.version,
        provider,
        configMapContents: yaml.dump(formData),
      });

      setIsCreating(false);

      const clusterListPath = RoutePath.createUsablePath(MainRoutes.Home);
      dispatch(push(clusterListPath));
    } catch (err) {
      setIsCreating(false);

      new FlashMessage(
        <>Could not create cluster: {extractErrorMessage(err)}</>,
        messageType.ERROR,
        messageTTL.LONG
      );

      ErrorReporter.getInstance().notify(err as Error);
    }
  };

  const handleCreationCancel = () => {
    dispatch(push(MainRoutes.Home));
  };

  const isLoading =
    clusterDefaultAppsACEIsLoading ||
    clusterAppACEIsLoading ||
    appSchemaIsLoading;

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
          {isLoading ? (
            <Wrapper>
              <img className='loader' src={spinner} />
            </Wrapper>
          ) : (
            <Box gap='medium'>
              {!appSchemaIsLoading &&
                (typeof appSchema === 'undefined' ? (
                  <Text>No schema found for the selected app version.</Text>
                ) : (
                  <CreateClusterAppBundlesForm
                    schema={appSchema}
                    provider={provider as PrototypeSchemas}
                    organization={organizationID}
                    appVersion={latestClusterAppACE!.spec.version}
                    onSubmit={handleCreation}
                    key={`${provider}${latestClusterAppACE!.spec.version}`}
                    id='create-cluster-form'
                    render={() => {
                      return (
                        <Box margin={{ vertical: 'medium' }}>
                          <Box direction='row' gap='small'>
                            <Button
                              primary={true}
                              type='submit'
                              form='create-cluster-form'
                              loading={isCreating}
                            >
                              Create cluster now
                            </Button>
                            {!isCreating && (
                              <Button onClick={handleCreationCancel}>
                                Cancel
                              </Button>
                            )}
                          </Box>
                        </Box>
                      );
                    }}
                  />
                ))}
            </Box>
          )}
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default CreateClusterAppBundles;
