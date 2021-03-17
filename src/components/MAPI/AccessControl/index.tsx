import { Box } from 'grommet';
import React, { useState } from 'react';
import AccessControlRoleDescription from 'UI/Display/MAPI/AccessControl/AccessControlDescription';
import AccessControlRoleList from 'UI/Display/MAPI/AccessControl/AccessControlRoleList';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

const sampleData: ui.IAccessControlRoleItem[] = [
  {
    name: 'read-all',
    inCluster: true,
    groups: [
      {
        name: 'admins',
        editable: false,
      },
      {
        name: 'infrastructure-billing',
        editable: true,
      },
    ],
    users: [
      {
        name: 'dan@acme-corp.com',
        editable: true,
      },
      {
        name: 'jen@acme-corp.com',
        editable: true,
      },
      {
        name: 'monitoring@acme-corp.com',
        editable: true,
      },
    ],
    serviceAccounts: [],
    permissions: [
      {
        apiGroup: 'application.giantswarm.io',
        resources: ['appcatalogs'],
        resourceNames: [],
        verbs: ['get', 'watch', 'list'],
      },
      {
        apiGroup: 'application.giantswarm.io',
        resources: ['apps'],
        resourceNames: [],
        verbs: ['get', 'watch', 'list'],
      },
      {
        apiGroup: 'application.giantswarm.io',
        resources: ['charts'],
        resourceNames: [],
        verbs: ['get', 'watch', 'list'],
      },
    ],
  },
  {
    name: 'read-apps',
    inCluster: false,
    groups: [
      {
        name: 'infrastructure-billing',
        editable: true,
      },
    ],
    users: [],
    serviceAccounts: [],
    permissions: [
      {
        apiGroup: 'application.giantswarm.io',
        resources: ['appcatalogs'],
        resourceNames: [],
        verbs: ['get', 'watch', 'list'],
      },
      {
        apiGroup: 'application.giantswarm.io',
        resources: ['apps'],
        resourceNames: [],
        verbs: ['get', 'watch', 'list'],
      },
      {
        apiGroup: 'application.giantswarm.io',
        resources: ['charts'],
        resourceNames: [],
        verbs: ['get', 'watch', 'list'],
      },
    ],
  },
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
