import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import { usePermissionsForCPNodes } from 'MAPI/clusters/permissions/usePermissionsForCPNodes';
import { usePermissionsForReleases } from 'MAPI/releases/permissions/usePermissionsForReleases';
import { ClusterList } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchClusterList,
  fetchClusterListKey,
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
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';
import OrganizationDetailPage from 'UI/Display/Organizations/OrganizationDetailPage';
import * as ui from 'UI/Display/Organizations/types';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import DeleteOrganizationGuide from '../guides/DeleteOrganizationGuide';
import GetOrganizationDetailsGuide from '../guides/GetOrganizationDetailsGuide';
import { usePermissionsForOrganizations } from '../permissions/usePermissionsForOrganizations';
import {
  fetchAppsSummary,
  fetchAppsSummaryKey,
  fetchClustersSummary,
  fetchClustersSummaryKey,
  fetchReleasesSummary,
  fetchReleasesSummaryKey,
} from './utils';

interface IOrganizationDetailGeneralProps {
  organizationName: string;
  organizationNamespace: string;
}

const OrganizationDetailGeneral: React.FC<IOrganizationDetailGeneralProps> = ({
  organizationName,
  organizationNamespace,
}) => {
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = organizations[organizationName];
  const selectedOrgID = selectedOrg?.name ?? selectedOrg?.id;

  const auth = useAuthProvider();
  const clientFactory = useHttpClientFactory();

  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  const provider = window.config.info.general.provider;

  const clustersPermissions = usePermissionsForClusters(
    provider,
    organizationNamespace
  );

  const clusterListKey = clustersPermissions.canList
    ? () => fetchClusterListKey(provider, organizationNamespace, selectedOrgID)
    : null;

  const {
    data: clusterList,
    error: clusterListError,
    isValidating: clusterListIsValidating,
  } = useSWR<ClusterList, GenericResponseError>(clusterListKey, () =>
    fetchClusterList(
      clientFactory,
      auth,
      provider,
      organizationNamespace,
      selectedOrgID
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

  const orgPermissions = usePermissionsForOrganizations(provider, '');

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
  const hasPermissionsForClustersSummary =
    CPNodesPermissions.canList &&
    nodePoolsPermissions.canGet &&
    nodePoolsPermissions.canList;

  const clustersSummaryKey = hasPermissionsForClustersSummary
    ? () => fetchClustersSummaryKey(clusterList?.items)
    : null;

  const {
    data: clustersSummary,
    isValidating: clustersSummaryIsValidating,
    error: clustersSummaryError,
  } = useSWR<ui.IOrganizationDetailClustersSummary, GenericResponseError>(
    clustersSummaryKey,
    () => fetchClustersSummary(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (clustersSummaryError) {
      ErrorReporter.getInstance().notify(clustersSummaryError);
    }
  }, [clustersSummaryError]);

  const releasesPermissions = usePermissionsForReleases(
    provider,
    organizationNamespace
  );

  const releasesSummaryKey = releasesPermissions.canGet
    ? () => fetchReleasesSummaryKey(clusterList?.items)
    : null;

  const {
    data: releasesSummary,
    isValidating: releasesSummaryIsValidating,
    error: releasesSummaryError,
  } = useSWR<ui.IOrganizationDetailReleasesSummary, GenericResponseError>(
    releasesSummaryKey,
    () => fetchReleasesSummary(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (releasesSummaryError) {
      ErrorReporter.getInstance().notify(releasesSummaryError);
    }
  }, [releasesSummaryError]);

  const {
    data: appsSummary,
    isValidating: appsSummaryIsValidating,
    error: appsSummaryError,
  } = useSWR<ui.IOrganizationDetailAppsSummary, GenericResponseError>(
    () => fetchAppsSummaryKey(clusterList?.items),
    () => fetchAppsSummary(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (appsSummaryError) {
      ErrorReporter.getInstance().notify(appsSummaryError);
    }
  }, [appsSummaryError]);

  return (
    <>
      <OrganizationDetailPage
        organizationName={organizationName}
        organizationNamespace={organizationNamespace}
        onDelete={handleDelete}
        clusterCount={clusterList?.items.length}
        clusterCountLoading={
          typeof clusterList === 'undefined' &&
          typeof clusterListError === 'undefined' &&
          clusterListIsValidating
        }
        clustersSummary={clustersSummary}
        clustersSummaryLoading={
          typeof clustersSummary === 'undefined' && clustersSummaryIsValidating
        }
        releasesSummary={releasesSummary}
        releasesSummaryLoading={
          typeof releasesSummary === 'undefined' && releasesSummaryIsValidating
        }
        appsSummary={appsSummary}
        appsSummaryLoading={
          typeof appsSummary === 'undefined' && appsSummaryIsValidating
        }
      />
      <Box margin={{ top: 'large' }} direction='column' gap='small'>
        <GetOrganizationDetailsGuide organizationName={organizationName} />
        <DeleteOrganizationGuide organizationName={organizationName} />
      </Box>
    </>
  );
};

export default OrganizationDetailGeneral;
