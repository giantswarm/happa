import { push } from 'connected-react-router';
import produce from 'immer';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import RoutePath from 'lib/routePath';
import { GenericResponse } from 'model/clients/GenericResponse';
import { createOrganization } from 'model/services/mapi/securityv1alpha1/createOrganization';
import {
  getOrganizationList,
  getOrganizationListKey,
} from 'model/services/mapi/securityv1alpha1/getOrganizationList';
import { getOrganizationName } from 'model/services/mapi/securityv1alpha1/key';
import { IOrganizationList } from 'model/services/mapi/securityv1alpha1/types';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { getLoggedInUser } from 'stores/main/selectors';
import useSWR from 'swr';
import OrganizationListPage from 'UI/Display/Organizations/OrganizationListPage';

const OrganizationIndex: React.FC = () => {
  const dispatch = useDispatch();

  const client = useHttpClient();
  const user = useSelector(getLoggedInUser);
  const { data, mutate } = useSWR<IOrganizationList, GenericResponse>(
    getOrganizationListKey(user),
    getOrganizationList(client, user!)
  );

  return (
    <OrganizationListPage
      onClickRow={(name) => {
        const orgPath = RoutePath.createUsablePath(OrganizationsRoutes.Detail, {
          orgId: name,
        });

        dispatch(push(orgPath));
      }}
      data={data?.items.map((d) => ({
        name: getOrganizationName(d),
      }))}
      // TODO: @oponder: Do we like this? Handling errors and doing requests and mutation in the component?
      //                 I was generally always ok with it.. but it feels like I am breaking some rules.
      createOrg={async (orgName) => {
        if (user && data) {
          try {
            const response = await createOrganization(client, user, orgName)();

            mutate(
              produce((newData) => {
                newData.items.push(response);
              }),
              false
            );
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
  );
};

export default OrganizationIndex;
