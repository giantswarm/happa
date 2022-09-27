import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading } from 'grommet';
import AccessControlPage from 'MAPI/organizations/AccessControl';
import { extractErrorMessage, isGitOpsManaged } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as metav1 from 'model/services/mapi/metav1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import { IState } from 'model/stores/state';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
import useSWR from 'swr';
import GitOpsManagedNote from 'UI/Display/MAPI/GitOpsManaged/GitOpsManagedNote';
import OrganizationDetailLoadingPlaceholder from 'UI/Display/Organizations/OrganizationDetailLoadingPlaceholder';
import { Tab, Tabs } from 'UI/Display/Tabs';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';

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

const OrganizationDetail: React.FC<
  React.PropsWithChildren<IOrganizationDetailProps>
> = () => {
  const { orgId } = useParams<{ orgId: string }>();

  const paths = useMemo(() => computePaths(orgId), [orgId]);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const orgClient = useRef(clientFactory());
  const { data, error } = useSWR<
    securityv1alpha1.IOrganization,
    GenericResponseError
  >(securityv1alpha1.getOrganizationKey(orgId), () =>
    securityv1alpha1.getOrganization(orgClient.current, auth, orgId)
  );

  const orgNamespace = data?.status?.namespace;

  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  useEffect(() => {
    if (error) {
      ErrorReporter.getInstance().notify(error as Error);
    }

    if (
      metav1.isStatusError(error?.data, metav1.K8sStatusErrorReasons.NotFound)
    ) {
      new FlashMessage(
        (
          <>
            Organization <code>{orgId}</code> not found
          </>
        ),
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the Organization ID is correct and that you have access to it.'
      );

      dispatch(push(OrganizationsRoutes.Home));
    } else if (error) {
      const errorMessage = extractErrorMessage(error);

      new FlashMessage(
        (
          <>
            There was a problem loading organization <code>{orgId}</code>
          </>
        ),
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      if (!data) {
        dispatch(push(OrganizationsRoutes.Home));
      }
    }
  }, [error, orgId, dispatch, data]);

  const isManagedByGitOps = data ? isGitOpsManaged(data) : false;

  return (
    <DocumentTitle title={`Organization Details | ${orgId}`}>
      <Box>
        {!data || !orgNamespace ? (
          <OrganizationDetailLoadingPlaceholder />
        ) : (
          <>
            <Heading level={1} margin={{ bottom: 'medium' }}>
              Organization: {data.metadata.name}
            </Heading>

            {isManagedByGitOps && (
              <GitOpsManagedNote margin={{ bottom: 'medium' }} />
            )}

            <Tabs useRoutes={true} margin={{ top: 'medium' }}>
              <Tab path={paths.Detail} title='General'>
                <OrganizationDetailGeneral
                  organizationName={data.metadata.name}
                  organizationNamespace={orgNamespace}
                  isManagedByGitOps={isManagedByGitOps}
                />
              </Tab>
              <Tab path={paths.AccessControl} title='Access control'>
                <AccessControlPage
                  organizationName={data.metadata.name}
                  organizationNamespace={orgNamespace}
                />
              </Tab>
            </Tabs>
          </>
        )}
      </Box>
    </DocumentTitle>
  );
};

export default OrganizationDetail;
