import ClusterPicker from 'Apps/AppDetail/InstallAppModal/ClusterPicker';
import InstallAppForm from 'Apps/AppDetail/InstallAppModal/InstallAppForm';
import { validateAppName } from 'Apps/AppDetail/InstallAppModal/utils';
import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Text } from 'grommet';
import yaml from 'js-yaml';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import {
  IProviderClusterForCluster,
  mapClustersToProviderClusters,
} from 'MAPI/clusters/utils';
import {
  fetchClusterListForOrganizations,
  fetchClusterListForOrganizationsKey,
} from 'MAPI/organizations/utils';
import { usePermissionsForReleases } from 'MAPI/releases/permissions/usePermissionsForReleases';
import { getPreviewReleaseVersions } from 'MAPI/releases/utils';
import { Cluster, ClusterList } from 'MAPI/types';
import {
  fetchProviderClustersForClusters,
  fetchProviderClustersForClustersKey,
  getClusterDescription,
  IProviderClusterForClusterName,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as metav1 from 'model/services/mapi/metav1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import { selectCluster } from 'model/stores/main/actions';
import { selectOrganizations } from 'model/stores/organization/selectors';
import { IState } from 'model/stores/state';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR, { useSWRConfig } from 'swr';
import Button from 'UI/Controls/Button';
import { IVersion } from 'UI/Controls/VersionPicker/VersionPickerUtils';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import Modal from 'UI/Layout/Modal';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import useDebounce from 'utils/hooks/useDebounce';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';

import { IAppsPermissions } from './permissions/types';
import {
  createApp,
  fetchAppsForClusters,
  fetchAppsForClustersKey,
  filterClusters,
  formatYAMLError,
} from './utils';

function getOrganizationForCluster(
  cluster: Cluster,
  organizations: Record<string, IOrganization>
): IOrganization | undefined {
  const organization = capiv1beta1.getClusterOrganization(cluster);
  if (!organization) return undefined;

  return Object.values(organizations).find((o) => o.name === organization);
}

function mapClusterToClusterPickerInput(
  entry: IProviderClusterForCluster,
  organizations: Record<string, IOrganization>
): React.ComponentPropsWithoutRef<typeof ClusterPicker>['clusters'][0] {
  const { cluster, providerCluster } = entry;
  const organization = getOrganizationForCluster(cluster, organizations);

  return {
    id: cluster.metadata.name,
    name: getClusterDescription(cluster, providerCluster),
    owner: organization?.id ?? '',
    isAvailable: true,
  };
}

const SEARCH_DEBOUNCE_RATE = 250; // In ms.

const CLUSTER_PICKER_PAGE = 0;
const APP_FORM_PAGE = 1;
const pages: ReadonlyArray<number> = [CLUSTER_PICKER_PAGE, APP_FORM_PAGE];

interface IAppInstallModalProps {
  appName: string;
  chartName: string;
  catalogName: string;
  versions: IVersion[];
  appsPermissions?: IAppsPermissions;
}

const AppInstallModal: React.FC<IAppInstallModalProps> = ({
  appName,
  chartName,
  catalogName,
  versions,
  appsPermissions,
}) => {
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(false);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [namespace, setNamespace] = useState('');
  const [namespaceError, setNamespaceError] = useState('');

  const [valuesYAML, setValuesYAML] = useState<string | null>(null);
  const [valuesYAMLError, setValuesYAMLError] = useState('');

  const [secretsYAML, setSecretsYAML] = useState<string | null>(null);
  const [secretsYAMLError, setSecretsYAMLError] = useState('');

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_RATE);

  const [version, setVersion] = useState(versions[0]?.chartVersion ?? '');

  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  const next = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    }
  };

  const previous = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const onClose = () => {
    setVisible(false);
  };

  const selectedClusterID = useSelector(
    (state: IState) => state.main.selectedClusterID
  );

  const openModal = () => {
    if (selectedClusterID) {
      setPage(1);
    } else {
      setPage(0);
    }
    setName(appName);
    setNameError('');
    setNamespace(appName);
    setNamespaceError('');
    setVisible(true);
  };

  const onSelectCluster = (newClusterID: string) => {
    dispatch(selectCluster(newClusterID));
    next();
  };

  const selectedOrgName = useSelector(
    (state: IState) => state.main.selectedOrganization
  );
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = selectedOrgName
    ? organizations[selectedOrgName]
    : undefined;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();
  const { cache } = useSWRConfig();

  const provider = window.config.info.general.provider;

  const clustersPermissions = usePermissionsForClusters(
    provider,
    selectedOrg?.namespace ?? ''
  );
  const canReadClusters =
    clustersPermissions.canList && clustersPermissions.canGet;

  const clusterListForOrganizationsKey = canReadClusters
    ? fetchClusterListForOrganizationsKey(organizations)
    : null;

  const { data: clusterList, error: clusterListError } = useSWR<
    ClusterList,
    GenericResponseError
  >(clusterListForOrganizationsKey, () =>
    fetchClusterListForOrganizations(
      clientFactory,
      auth,
      cache,
      provider,
      organizations
    )
  );

  useEffect(() => {
    if (clusterListError) {
      new FlashMessage(
        'There was a problem loading clusters.',
        messageType.ERROR,
        messageTTL.FOREVER
      );

      ErrorReporter.getInstance().notify(clusterListError);
    }
  }, [clusterListError]);

  const providerClusterKey = clusterList
    ? fetchProviderClustersForClustersKey(clusterList.items)
    : null;

  const { data: providerClusterList, error: providerClusterListError } = useSWR<
    IProviderClusterForClusterName[],
    GenericResponseError
  >(providerClusterKey, () =>
    fetchProviderClustersForClusters(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (providerClusterListError) {
      new FlashMessage(
        'There was a problem loading provider-specific clusters.',
        messageType.ERROR,
        messageTTL.FOREVER
      );

      ErrorReporter.getInstance().notify(providerClusterListError);
    }
  }, [providerClusterListError]);

  const clustersWithProviderClusters = useMemo(() => {
    if (!clusterList?.items || !providerClusterList) return [];

    return mapClustersToProviderClusters(
      clusterList.items,
      providerClusterList
    );
  }, [clusterList?.items, providerClusterList]);

  const [filteredClusters, setFilteredClusters] = useState<
    React.ComponentPropsWithoutRef<typeof ClusterPicker>['clusters']
  >([]);

  // TODO: remove once preview releases are supported
  const releaseListClient = useRef(clientFactory());

  const releasesPermissions = usePermissionsForReleases(provider, 'default');
  const releaseListKey = releasesPermissions.canList
    ? releasev1alpha1.getReleaseListKey()
    : null;

  const { data: releaseList, error: releaseListError } = useSWR<
    releasev1alpha1.IReleaseList,
    GenericResponseError
  >(releaseListKey, () =>
    releasev1alpha1.getReleaseList(releaseListClient.current, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  const previewReleaseVersions = useMemo(() => {
    if (!releaseList) return [];

    return getPreviewReleaseVersions(releaseList.items);
  }, [releaseList]);

  const appListKey = clusterList?.items
    ? fetchAppsForClustersKey(clusterList.items)
    : null;

  const { data: appsForClusters, error: appsForClustersError } = useSWR<
    Record<string, { appName: string; catalogName: string }[]>,
    GenericResponseError
  >(appListKey, () =>
    fetchAppsForClusters(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (appsForClustersError) {
      ErrorReporter.getInstance().notify(appsForClustersError);
    }
  }, [appsForClustersError]);

  const selectedCluster = useMemo(() => {
    if (!clusterList?.items) return undefined;

    return clusterList?.items.find(
      (cluster) => cluster.metadata.name === selectedClusterID
    );
  }, [clusterList?.items, selectedClusterID]);

  const isAppInstalledInSelectedCluster = useMemo(() => {
    if (!selectedCluster || !appsForClusters) return false;

    return appsForClusters[
      `${selectedCluster.metadata.namespace}/${selectedCluster.metadata.name}`
    ]?.some(
      (app) => app.appName === appName && app.catalogName === catalogName
    );
  }, [appsForClusters, appName, catalogName, selectedCluster]);

  useEffect(() => {
    const clusterCollection = filterClusters(
      clustersWithProviderClusters,
      previewReleaseVersions,
      debouncedQuery
    ).map((c) => mapClusterToClusterPickerInput(c, organizations));

    setFilteredClusters(clusterCollection);
  }, [
    debouncedQuery,
    clusterList,
    organizations,
    clustersWithProviderClusters,
    releaseList?.items,
    previewReleaseVersions,
  ]);

  const updateNamespace = useCallback(
    (ns: string) => {
      setNamespace(ns);
      setNamespaceError(validateAppName(ns).message);
    },
    [setNamespace, setNamespaceError]
  );

  const updateName = (newName: string) => {
    if (namespace === name) {
      // If name and namespace are synced up, keep them that way.
      updateNamespace(newName);
    }
    setName(newName);

    setNameError(validateAppName(newName).message);
  };

  const updateVersion = (newVersion: string) => {
    setVersion(newVersion);
  };

  const updateValuesYAML = (files: FileList | null) => {
    if (!files || files.length < 1) {
      setValuesYAML(null);
      setValuesYAMLError('');

      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const input = (e.target?.result as string) ?? '';
        const parsedYAML = yaml.load(input) as string;
        setValuesYAML(yaml.dump(parsedYAML));
        setValuesYAMLError('');
      } catch (err) {
        setValuesYAMLError(formatYAMLError(err));
      }
    };

    reader.readAsText(files[0]);
  };

  const updateSecretsYAML = (files: FileList | null) => {
    if (!files || files.length < 1) {
      setSecretsYAML(null);
      setSecretsYAMLError('');

      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const input = (e.target?.result as string) ?? '';
        const parsedYAML = yaml.load(input) as string;
        setSecretsYAML(yaml.dump(parsedYAML));
        setSecretsYAMLError('');
      } catch (err) {
        setSecretsYAMLError(formatYAMLError(err));
      }
    };

    reader.readAsText(files[0]);
  };

  const anyValidationErrors = () => {
    if (namespaceError !== '' || nameError !== '' || valuesYAMLError !== '') {
      return true;
    }

    return false;
  };

  const canInstallApps =
    appsPermissions?.canCreate && appsPermissions?.canConfigure;

  const installApp = async () => {
    if (!selectedClusterID || !canInstallApps) return;

    const cluster = clusterList?.items.find(
      (c) => c.metadata.name === selectedClusterID
    );
    if (!cluster) return;

    const organization = getOrganizationForCluster(cluster, organizations);
    if (!organization) return;

    try {
      setLoading(true);

      await createApp(clientFactory, auth, selectedClusterID, {
        name: name,
        catalogName: catalogName,
        chartName: chartName,
        version: version,
        namespace: namespace,
        configMapContents: valuesYAML ?? '',
        secretContents: secretsYAML ?? '',
      });

      setLoading(false);
      onClose();

      const clusterDetailPath = RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.Detail.Apps,
        {
          orgId: organization.id,
          clusterId: selectedClusterID,
        }
      );

      dispatch(push(clusterDetailPath));

      new FlashMessage(
        (
          <>
            Your app <code>{name}</code> is being installed on{' '}
            <code>{selectedClusterID}</code>
          </>
        ),
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (error) {
      if (error) {
        ErrorReporter.getInstance().notify(error as Error);
      }

      let errorMessage: React.ReactNode = '';
      switch (true) {
        case metav1.isStatusError(
          (error as GenericResponseError)?.data,
          metav1.K8sStatusErrorReasons.Invalid
        ):
          errorMessage = `Your input appears to be invalid. Please make sure all fields are filled in correctly.`;

          break;

        case metav1.isStatusError(
          (error as GenericResponseError)?.data,
          metav1.K8sStatusErrorReasons.NotFound
        ):
          errorMessage = `The cluster is not yet ready for app installation. Please try again in a few minutes.`;

          break;

        case metav1.isStatusError(
          (error as GenericResponseError)?.data,
          metav1.K8sStatusErrorReasons.AlreadyExists
        ):
          errorMessage = (
            <>
              An app called <code>{name}</code> already exists on cluster{' '}
              <code>{selectedClusterID}</code>
            </>
          );

          break;

        default:
          errorMessage = `Something went wrong while trying to install your app. Please try again later or contact support: support@giantswarm.io`;
      }

      new FlashMessage(errorMessage, messageType.ERROR, messageTTL.LONG);

      setLoading(false);
    }
  };

  return (
    <>
      {isAppInstalledInSelectedCluster ? (
        <Text margin={{ top: '8px' }} color='text-strong'>
          <i className='fa fa-done' aria-hidden='true' role='presentation' />{' '}
          Installed in this cluster
        </Text>
      ) : (
        <TooltipContainer
          content={
            <Tooltip>
              {!canInstallApps
                ? 'For installing this app, you need additional permissions'
                : 'No clusters available for app installation'}
            </Tooltip>
          }
          show={!canInstallApps || filteredClusters.length === 0}
        >
          <Box>
            <Button
              primary={true}
              onClick={openModal}
              icon={<i className='fa fa-add-circle' />}
              disabled={
                clusterList &&
                providerClusterList &&
                filteredClusters.length === 0
              }
              unauthorized={
                typeof canInstallApps !== 'undefined' && !canInstallApps
              }
            >
              Install in cluster
            </Button>
          </Box>
        </TooltipContainer>
      )}
      {(() => {
        switch (pages[page]) {
          case CLUSTER_PICKER_PAGE:
            return (
              <Modal
                footer={
                  <Button link={true} onClick={onClose}>
                    Cancel
                  </Button>
                }
                onClose={onClose}
                title={`Install ${chartName}: Pick a cluster`}
                visible={visible}
              >
                <ClusterPicker
                  clusters={filteredClusters}
                  onChangeQuery={setQuery}
                  onSelectCluster={onSelectCluster}
                  query={query}
                  selectedClusterID={selectedClusterID}
                />
              </Modal>
            );

          case APP_FORM_PAGE:
            return (
              <Modal
                footer={
                  <Box direction='row' gap='small' justify='end'>
                    <Button
                      primary={true}
                      disabled={anyValidationErrors()}
                      loading={loading}
                      onClick={installApp}
                    >
                      Install app
                    </Button>
                    <Button link={true} onClick={previous}>
                      Pick a different cluster
                    </Button>
                    <Button link={true} onClick={onClose}>
                      Cancel
                    </Button>
                  </Box>
                }
                onClose={onClose}
                title={
                  <>
                    {`Install ${chartName} on`}{' '}
                    <ClusterIDLabel clusterID={selectedClusterID!} />
                  </>
                }
                visible={visible}
              >
                <InstallAppForm
                  appName={chartName}
                  name={name}
                  nameError={nameError}
                  namespace={namespace}
                  namespaceError={namespaceError}
                  version={version}
                  availableVersions={versions}
                  onChangeName={updateName}
                  onChangeNamespace={updateNamespace}
                  onChangeSecretsYAML={updateSecretsYAML}
                  onChangeValuesYAML={updateValuesYAML}
                  onChangeVersion={updateVersion}
                  secretsYAMLError={secretsYAMLError}
                  valuesYAMLError={valuesYAMLError}
                />
              </Modal>
            );
        }

        return null;
      })()}
    </>
  );
};

export default AppInstallModal;
