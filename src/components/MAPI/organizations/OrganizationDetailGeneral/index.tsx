import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
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
      const errorMessage = extractErrorMessage(err);

      return Promise.reject(new Error(errorMessage));
    }
  };

  const {
    data: clustersSummary,
    isValidating: clustersSummaryIsValidating,
  } = useSWR<ui.IOrganizationDetailClustersSummary, GenericResponse>(
    () => fetchClustersSummaryKey(clusterList?.items),
    () => fetchClustersSummary(clientFactory, auth, clusterList!.items)
  );

  const {
    data: releasesSummary,
    isValidating: releasesSummaryIsValidating,
  } = useSWR<ui.IOrganizationDetailReleasesSummary, GenericResponse>(
    () => fetchReleasesSummaryKey(clusterList?.items),
    () => fetchReleasesSummary(clientFactory, auth, clusterList!.items)
  );

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
    />
  );
};

OrganizationDetailGeneral.propTypes = {
  organizationName: PropTypes.string.isRequired,
};

export default OrganizationDetailGeneral;
