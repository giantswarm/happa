import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import { usePermissionsForCPNodes } from 'MAPI/clusters/permissions/usePermissionsForCPNodes';
import { hasClusterAppLabel } from 'MAPI/clusters/utils';
import { usePermissionsForReleases } from 'MAPI/releases/permissions/usePermissionsForReleases';
import { ClusterList } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchClusterList,
  fetchClusterListKey,
  supportsReleases,
} from 'MAPI/utils';
import { usePermissionsForNodePools } from 'MAPI/workernodes/permissions/usePermissionsForNodePools';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { StatusCodes } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import { organizationsLoadMAPI } from 'model/stores/organization/actions';
import { selectOrganizations } from 'model/stores/organization/selectors';
import { IState } from 'model/stores/state';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';
import CLIGuidesList from 'UI/Display/MAPI/CLIGuide/CLIGuidesList';
import OrganizationDetailPage from 'UI/Display/Organizations/OrganizationDetailPage';
import * as ui from 'UI/Display/Organizations/types';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import DeleteOrganizationGuide from '../guides/DeleteOrganizationGuide';
import GetOrganizationDetailsGuide from '../guides/GetOrganizationDetailsGuide';
import { usePermissionsForOrganizations } from '../permissions/usePermissionsForOrganizations';
import {
  fetchClustersSummary,
  fetchClustersSummaryKey,
  fetchReleasesSummary,
  fetchReleasesSummaryKey,
  fetchVersionsSummary,
  fetchVersionsSummaryKey,
} from './utils';

interface IOrganizationDetailGeneralProps {
  organizationName: string;
  organizationNamespace: string;
  isManagedByGitOps?: boolean;
}

const OrganizationDetailGeneral: React.FC<
  React.PropsWithChildren<IOrganizationDetailGeneralProps>
> = ({ organizationName, organizationNamespace, isManagedByGitOps }) => {
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = organizations[organizationName];

  const auth = useAuthProvider();
  const clientFactory = useHttpClientFactory();

  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  const provider = window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;

  const clustersPermissions = usePermissionsForClusters(
    provider,
    organizationNamespace
  );

  const clusterListKey = clustersPermissions.canList
    ? () => fetchClusterListKey(provider, organizationNamespace, selectedOrg)
    : null;

  const {
    data: clusterList,
    error: clusterListError,
    isLoading: clusterListIsLoading,
  } = useSWR<ClusterList, GenericResponseError>(clusterListKey, () =>
    fetchClusterList(
      clientFactory,
      auth,
      provider,
      organizationNamespace,
      selectedOrg
    )
  );

  useEffect(() => {
    if (!clusterListError) return;

    if (
      clusterListError.status === StatusCodes.NotFound &&
      !metav1.isStatusError(
        clusterListError.data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      // The `v1alpha3.Cluster` CRD is not ensured.
      return;
    }

    new FlashMessage(
      'There was a problem loading clusters in this organization.',
      messageType.ERROR,
      messageTTL.FOREVER
    );

    ErrorReporter.getInstance().notify(clusterListError);
  }, [clusterListError]);

  const orgPermissions = usePermissionsForOrganizations(provider, 'default');

  const handleDelete = async () => {
    if (!orgPermissions.canDelete) {
      return Promise.reject(
        new Error('Insufficient permissions to delete organization')
      );
    }

    try {
      const client = clientFactory();

      const org = await securityv1alpha1.getOrganization(
        client,
        auth,
        organizationName
      );
      await securityv1alpha1.deleteOrganization(client, auth, org);

      await dispatch(organizationsLoadMAPI(auth));

      return Promise.resolve();
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      return Promise.reject(new Error(errorMessage));
    }
  };

  const CPNodesPermissions = usePermissionsForCPNodes(
    provider,
    organizationNamespace
  );
  const nodePoolsPermissions = usePermissionsForNodePools(
    provider,
    organizationNamespace
  );

  const {
    data: clustersSummary,
    error: clustersSummaryError,
    isLoading: clustersSummaryIsLoading,
  } = useSWR<ui.IOrganizationDetailClustersSummary, GenericResponseError>(
    () => fetchClustersSummaryKey(clusterList?.items),
    () =>
      fetchClustersSummary(
        clientFactory,
        auth,
        clusterList!.items,
        CPNodesPermissions,
        nodePoolsPermissions
      )
  );

  useEffect(() => {
    if (clustersSummaryError) {
      ErrorReporter.getInstance().notify(clustersSummaryError);
    }
  }, [clustersSummaryError]);

  const releasesPermissions = usePermissionsForReleases(provider, 'default');
  const isReleasesSupportedByProvider = supportsReleases(providerFlavor);

  const releasesSummaryKey =
    releasesPermissions.canGet && isReleasesSupportedByProvider
      ? () => fetchReleasesSummaryKey(clusterList?.items)
      : null;

  const {
    data: releasesSummary,
    error: releasesSummaryError,
    isLoading: releasesSummaryIsLoading,
  } = useSWR<ui.IOrganizationDetailReleasesSummary, GenericResponseError>(
    releasesSummaryKey,
    () => fetchReleasesSummary(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (releasesSummaryError) {
      ErrorReporter.getInstance().notify(releasesSummaryError);
    }
  }, [releasesSummaryError]);

  const hasClusterApp = useMemo(() => {
    if (!clusterList) return undefined;

    return clusterList.items.some((cluster) => hasClusterAppLabel(cluster));
  }, [clusterList]);

  const versionsSummaryKey = hasClusterApp
    ? () => fetchVersionsSummaryKey(clusterList?.items)
    : null;

  const {
    data: versionsSummary,
    error: versionsSummaryError,
    isLoading: versionsSummaryIsLoading,
  } = useSWR<ui.IOrganizationDetailVersionsSummary, GenericResponseError>(
    versionsSummaryKey,
    () => fetchVersionsSummary(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (versionsSummaryError) {
      ErrorReporter.getInstance().notify(versionsSummaryError);
    }
  }, [versionsSummaryError]);

  return (
    <>
      <OrganizationDetailPage
        organizationName={organizationName}
        organizationNamespace={organizationNamespace}
        onDelete={handleDelete}
        canDeleteOrganizations={orgPermissions.canDelete}
        readOnly={isManagedByGitOps}
        clusterCount={clusterList?.items.length}
        clusterCountLoading={clusterListIsLoading}
        clustersSummary={clustersSummary}
        clustersSummaryLoading={clustersSummaryIsLoading}
        releasesSummary={releasesSummary}
        releasesSummaryLoading={releasesSummaryIsLoading}
        isReleasesSupported={isReleasesSupportedByProvider}
        versionsSummary={versionsSummary}
        versionsSummaryLoading={versionsSummaryIsLoading}
        hasClusterApp={hasClusterApp}
      />
      <CLIGuidesList margin={{ top: 'large' }}>
        <GetOrganizationDetailsGuide organizationName={organizationName} />
        {!isManagedByGitOps && (
          <DeleteOrganizationGuide
            organizationName={organizationName}
            canDeleteOrganization={orgPermissions.canDelete}
          />
        )}
      </CLIGuidesList>
    </>
  );
};

export default OrganizationDetailGeneral;
