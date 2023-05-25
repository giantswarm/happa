import { RJSFSchema, RJSFValidationError } from '@rjsf/utils';
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
import { MainRoutes, OrganizationsRoutes } from 'model/constants/routes';
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
import ErrorMessage from 'UI/Display/ErrorMessage';
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
import CreateClusterStatus from './CreateClusterStatus';
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

const FormPageWrapper = styled(Box)`
  display: ${({ hidden }) => (hidden ? 'none' : 'flex')};
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
  align-items: baseline;
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

function formatClusterAppResourcesError(error: string) {
  return error
    .replace(/resource named (\S+)/, 'resource named <code>$1</code>')
    .replace(/in namespace (\S+)/, 'in namespace <code>$1</code>');
}

enum Pages {
  CreationFormPage = 'CREATION_FORM_PAGE',
  ConfigViewerPage = 'CONFIG_VIEWER_PAGE',
  CreationStatus = 'CREATION_STATUS',
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
    clusterId: string;
  }>();
  const { orgId, clusterId } = match.params;
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const organizationID = selectedOrg?.name ?? selectedOrg?.id ?? orgId;

  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();
  const dispatch = useDispatch();

  const [page, setPage] = useState<Pages>(
    clusterId ? Pages.CreationStatus : Pages.CreationFormPage
  );
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);

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
    fetchClusterAppACEListKey(),
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
    clusterName: string | undefined;
    formData: RJSFSchema | undefined;
  }>({ clusterName: undefined, formData: undefined });

  const [clusterAppResourcesError, setClusterAppResourcesError] = useState<
    string | undefined
  >();
  const [clusterAppResourcesErrorDetails, setClusterAppResourcesErrorDetails] =
    useState<string | undefined>();

  const handleChange = ({
    clusterName,
    cleanFormData,
  }: {
    clusterName: string;
    cleanFormData: RJSFSchema | undefined;
  }) => {
    if (cleanFormData) setFormPayload({ clusterName, formData: cleanFormData });
  };

  const handleSubmit = async (
    _e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
    clusterName: string,
    formData: RJSFSchema | undefined
  ) => {
    if (formData) setFormPayload({ clusterName, formData });

    try {
      setIsCreating(true);
      await createClusterAppResources(clientFactory, auth, {
        clusterName,
        organization: orgId,
        clusterAppVersion: latestClusterAppACE!.spec.version,
        defaultAppsVersion: latestClusterDefaultAppsACE!.spec.version,
        provider,
        configMapContents: yaml.dump(formData),
      });

      setIsCreating(false);

      setPage(Pages.CreationStatus);
      const clusterCreationStatusPath = RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.NewStatus,
        {
          orgId,
          clusterId: clusterName,
        }
      );

      dispatch(push(clusterCreationStatusPath));
    } catch (err) {
      setIsCreating(false);

      setClusterAppResourcesError(extractErrorMessage(err));
      const cause = (err as Error).cause;
      if (cause) {
        setClusterAppResourcesErrorDetails(extractErrorMessage(cause));
      }

      ErrorReporter.getInstance().notify(err as Error);
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
          {!isLoading && (
            <FormPageWrapper
              gap='medium'
              hidden={page !== Pages.CreationFormPage}
            >
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
                  onError={(errors: RJSFValidationError[]) =>
                    setHasErrors(errors.length > 0)
                  }
                  onChange={handleChange}
                  formData={formPayload.formData}
                  key={`${provider}${selectedClusterApp.spec.version}`}
                  clusterName={formPayload.clusterName}
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
                        <Button onClick={() => setPage(Pages.ConfigViewerPage)}>
                          Get config or manifest
                        </Button>
                      </Box>
                    );
                  }}
                />
              ) : (
                <Text>No schema found for the selected app version.</Text>
              )}
            </FormPageWrapper>
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
                  clusterName: formPayload.clusterName!,
                  organization: orgId,
                  clusterAppVersion: selectedClusterApp.spec.version,
                  defaultAppsVersion: latestClusterDefaultAppsACE!.spec.version,
                  provider,
                  configMapContents: yaml.dump(formPayload.formData),
                }}
              />
            </Box>
          )}
          {!isLoading &&
            page !== Pages.CreationStatus &&
            clusterAppResourcesError && (
              <Box
                border={{ side: 'top' }}
                margin={{ top: 'medium' }}
                pad={{ top: 'medium' }}
              >
                <ErrorMessage
                  width={{ max: CLUSTER_CREATION_FORM_MAX_WIDTH }}
                  error={formatClusterAppResourcesError(
                    clusterAppResourcesError
                  )}
                  details={clusterAppResourcesErrorDetails}
                >
                  {page === Pages.CreationFormPage ? (
                    <Text>
                      An error occurred when attempting to create the cluster
                      app resources. Please check the details below. You can
                      adjust the configuration and retry. Otherwise, you can use{' '}
                      <strong>Get config or manifest</strong> to save the full
                      manifest and contact Giant Swarm support for help. Please
                      also provide the full error message in that case.
                    </Text>
                  ) : (
                    <Text>
                      An error occurred when attempting to create the cluster
                      app resources. Please check the details below. If you want
                      to adjust the configuration and retry, click{' '}
                      <strong>Change configuration</strong> above. Otherwise,
                      you can save the full manifest and contact Giant Swarm
                      support for help. Please also provide the full error
                      message in that case.
                    </Text>
                  )}
                </ErrorMessage>
              </Box>
            )}
          {!isLoading &&
            !appSchemaIsLoading &&
            page !== Pages.CreationStatus && (
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
                  disabled={hasErrors}
                  loading={isCreating}
                >
                  Create cluster now
                </Button>
                {!isCreating && (
                  <Button onClick={handleCreationCancel}>Cancel</Button>
                )}
              </Box>
            )}
          {!isLoading && page === Pages.CreationStatus && (
            <CreateClusterStatus />
          )}
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default CreateClusterAppBundles;
