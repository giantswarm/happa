import { push } from 'connected-react-router';
import { Box } from 'grommet';
import RoutePath from 'lib/routePath';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { selectClusters } from 'stores/cluster/selectors';
import { clustersGroupedByOwner } from 'stores/cluster/utils';
import { selectOrganizations } from 'stores/organization/selectors';
import { IState } from 'stores/state';
import Button from 'UI/Controls/Button';
import OrganizationListPage from 'UI/Display/Organizations/OrganizationListPage';

import OrganizationListCreateOrg from './OrganizationListCreateOrg';

const OrganizationIndex: React.FC = () => {
  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();
  const organizations = useSelector(selectOrganizations());

  const clusters = useSelector(selectClusters());
  const clustersPerOwner = clustersGroupedByOwner(Object.values(clusters));

  const organizationList = useMemo(() => {
    return Object.keys(organizations).map((orgName) => ({
      name: orgName,
      clusterCount: clustersPerOwner[orgName]?.length ?? 0,
    }));
  }, [organizations, clustersPerOwner]);

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
