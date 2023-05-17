import { RJSFSchema } from '@rjsf/utils';
import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { spinner } from 'images';
import yaml from 'js-yaml';
import {
  fetchAppCatalogEntrySchema,
  fetchAppCatalogEntrySchemaKey,
  normalizeAppVersion,
} from 'MAPI/apps/utils';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { Providers } from 'model/constants';
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
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import InputGroup from 'UI/Inputs/InputGroup';
import Select from 'UI/Inputs/Select';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';
import { compare } from 'utils/semver';

import CreateClusterAppBundlesForm from './CreateClusterAppBundlesForm';
import CreateClusterConfigViewer from './CreateClusterConfigViewer';
import { PrototypeSchemas } from './schemaUtils';
import {
  createClusterAppResources,
  fetchClusterAppACEList,
  fetchClusterAppACEListKey,
  fetchClusterDefaultAppsACEList,
  fetchClusterDefaultAppsACEListKey,
} from './utils';

export const CLUSTER_CREATION_FORM_MAX_WIDTH = '750px';

const Wrapper = styled.div`
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled(Text)`
  display: block;
  width: 28px;
  font-size: 28px;
`;

const StyledText = styled(Text)`
  &:hover {
    text-decoration: 'underline';
  }
`;

const StyledInputGroup = styled(InputGroup)`
  display: flex;
  flex-direction: row;
  algin-items: baseline;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => normalizeColor('input-highlight', theme)};
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

function formatClusterAppVersionSelectorLabel(
  clusterAppACE: applicationv1alpha1.IAppCatalogEntry,
  latestClusterAppACE: applicationv1alpha1.IAppCatalogEntry
) {
  return `v${clusterAppACE.spec.version}${
    clusterAppACE.spec.version === latestClusterAppACE.spec.version
      ? ' (latest)'
      : ''
  }`;
}

function getAppReleasesURL(provider: PropertiesOf<typeof Providers>) {
  const appRepoName =
    applicationv1alpha1.getClusterAppNameForProvider(provider);

  return `https://www.github.com/giantswarm/${appRepoName}/releases/`;
}

enum Pages {
  CreationFormPage = 'CREATION_FORM_PAGE',
  ConfigViewerPage = 'CONFIG_VIEWER_PAGE',
}

enum FormSubmitterID {
  CreateCluster = 'create-cluster',
  GetConfigValues = 'get-config-values',
}

