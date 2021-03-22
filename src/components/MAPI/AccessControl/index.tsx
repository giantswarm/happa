import { Box } from 'grommet';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { GenericResponse } from 'model/clients/GenericResponse';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getLoggedInUser } from 'stores/main/selectors';
import useSWR from 'swr';
import AccessControlRoleDescription from 'UI/Display/MAPI/AccessControl/AccessControlDescription';
import AccessControlRoleDetail from 'UI/Display/MAPI/AccessControl/AccessControlRoleDetail';
import AccessControlRoleList from 'UI/Display/MAPI/AccessControl/AccessControlRoleList';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

import { getRoleItems, getRoleItemsKey } from './utils';

interface IAccessControlProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const AccessControl: React.FC<IAccessControlProps> = (props) => {
  const client = useHttpClient();
  const user = useSelector(getLoggedInUser);
  // TODO(axbarsan): Handle error.
  const { data } = useSWR<ui.IAccessControlRoleItem[], GenericResponse>(
    getRoleItemsKey(user),
    getRoleItems(client, user!)
  );

  const [activeRoleName, setActiveRoleName] = useState('');
  const activeRole = data?.find((role) => role.name === activeRoleName);

  useEffect(() => {
    if (!activeRole && data && data.length > 0) {
      setActiveRoleName(data[0].name);
    }
  }, [activeRole, data]);

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
        />
      </Box>
    </Box>
  );
};

AccessControl.propTypes = {};

export default AccessControl;
