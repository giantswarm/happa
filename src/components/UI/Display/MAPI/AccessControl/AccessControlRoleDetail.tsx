import { Box, Heading, Text } from 'grommet';
import AccessControlRoleSubjects from 'MAPI/AccessControl/AccessControlRoleSubjects';
import PropTypes from 'prop-types';
import * as React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'shared/Tabs';

import AccessControlRoleDetailLoadingPlaceholder from './AccessControlRoleDetailLoadingPlaceholder';
import AccessControlRolePermissions from './AccessControlRolePermissions';
import AccessControlRoleType from './AccessControlRoleType';
import { AccessControlSubjectTypes, IAccessControlRoleItem } from './types';

export function formatManagedBy(managedBy?: string): string {
  if (!managedBy) return 'you';

  return `Giant Swarm (${managedBy})`;
}

interface IAccessControlRoleDetailProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  onAdd: (type: AccessControlSubjectTypes, names: string[]) => Promise<void>;
  onDelete: (type: AccessControlSubjectTypes, name: string) => Promise<void>;
  activeRole?: IAccessControlRoleItem;
}

const AccessControlRoleDetail: React.FC<IAccessControlRoleDetailProps> = ({
  activeRole,
  onAdd,
  onDelete,
  ...props
}) => {
  return (
    <Box {...props}>
      {!activeRole && <AccessControlRoleDetailLoadingPlaceholder />}

      {activeRole && (
        <>
          <Box>
            <Heading level={4}>{activeRole.name}</Heading>
          </Box>
          <Box direction='row' wrap={true} gap='xsmall'>
            <AccessControlRoleType namespace={activeRole.namespace} />
            <Text>&bull;</Text>
            <Text>Managed by {formatManagedBy(activeRole.managedBy)}</Text>
          </Box>
          <Box margin={{ top: 'medium' }}>
            <Tabs defaultActiveKey='1'>
              <Tab eventKey='1' title='Subjects'>
                <AccessControlRoleSubjects
                  roleName={activeRole.name}
                  onAdd={onAdd}
                  onDelete={onDelete}
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
        </>
      )}
    </Box>
  );
};

AccessControlRoleDetail.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  // @ts-expect-error
  activeRole: PropTypes.object,
};

export default AccessControlRoleDetail;
