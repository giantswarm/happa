import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading } from 'grommet';
import { getNamespaceFromOrgName } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { MainRoutes, OrganizationsRoutes } from 'model/constants/routes';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect, useRef } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
import useSWR from 'swr';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';

import CreateClusterForm from './CreateClusterForm';

interface ICreateClusterProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const CreateCluster: React.FC<React.PropsWithChildren<ICreateClusterProps>> = (
  props
) => {
  const match = useRouteMatch<{ orgId: string }>();
  const { orgId } = match.params;
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const organizationID = selectedOrg?.name ?? selectedOrg?.id ?? orgId;

  const namespace = selectedOrg?.namespace ?? getNamespaceFromOrgName(orgId);

  // const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const releaseListClient = useRef(clientFactory());
  const { data: releaseList, error: releaseListError } = useSWR<
    releasev1alpha1.IReleaseList,
    GenericResponseError
  >(releasev1alpha1.getReleaseListKey(), () =>
    releasev1alpha1.getReleaseList(releaseListClient.current, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  const globalDispatch = useDispatch();

  const onCreationCancel = () => {
    globalDispatch(push(MainRoutes.Home));
  };

  const onCreationComplete = (clusterId: string) => {
    // Navigate to the cluster's detail page.
    const detailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId,
        clusterId,
      }
    );

    globalDispatch(push(detailPath));
  };

  return (
    <Breadcrumb data={{ title: 'CREATE CLUSTER', pathname: match.url }}>
      <DocumentTitle title={`Create Cluster | ${orgId}`}>
        <Box {...props}>
          <Box
            fill={true}
            border={{ side: 'bottom' }}
            margin={{ bottom: 'large' }}
          >
            <Heading level={1}>Create a cluster</Heading>
          </Box>
          <CreateClusterForm
            namespace={namespace}
            organizationID={organizationID}
            onCreationCancel={onCreationCancel}
            onCreationComplete={onCreationComplete}
            releaseList={releaseList?.items}
          />
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default CreateCluster;
