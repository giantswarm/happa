import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import RoutePath from 'lib/routePath';
import { createOrganization } from 'model/services/mapi/securityv1alpha1/createOrganization';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { getLoggedInUser } from 'stores/main/selectors';
import { selectOrganizations } from 'stores/organization/selectors';
import OrganizationListPage from 'UI/Display/Organizations/OrganizationListPage';

const OrganizationIndex: React.FC = () => {
  const dispatch = useDispatch();
  const organizations = useSelector(selectOrganizations()) || {};

  const client = useHttpClient();
  const user = useSelector(getLoggedInUser);

  return (
    <DocumentTitle title='Organizations'>
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
        data={Object.keys(organizations).map((orgName) => ({
          name: orgName,
        }))}
        // TODO: @oponder: Do we like this? Handling errors and doing requests and mutation in the component?
        //                 I was generally always ok with it.. but it feels like I am breaking some rules.
        createOrg={async (orgName) => {
          if (user) {
            try {
              await createOrganization(client, user, orgName)();
            } catch (error) {
              if (error?.config?.data?.message) {
                new FlashMessage(
                  `Unable to create organization "${orgName}"`,
                  messageType.ERROR,
                  messageTTL.LONG,
                  error.config.data.message
                );
              } else {
                new FlashMessage(
                  `Unable to create organization "${orgName}"`,
                  messageType.ERROR,
                  messageTTL.LONG,
                  'Something unexpected went wrong while trying to create this organization'
                );
              }
            }
          }
        }}
      />
    </DocumentTitle>
  );
};

export default OrganizationIndex;
