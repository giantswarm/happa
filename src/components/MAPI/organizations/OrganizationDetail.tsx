import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading } from 'grommet';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import RoutePath from 'lib/routePath';
import AccessControlPage from 'MAPI/organizations/AccessControl';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as metav1 from 'model/services/mapi/metav1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect, useMemo } from 'react';
import { Tab } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import Tabs from 'shared/Tabs';
import { selectClusters } from 'stores/cluster/selectors';
import useSWR from 'swr';
import OrganizationDetailLoadingPlaceholder from 'UI/Display/Organizations/OrganizationDetailLoadingPlaceholder';
import OrganizationDetailPage from 'UI/Display/Organizations/OrganizationDetailPage';

function computePaths(orgName: string) {
  return {
    Detail: RoutePath.createUsablePath(OrganizationsRoutes.Detail, {
      orgId: orgName,
    }),
    AccessControl: RoutePath.createUsablePath(
      OrganizationsRoutes.AccessControl,
      {
        orgId: orgName,
      }
    ),
  };
}

interface IOrganizationDetailProps {}

const OrganizationDetail: React.FC<IOrganizationDetailProps> = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const paths = useMemo(() => computePaths(orgId), [orgId]);
  const clusters = useSelector(selectClusters());

  const client = useHttpClient();
  const auth = useAuthProvider();

  const { data, error } = useSWR<
    securityv1alpha1.IOrganization,
    GenericResponse
  >(securityv1alpha1.getOrganizationKey(orgId), () =>
    securityv1alpha1.getOrganization(client, auth, orgId)
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (
      metav1.isStatusError(error?.data, metav1.K8sStatusErrorReasons.NotFound)
    ) {
      new FlashMessage(
        `Organization <code>${orgId}</code> not found`,
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the Organization ID is correct and that you have access to it.'
      );

      dispatch(push(OrganizationsRoutes.Home));
    } else if (error) {
      new FlashMessage(
        `There was a problem loading organization <code>${orgId}</code>`,
        messageType.ERROR,
        messageTTL.FOREVER
      );

      if (!data) {
        dispatch(push(OrganizationsRoutes.Home));
      }
    }
  }, [error, orgId, dispatch, data]);

  const ownedClusters = Object.values(clusters).filter(
    (cluster) => cluster.owner === orgId
  );

  return (
    <DocumentTitle title={`Organization Details | ${orgId}`}>
      <Box>
        {!data ? (
          <OrganizationDetailLoadingPlaceholder />
        ) : (
          <>
            <Heading level={1} margin={{ bottom: 'large' }}>
              Organization: {data.metadata.name}
            </Heading>
            <Tabs defaultActiveKey={paths.Detail} useRoutes={true}>
              <Tab eventKey={paths.Detail} title='General'>
                <OrganizationDetailPage clusters={ownedClusters} />
              </Tab>
              <Tab eventKey={paths.AccessControl} title='Access control'>
                <AccessControlPage organizationName={data.metadata.name} />
              </Tab>
            </Tabs>
          </>
        )}
      </Box>
    </DocumentTitle>
  );
};

OrganizationDetail.propTypes = {};

export default OrganizationDetail;
