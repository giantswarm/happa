import { Box, Heading, Text } from 'grommet';
import AccessControlRoleSubjects from 'MAPI/organizations/AccessControl/AccessControlRoleSubjects';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Tab, Tabs } from 'UI/Display/Tabs';

import AccessControlRoleDetailLoadingPlaceholder from './AccessControlRoleDetailLoadingPlaceholder';
import AccessControlRolePermissions from './AccessControlRolePermissions';
import AccessControlRoleType from './AccessControlRoleType';
import {
  AccessControlSubjectTypes,
  IAccessControlPermissions,
  IAccessControlRoleItem,
  IAccessControlServiceAccount,
} from './types';

export function formatManagedBy(managedBy?: string): string {
  if (!managedBy) return 'you';

  return `Giant Swarm (${managedBy})`;
}

interface IAccessControlRoleDetailProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  namespace: string;
  permissions: IAccessControlPermissions;
  onAdd: (
    type: AccessControlSubjectTypes,
    names: string[]
  ) => Promise<IAccessControlServiceAccount[]>;
  onDelete: (type: AccessControlSubjectTypes, name: string) => Promise<void>;
  activeRole?: IAccessControlRoleItem;
}

const AccessControlRoleDetail: React.FC<IAccessControlRoleDetailProps> = ({
  namespace,
  permissions,
  activeRole,
  onAdd,
  onDelete,
  ...props
}) => {
  return (
    <Box role='main' aria-label='Role details' {...props}>
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
            <Tabs>
              <Tab title='Subjects'>
                <AccessControlRoleSubjects
                  roleName={activeRole.name}
                  onAdd={onAdd}
                  onDelete={onDelete}
                  groups={activeRole.groups}
                  users={activeRole.users}
                  serviceAccounts={activeRole.serviceAccounts}
                  namespace={namespace}
                  permissions={permissions}
                />
              </Tab>
              <Tab title='Permissions'>
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
  namespace: PropTypes.string.isRequired,
  permissions: (PropTypes.object as PropTypes.Requireable<IAccessControlPermissions>)
    .isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  // @ts-expect-error
  activeRole: PropTypes.object,
};

export default AccessControlRoleDetail;
