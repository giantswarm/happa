import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import RoutePath from 'lib/routePath';
import { ClusterList } from 'MAPI/types';
import { fetchClusterList, fetchClusterListKey } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { getProvider } from 'stores/main/selectors';
import { selectOrganizations } from 'stores/organization/selectors';
import { IState } from 'stores/state';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import OrganizationListPage from 'UI/Display/Organizations/OrganizationListPage';

import OrganizationListCreateOrg from './OrganizationListCreateOrg';
import {
  computeClusterCountersForOrganizations,
  extractErrorMessage,
} from './utils';

const OrganizationIndex: React.FC = () => {
  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();
  const organizations = useSelector(selectOrganizations());

  const provider = useSelector(getProvider);

  const client = useHttpClient();
  const auth = useAuthProvider();

  const { data: clusterList, error: clusterListError } = useSWR<
    ClusterList,
    GenericResponseError
  >(fetchClusterListKey(provider), () =>
    fetchClusterList(client, auth, provider)
  );

  useEffect(() => {
    if (clusterListError) {
      new FlashMessage(
        'There was a problem loading clusters.',
        messageType.ERROR,
        messageTTL.FOREVER,
        extractErrorMessage(clusterListError)
      );

      ErrorReporter.getInstance().notify(clusterListError);
    }
  }, [clusterListError]);

  const organizationList = useMemo(() => {
    const clusterCounters = computeClusterCountersForOrganizations(
      clusterList?.items
    );

    const orgs = Object.keys(organizations).map((orgName) => {
      // eslint-disable-next-line @typescript-eslint/init-declarations
      let clusterCount: number | undefined;
      if (clusterListError) {
        clusterCount = -1;
      } else if (clusterCounters) {
        clusterCount = clusterCounters[orgName] ?? 0;
      }

      return {
        name: orgName,
        clusterCount,
      };
    });

    return Object.values(orgs);
  }, [organizations, clusterList, clusterListError]);

  const handleOrgClick = (name: string) => {
    const orgPath = RoutePath.createUsablePath(OrganizationsRoutes.Detail, {
      orgId: name,
    });

    dispatch(push(orgPath));
  };

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const handleOpenCreateForm = () => {
    setIsCreateFormOpen(true);
  };

  const handleCloseCreateForm = () => {
    setIsCreateFormOpen(false);
  };

  return (
    <DocumentTitle title='Organizations'>
      <OrganizationListPage
        organizations={organizationList}
        onClickRow={handleOrgClick}
      />

      <Box margin={{ top: 'large' }}>
        <OrganizationListCreateOrg
          open={isCreateFormOpen}
          onSubmit={handleCloseCreateForm}
          onCancel={handleCloseCreateForm}
        />

        {!isCreateFormOpen && (
          <Box animation={{ type: 'fadeIn', duration: 300 }}>
            <Button bsStyle='default' onClick={handleOpenCreateForm}>
              <i
                className='fa fa-add-circle'
                role='presentation'
                aria-hidden={true}
              />{' '}
              Add organization
            </Button>
          </Box>
        )}
      </Box>
    </DocumentTitle>
  );
};

export default OrganizationIndex;
