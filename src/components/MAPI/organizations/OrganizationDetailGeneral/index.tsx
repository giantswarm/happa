import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { StatusCodes } from 'shared/constants';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { organizationsLoadMAPI } from 'stores/organization/actions';
import { IState } from 'stores/state';
import useSWR from 'swr';
import OrganizationDetailPage from 'UI/Display/Organizations/OrganizationDetailPage';
import * as ui from 'UI/Display/Organizations/types';

import DeleteOrganizationGuide from '../guides/DeleteOrganizationGuide';
import GetOrganizationDetailsGuide from '../guides/GetOrganizationDetailsGuide';
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
  const auth = useAuthProvider();
  const clientFactory = useHttpClientFactory();

  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  const clusterListClient = useRef(clientFactory());
  const getOptions: capiv1alpha3.IGetClusterListOptions = useMemo(() => {
    return {
      labelSelector: {
        matchingLabels: { [capiv1alpha3.labelOrganization]: organizationName },
      },
    };
  }, [organizationName]);
  const {
    data: clusterList,
    error: clusterListError,
    isValidating: clusterListIsValidating,
  } = useSWR<capiv1alpha3.IClusterList, GenericResponse>(
    () => capiv1alpha3.getClusterListKey(getOptions),
    () =>
      capiv1alpha3.getClusterList(clusterListClient.current, auth, getOptions)
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

  const handleDelete = async () => {
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
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);

      return Promise.reject(new Error(errorMessage));
    }
  };

  const {
    data: clustersSummary,
    isValidating: clustersSummaryIsValidating,
    error: clustersSummaryError,
  } = useSWR<ui.IOrganizationDetailClustersSummary, GenericResponse>(
    () => fetchClustersSummaryKey(clusterList?.items),
    () => fetchClustersSummary(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (clustersSummaryError) {
      ErrorReporter.getInstance().notify(clustersSummaryError);
    }
  }, [clustersSummaryError]);

  const {
    data: releasesSummary,
    isValidating: releasesSummaryIsValidating,
    error: releasesSummaryError,
  } = useSWR<ui.IOrganizationDetailReleasesSummary, GenericResponse>(
    () => fetchReleasesSummaryKey(clusterList?.items),
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
  } = useSWR<ui.IOrganizationDetailAppsSummary, GenericResponse>(
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

OrganizationDetailGeneral.propTypes = {
  organizationName: PropTypes.string.isRequired,
  organizationNamespace: PropTypes.string.isRequired,
};

export default OrganizationDetailGeneral;
