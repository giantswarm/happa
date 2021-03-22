import { Box, Heading, Text } from 'grommet';
import AccessControlRoleSubjects from 'MAPI/AccessControl/AccessControlRoleSubjects';
import PropTypes from 'prop-types';
import * as React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'shared/Tabs';

import AccessControlRolePermissions from './AccessControlRolePermissions';
import AccessControlRoleType from './AccessControlRoleType';
import { AccessControlSubjectTypes, IAccessControlRoleItem } from './types';

export function formatManagedBy(managedBy?: string): string {
  if (!managedBy) return 'you';

  return `Giant Swarm (${managedBy})`;
}

interface IAccessControlRoleDetailProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  activeRole?: IAccessControlRoleItem;
}

const AccessControlRoleDetail: React.FC<IAccessControlRoleDetailProps> = ({
  activeRole,
  ...props
}) => {
  if (!activeRole) return null;

  const handleAdd = (type: AccessControlSubjectTypes, names: string[]) => {
    console.log(type, names);

    return new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });
  };

  const handleDelete = (type: AccessControlSubjectTypes, name: string) => {
    console.log(type, name);

    return new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });
  };

  return (
    <Box {...props}>
      <Box>
        <Heading level={4}>{activeRole.name}</Heading>
      </Box>
      <Box direction='row' wrap={true} gap='xsmall'>
        <AccessControlRoleType inCluster={activeRole.inCluster} />
        <Text>&bull;</Text>
        <Text>Managed by {formatManagedBy(activeRole.managedBy)}</Text>
      </Box>
      <Box margin={{ top: 'medium' }}>
        <Tabs defaultActiveKey='1'>
          <Tab eventKey='1' title='Subjects'>
            <AccessControlRoleSubjects
              roleName={activeRole.name}
              onAdd={handleAdd}
              onDelete={handleDelete}
              groups={activeRole.groups}
              users={activeRole.users}
              serviceAccounts={activeRole.serviceAccounts}
            />
          </Tab>
          <Tab eventKey='2' title='Permissions'>
            <AccessControlRolePermissions
              permissions={activeRole.permissions}
            />
          </Tab>
        </Tabs>
      </Box>
    </Box>
  );
};

AccessControlRoleDetail.propTypes = {
  // @ts-expect-error
  activeRole: PropTypes.object,
};

export default AccessControlRoleDetail;
