import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import produce from 'immer';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import DocumentTitle from 'shared/DocumentTitle';
import useSWR from 'swr';
import AccessControlRoleDescription from 'UI/Display/MAPI/AccessControl/AccessControlDescription';
import AccessControlRoleDetail from 'UI/Display/MAPI/AccessControl/AccessControlRoleDetail';
import AccessControlRoleList from 'UI/Display/MAPI/AccessControl/AccessControlRoleList';
import * as ui from 'UI/Display/MAPI/AccessControl/types';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { usePermissionsForAccessControl } from '../permissions/usePermissionsForAccessControl';
import BindRolesToSubjectsGuide from './guides/BindRolesToSubjectsGuide';
import InspectRoleGuide from './guides/InspectRoleGuide';
import ListRolesGuide from './guides/ListRolesGuide';
import {
  appendSubjectsToRoleItem,
  canBindRolesToSubjects,
  createRoleBindingWithSubjects,
  deleteSubjectFromRole,
  ensureServiceAccount,
  getRoleItems,
  getRoleItemsKey,
} from './utils';

interface IAccessControlProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  organizationName: string;
  organizationNamespace: string;
}

const AccessControl: React.FC<IAccessControlProps> = ({
  organizationName,
  organizationNamespace,
  ...props
}) => {
  const provider = window.config.info.general.provider;
  const permissions = usePermissionsForAccessControl(
    provider,
    organizationNamespace
  );

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();
  const { data, mutate, error, isValidating } = useSWR<
    ui.IAccessControlRoleItem[],
    GenericResponseError
  >(getRoleItemsKey(permissions, organizationNamespace), () =>
    getRoleItems(clientFactory, auth, permissions, organizationNamespace)
  );

  useEffect(() => {
    if (error) {
      ErrorReporter.getInstance().notify(error as Error);
    }
  }, [error]);

  const [activeRoleName, setActiveRoleName] = useState('');
  const activeRole = useMemo(
    () => data?.find((role) => role.name === activeRoleName),
    [data, activeRoleName]
  );

  const rolesIsLoading =
    typeof data === 'undefined' && typeof error === 'undefined' && isValidating;

  const activeRoleIsLoading =
    rolesIsLoading && typeof activeRole === 'undefined';

  useLayoutEffect(() => {
    if (!activeRole && data && data.length > 0) {
      setActiveRoleName(data[0].name);
    }
  }, [activeRole, data]);

  const handleAdd = async (
    type: ui.AccessControlSubjectTypes,
    names: string[]
  ) => {
    try {
      if (!activeRole || !data) return Promise.resolve([]);

      let subjectStatuses: ui.IAccessControlRoleSubjectStatus[] = [];
      if (type === ui.AccessControlSubjectTypes.ServiceAccount) {
        const creationRequests = names.map((name) =>
          ensureServiceAccount(
            clientFactory(),
            auth,
            name,
            organizationNamespace
          )
        );
        subjectStatuses = await Promise.all(creationRequests);
      } else {
        subjectStatuses = names.map((n) => ({
          name: n,
          status: ui.AccessControlRoleSubjectStatus.Bound,
        }));
      }

      const newRoleBinding = await createRoleBindingWithSubjects(
        clientFactory,
        auth,
        type,
        names,
        organizationNamespace,
        activeRole
      );

      const newData = produce((draft: typeof data) => {
        for (const item of draft) {
          if (item.name === activeRoleName) {
            appendSubjectsToRoleItem(newRoleBinding, item);
            break;
          }
        }
      }, data);
      mutate(newData, false);

      return Promise.resolve(subjectStatuses);
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);

      const errorMessage = extractErrorMessage(err);

      return Promise.reject(new Error(errorMessage));
    }
  };

  const handleDelete = async (
    type: ui.AccessControlSubjectTypes,
    name: string
  ) => {
    try {
      if (!activeRole || !data) return Promise.resolve();

      await deleteSubjectFromRole(
        clientFactory,
        auth,
        name,
        type,
        organizationNamespace,
        activeRole
      );

      const newData = produce((draft: typeof data) => {
        for (const item of draft) {
          if (item.name === activeRoleName) {
            switch (type) {
              case ui.AccessControlSubjectTypes.Group:
                delete item.groups[name];
                break;
              case ui.AccessControlSubjectTypes.User:
                delete item.users[name];
                break;
              case ui.AccessControlSubjectTypes.ServiceAccount:
                delete item.serviceAccounts[name];
                break;
            }
            break;
          }
        }
      }, data);
      mutate(newData, false);

      return Promise.resolve();
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);

      const errorMessage = extractErrorMessage(err);

      return Promise.reject(new Error(errorMessage));
    }
  };

  return (
    <DocumentTitle title={`Access control | ${organizationName}`}>
      <Box {...props}>
        <AccessControlRoleDescription margin={{ bottom: 'medium' }} />
        <Box direction='row' fill='horizontal'>
          <AccessControlRoleList
            pad={{ left: 'none', right: 'medium' }}
            border={{ side: 'right' }}
            height={{ min: '400px' }}
            flex={{
              grow: 0,
              shrink: 1,
            }}
            basis='1/4'
            roles={data ?? []}
            isLoading={rolesIsLoading}
            activeRoleName={activeRoleName}
            setActiveRoleName={setActiveRoleName}
            errorMessage={extractErrorMessage(error)}
          />
          <AccessControlRoleDetail
            basis='3/4'
            flex={{
              grow: 1,
              shrink: 1,
            }}
            pad={{ left: 'medium', right: 'none' }}
            activeRole={activeRole}
            isLoading={activeRoleIsLoading}
            onAdd={handleAdd}
            onDelete={handleDelete}
            namespace={organizationNamespace}
            permissions={permissions}
          />
        </Box>
        <Box margin={{ top: 'large' }} direction='column' gap='small'>
          <ListRolesGuide namespace={organizationNamespace} />
          <InspectRoleGuide namespace={organizationNamespace} />
          <BindRolesToSubjectsGuide
            namespace={organizationNamespace}
            canBindRoles={canBindRolesToSubjects(permissions)}
          />
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default AccessControl;
