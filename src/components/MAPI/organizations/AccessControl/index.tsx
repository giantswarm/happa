import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import produce from 'immer';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import PropTypes from 'prop-types';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentTitle from 'shared/DocumentTitle';
import useSWR from 'swr';
import AccessControlRoleDescription from 'UI/Display/MAPI/AccessControl/AccessControlDescription';
import AccessControlRoleDetail from 'UI/Display/MAPI/AccessControl/AccessControlRoleDetail';
import AccessControlRoleList from 'UI/Display/MAPI/AccessControl/AccessControlRoleList';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

import BindRolesToSubjectsGuide from './guides/BindRolesToSubjectsGuide';
import InspectRoleGuide from './guides/InspectRoleGuide';
import ListRolesGuide from './guides/ListRolesGuide';
import {
  appendSubjectsToRoleItem,
  computePermissions,
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
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();
  const { data, mutate, error } = useSWR<
    ui.IAccessControlRoleItem[],
    GenericResponseError
  >(getRoleItemsKey(organizationNamespace), () =>
    getRoleItems(clientFactory, auth, organizationNamespace)
  );

  useEffect(() => {
    if (error) {
      ErrorReporter.getInstance().notify(error);
    }
  }, [error]);

  const [activeRoleName, setActiveRoleName] = useState('');
  const activeRole = useMemo(
    () => data?.find((role) => role.name === activeRoleName),
    [data, activeRoleName]
  );

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

      const creationRequests = names.map((name) =>
        ensureServiceAccount(clientFactory(), auth, name, organizationNamespace)
      );
      const serviceAccountStatuses = await Promise.all(creationRequests);

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

      return Promise.resolve(serviceAccountStatuses);
    } catch (err: unknown) {
      ErrorReporter.getInstance().notify(err as never);

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
    } catch (err: unknown) {
      ErrorReporter.getInstance().notify(err as never);

      const errorMessage = extractErrorMessage(err);

      return Promise.reject(new Error(errorMessage));
    }
  };

  const permissions = useSelector(computePermissions);

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
            roles={data}
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
            onAdd={handleAdd}
            onDelete={handleDelete}
            namespace={organizationNamespace}
            permissions={permissions}
          />
        </Box>
        <Box margin={{ top: 'large' }} direction='column' gap='small'>
          <ListRolesGuide namespace={organizationNamespace} />
          <InspectRoleGuide namespace={organizationNamespace} />
          <BindRolesToSubjectsGuide namespace={organizationNamespace} />
        </Box>
      </Box>
    </DocumentTitle>
  );
};

AccessControl.propTypes = {
  organizationName: PropTypes.string.isRequired,
  organizationNamespace: PropTypes.string.isRequired,
};

export default AccessControl;
