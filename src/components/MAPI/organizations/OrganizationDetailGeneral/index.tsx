import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { organizationsLoadMAPI } from 'stores/organization/actions';
import { IState } from 'stores/state';
import useSWR from 'swr';
import OrganizationDetailPage from 'UI/Display/Organizations/OrganizationDetailPage';
import * as ui from 'UI/Display/Organizations/types';

import { extractErrorMessage } from '../utils';
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
}

const OrganizationDetailGeneral: React.FC<IOrganizationDetailGeneralProps> = ({
  organizationName,
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
    if (clusterListError) {
      new FlashMessage(
        'There was a problem loading clusters in this organization.',
        messageType.ERROR,
        messageTTL.FOREVER
      );

      ErrorReporter.getInstance().notify(clusterListError);
    }
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
      ErrorReporter.getInstance().notify(err as never);

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
    <OrganizationDetailPage
      organizationName={organizationName}
      onDelete={handleDelete}
      clusterCount={clusterList?.items.length}
      clusterCountLoading={
        typeof clusterList === 'undefined' && clusterListIsValidating
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
  );
};

OrganizationDetailGeneral.propTypes = {
  organizationName: PropTypes.string.isRequired,
};

export default OrganizationDetailGeneral;
