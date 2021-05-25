import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import AccessControlPage from 'MAPI/organizations/AccessControl';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as metav1 from 'model/services/mapi/metav1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { Tab } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import Tabs from 'shared/Tabs';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { IState } from 'stores/state';
import useSWR from 'swr';
import OrganizationDetailLoadingPlaceholder from 'UI/Display/Organizations/OrganizationDetailLoadingPlaceholder';

import OrganizationDetailGeneral from './OrganizationDetailGeneral';

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

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const orgClient = useRef(clientFactory());
  const { data, error } = useSWR<
    securityv1alpha1.IOrganization,
    GenericResponse
  >(securityv1alpha1.getOrganizationKey(orgId), () =>
    securityv1alpha1.getOrganization(orgClient.current, auth, orgId)
  );

  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  useEffect(() => {
    if (error) {
      ErrorReporter.getInstance().notify(error);
    }

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
                <OrganizationDetailGeneral
                  organizationName={data.metadata.name}
                />
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