const CREATE_CLUSTER_FORM_ID = 'create-cluster-form';
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

  const [page, setPage] = useState<Pages>(Pages.CreationFormPage);
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

  const [selectedClusterApp, setSelectedClusterApp] = useState<
    applicationv1alpha1.IAppCatalogEntry | undefined
  >(undefined);

  useEffect(() => {
    if (!latestClusterAppACE) return;

    setSelectedClusterApp(latestClusterAppACE);
  }, [latestClusterAppACE]);

  const schemaURL = selectedClusterApp
    ? getAppCatalogEntryValuesSchemaURL(selectedClusterApp)
    : undefined;

  const appSchemaClient = useRef(clientFactory());

  const appSchemaKey = selectedClusterApp
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

  const [formPayload, setFormPayload] = useState<{
    clusterName: string;
    formData: RJSFSchema | undefined;
  }>({ clusterName: '', formData: undefined });

  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
    clusterName: string,
    formData: RJSFSchema | undefined
  ) => {
    if (formData) setFormPayload({ clusterName, formData });

    const submitterID = e.nativeEvent.submitter?.id;

    switch (submitterID) {
      case FormSubmitterID.GetConfigValues: {
        setPage(Pages.ConfigViewerPage);

        return;
      }

      case FormSubmitterID.CreateCluster: {
        try {
          await createClusterAppResources(clientFactory, auth, {
            clusterName,
            organization: orgId,
            clusterAppVersion: selectedClusterApp!.spec.version,
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
      }
    }
  };

  const handleCreationCancel = () => {
    dispatch(push(MainRoutes.Home));
  };

  const isLoading =
    clusterDefaultAppsACEIsLoading ||
    clusterAppACEIsLoading ||
    latestClusterAppACE === undefined ||
    selectedClusterApp === undefined;

  return (
    <Breadcrumb data={{ title: 'CREATE NEW CLUSTER', pathname: match.url }}>
      <DocumentTitle title={`Create new cluster | ${orgId}`}>
        <Box {...props} gap='medium'>
          <Box fill={true} border={{ side: 'bottom' }}>
            <Heading level={1}>Create new cluster</Heading>
          </Box>
          {isLoading && (
            <Wrapper>
              <img className='loader' src={spinner} />
            </Wrapper>
          )}
          {page === Pages.CreationFormPage && !isLoading && (
            <Box gap='medium'>
              <Box width={CLUSTER_CREATION_FORM_MAX_WIDTH}>
                <Text>
                  Here you can create a new cluster interactively, or create a
                  cluster configuration which you can then use in a GitOps
                  context.
                </Text>
              </Box>
              <StyledInputGroup
                label={
                  <Box direction='row' align='baseline' gap='xsmall'>
                    <Text weight='normal'>Cluster app version</Text>
                    <TooltipContainer
                      content={
                        <Tooltip>
                          The cluster app version specifies versions and
                          configurations of cluster components, e.g. the
                          Kubernetes version.
                        </Tooltip>
                      }
                    >
                      <i
                        className='fa fa-info'
                        aria-hidden={true}
                        role='presentation'
                      />
                    </TooltipContainer>
                  </Box>
                }
                contentProps={{ margin: { left: 'medium' } }}
              >
                <Box width='185px'>
                  <Select
                    value={selectedClusterApp}
                    labelKey={(
                      currentACE: applicationv1alpha1.IAppCatalogEntry
                    ) =>
                      formatClusterAppVersionSelectorLabel(
                        currentACE,
                        latestClusterAppACE
                      )
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    onChange={(e) => setSelectedClusterApp(e.option)}
                    options={clusterAppACEList!.items.sort((a, b) =>
                      compare(b.spec.version, a.spec.version)
                    )}
                  />
                </Box>
                <Text>
                  Details on all versions are available on{' '}
                  <StyledLink
                    target='_blank'
                    rel='noopener noreferrer'
                    href={getAppReleasesURL(provider)}
                  >
                    GitHub <i className='fa fa-open-in-new' />
                  </StyledLink>
                  .
                </Text>
              </StyledInputGroup>
              {appSchemaIsLoading && (
                <Wrapper>
                  <img className='loader' src={spinner} />
                </Wrapper>
              )}
              {!appSchemaIsLoading && typeof appSchema !== 'undefined' ? (
                <CreateClusterAppBundlesForm
                  schema={appSchema}
                  provider={provider as PrototypeSchemas}
                  organization={organizationID}
                  appVersion={selectedClusterApp.spec.version}
                  onSubmit={handleSubmit}
                  formData={formPayload.formData}
                  key={`${provider}${selectedClusterApp.spec.version}`}
                  id={CREATE_CLUSTER_FORM_ID}
                  render={() => {
                    return (
                      <Box
                        gap='medium'
                        margin={{ top: 'medium' }}
                        pad={{ top: 'medium' }}
                        border='top'
                      >
                        <Box width={{ max: CLUSTER_CREATION_FORM_MAX_WIDTH }}>
                          <Text>
                            {`To create your cluster through GitOps, or using
                              kubectl-gs, or to document this cluster's config,
                              choose this option. You can still proceed to
                              create the cluster next.`}
                          </Text>
                        </Box>
                        <Button
                          type='submit'
                          form={CREATE_CLUSTER_FORM_ID}
                          id={FormSubmitterID.GetConfigValues}
                        >
                          Get config or manifest
                        </Button>
                      </Box>
                    );
                  }}
                />
              ) : (
                <Text>No schema found for the selected app version.</Text>
              )}
            </Box>
          )}
          {page === Pages.ConfigViewerPage && !isLoading && (
            <Box gap='medium'>
              <Box
                direction='row'
                width='max-content'
                role='button'
                focusIndicator={false}
                onClick={() => setPage(Pages.CreationFormPage)}
              >
                <Icon
                  className='fa fa-chevron-left'
                  aria-hidden='true'
                  role='presentation'
                />
                <StyledText>Change configuration</StyledText>
              </Box>
              <CreateClusterConfigViewer
                clusterAppConfig={{
                  clusterName: formPayload.clusterName,
                  organization: orgId,
                  clusterAppVersion: selectedClusterApp.spec.version,
                  defaultAppsVersion: latestClusterDefaultAppsACE!.spec.version,
                  provider,
                  configMapContents: yaml.dump(formPayload.formData),
                }}
              />
            </Box>
          )}
          {!isLoading && !appSchemaIsLoading && (
            <Box
              direction='row'
              gap='small'
              pad={{ top: 'medium' }}
              border='top'
            >
              <Button
                primary={true}
                type='submit'
                form={CREATE_CLUSTER_FORM_ID}
                loading={isCreating}
                id={FormSubmitterID.CreateCluster}
              >
                Create cluster now
              </Button>
              {!isCreating && (
                <Button onClick={handleCreationCancel}>Cancel</Button>
              )}
            </Box>
          )}
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default CreateClusterAppBundles;
