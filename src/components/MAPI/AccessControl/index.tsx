import { Box, Heading } from 'grommet';
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
      <Box direction='row' fill='horizontal'>
        <AccessControlRoleList
          pad={{ left: 'none', right: 'medium' }}
          border={{ side: 'right' }}
          height={{ min: '400px' }}
          flex={{
            grow: 1,
            shrink: 1,
          }}
          basis='1/3'
          width={{ min: '400px' }}
          roles={sampleData}
          activeRoleName={activeRoleName}
          setActiveRoleName={setActiveRoleName}
          isLoading={false}
        />
        <Box
          basis='2/3'
          flex={{
            grow: 1,
            shrink: 1,
          }}
          pad={{ left: 'medium', right: 'none' }}
        >
          <Heading level={3}>Hi</Heading>
        </Box>
      </Box>
    </Box>
  );
};

AccessControl.propTypes = {};

export default AccessControl;
