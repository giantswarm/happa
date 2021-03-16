import { Box } from 'grommet';
import React, { useState } from 'react';
import AccessControlRoleDescription from 'UI/Display/MAPI/AccessControl/AccessControlDescription';
import AccessControlRoleList from 'UI/Display/MAPI/AccessControl/AccessControlRoleList';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

const sampleData: ui.IAccessRoleItem[] = [
  {
    name: 'read-all',
    inCluster: true,
    resourceCount: 56,
    groupCount: 1,
    userCount: 3,
  },
  { name: 'read-apps', resourceCount: 4, groupCount: 1 },
  { name: 'write-all', inCluster: true, resourceCount: 56 },
  { name: 'cluster-admin', inCluster: true, resourceCount: -1, groupCount: 1 },
  { name: 'some-group', inCluster: false, resourceCount: 150, groupCount: 1 },
];

interface IAccessControlProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const AccessControl: React.FC<IAccessControlProps> = (props) => {
  const [activeRoleName, setActiveRoleName] = useState('');

  return (
    <Box {...props}>
      <AccessControlRoleDescription margin={{ bottom: 'medium' }} />
      <Box direction='row'>
        <AccessControlRoleList
          roles={sampleData}
          activeRoleName={activeRoleName}
          setActiveRoleName={setActiveRoleName}
        />
      </Box>
    </Box>
  );
};

AccessControl.propTypes = {};

export default AccessControl;
