import { push } from 'connected-react-router';
import RoutePath from 'lib/routePath';
import * as React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import OrganizationListPage from 'UI/Display/Organizations/OrganizationListPage';

const OrganizationIndex: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <Breadcrumb
      data={{ title: 'ORGANIZATIONS', pathname: OrganizationsRoutes.Home }}
    >
      <OrganizationListPage
        onClickRow={(name) => {
          const orgPath = RoutePath.createUsablePath(
            OrganizationsRoutes.Detail,
            {
              orgId: name,
            }
          );

          dispatch(push(orgPath));
        }}
        // TODO: @oponder: This is sample data, hook it up to actual MAPI requests.
        data={[
          {
            name: 'acme',
            clusters: 6,
            oldest_release: 'v11.5.6',
            newest_release: 'v14.1.0',
            oldest_k8s_version: 'v1.15',
            newest_k8s_version: 'v1.19',
            apps: 3,
            app_deployments: 18,
          },
          { name: 'security', clusters: 0 },
          { name: 'giantswarm', clusters: 0 },
          { name: 'ghost', clusters: 0 },
        ]}
        // TODO: @oponder: This is does nothing, hook it up to actual MAPI request that creates an ORG CR.
        createOrg={(orgName) => console.log(`creating: ${orgName}`)}
      />
    </Breadcrumb>
  );
};

export default OrganizationIndex;
