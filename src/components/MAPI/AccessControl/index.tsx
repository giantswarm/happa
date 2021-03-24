import { Box } from 'grommet';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as metav1 from 'model/services/mapi/metav1';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { getLoggedInUser } from 'stores/main/selectors';
import useSWR from 'swr';
import AccessControlRoleDescription from 'UI/Display/MAPI/AccessControl/AccessControlDescription';
import AccessControlRoleDetail from 'UI/Display/MAPI/AccessControl/AccessControlRoleDetail';
import AccessControlRoleList from 'UI/Display/MAPI/AccessControl/AccessControlRoleList';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

import {
  createRoleBindingWithSubjects,
  deleteSubjectFromRole,
  getOrgNamespaceFromOrgName,
  getRoleItems,
  getRoleItemsKey,
} from './utils';

interface IAccessControlProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const AccessControl: React.FC<IAccessControlProps> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const orgNamespace = getOrgNamespaceFromOrgName(orgId);

  const client = useHttpClient();
  const user = useSelector(getLoggedInUser);
  // TODO(axbarsan): Handle error.
  const { data, mutate } = useSWR<ui.IAccessControlRoleItem[], GenericResponse>(
    getRoleItemsKey(user, orgNamespace),
    getRoleItems(client, user!, orgNamespace)
  );

  const [activeRoleName, setActiveRoleName] = useState('');
  const activeRole = data?.find((role) => role.name === activeRoleName);

  useEffect(() => {
    if (!activeRole && data && data.length > 0) {
      setActiveRoleName(data[0].name);
    }
  }, [activeRole, data]);

  const handleAdd = async (
    type: ui.AccessControlSubjectTypes,
    names: string[]
  ) => {
    try {
      if (!activeRole) return Promise.resolve();

      await createRoleBindingWithSubjects(
        client,
        user!,
        type,
        names,
        activeRole
      );
      mutate();

      return Promise.resolve();
    } catch (err: unknown) {
      const defaultMessage = 'Something went wrong.';

      if (metav1.isStatus((err as GenericResponse).data)) {
        return Promise.reject(
          new Error(
            (err as GenericResponse<metav1.IK8sStatus>).data.message ??
              defaultMessage
          )
        );
      } else if (err instanceof Error) {
        return Promise.reject(err);
      }

      return Promise.reject(new Error(defaultMessage));
    }
  };

  const handleDelete = async (
    type: ui.AccessControlSubjectTypes,
    name: string
  ) => {
    try {
      if (!activeRole) return Promise.resolve();

      await deleteSubjectFromRole(client, user!, name, type, activeRole);
      mutate();

      return Promise.resolve();
    } catch (err: unknown) {
      const defaultMessage = 'Something went wrong.';

      if (metav1.isStatus((err as GenericResponse).data)) {
        return Promise.reject(
          new Error(
            (err as GenericResponse<metav1.IK8sStatus>).data.message ??
              defaultMessage
          )
        );
      } else if (err instanceof Error) {
        return Promise.reject(err);
      }

      return Promise.reject(new Error(defaultMessage));
    }
  };

  return (
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
  );
};

AccessControl.propTypes = {};

export default AccessControl;
