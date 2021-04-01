import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import produce from 'immer';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { GenericResponse } from 'model/clients/GenericResponse';
import PropTypes from 'prop-types';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import DocumentTitle from 'shared/DocumentTitle';
import useSWR from 'swr';
import AccessControlRoleDescription from 'UI/Display/MAPI/AccessControl/AccessControlDescription';
import AccessControlRoleDetail from 'UI/Display/MAPI/AccessControl/AccessControlRoleDetail';
import AccessControlRoleList from 'UI/Display/MAPI/AccessControl/AccessControlRoleList';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

import {
  appendSubjectsToRoleItem,
  createRoleBindingWithSubjects,
  deleteSubjectFromRole,
  extractErrorMessage,
  getOrgNamespaceFromOrgName,
  getRoleItems,
  getRoleItemsKey,
} from './utils';

interface IAccessControlProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  organizationName: string;
}

const AccessControl: React.FC<IAccessControlProps> = ({
  organizationName,
  ...props
}) => {
  const orgNamespace = getOrgNamespaceFromOrgName(organizationName);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();
  const { data, mutate, error } = useSWR<
    ui.IAccessControlRoleItem[],
    GenericResponse
  >(getRoleItemsKey(orgNamespace), () =>
    getRoleItems(clientFactory, auth, orgNamespace)
  );

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
      if (!activeRole || !data) return Promise.resolve();

      const newRoleBinding = await createRoleBindingWithSubjects(
        clientFactory(),
        auth,
        type,
        names,
        orgNamespace,
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

      return Promise.resolve();
    } catch (err: unknown) {
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
        clientFactory(),
        auth,
        name,
        type,
        orgNamespace,
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
            basis='1/3'
            width={{ min: '450px' }}
            roles={data}
            activeRoleName={activeRoleName}
            setActiveRoleName={setActiveRoleName}
            errorMessage={extractErrorMessage(error)}
          />
          <AccessControlRoleDetail
            basis='2/3'
            flex={{
              grow: 1,
              shrink: 1,
            }}
            pad={{ left: 'medium', right: 'none' }}
            activeRole={activeRole}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />
        </Box>
      </Box>
    </DocumentTitle>
  );
};

AccessControl.propTypes = {
  organizationName: PropTypes.string.isRequired,
};

export default AccessControl;
