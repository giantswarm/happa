import { Box, Heading, Text } from 'grommet';
import AccessControlRoleSubjects from 'MAPI/organizations/AccessControl/AccessControlRoleSubjects';
import { canBindRolesToSubjects } from 'MAPI/organizations/AccessControl/utils';
import * as React from 'react';
import styled from 'styled-components';
import { Tab, Tabs } from 'UI/Display/Tabs';

import AccessControlRoleDetailLoadingPlaceholder from './AccessControlRoleDetailLoadingPlaceholder';
import AccessControlRolePermissions from './AccessControlRolePermissions';
import AccessControlRoleType from './AccessControlRoleType';
import {
  AccessControlSubjectTypes,
  IAccessControlPermissions,
  IAccessControlRoleItem,
  IAccessControlRoleSubjectStatus,
} from './types';

const StyledTab = styled(Tab)<{ unauthorized?: boolean }>`
  :hover {
    cursor: ${({ unauthorized }) => (unauthorized ? 'not-allowed' : 'pointer')};
  }
`;

export function formatManagedBy(managedBy?: string): string {
  if (!managedBy) return 'you';

  return `Giant Swarm (${managedBy})`;
}

function getPermissionsWarning(
  canBindRoles: boolean,
  canViewClusterRoleDetails: boolean
): string {
  switch (true) {
    case !canBindRoles && !canViewClusterRoleDetails:
      return 'To edit subjects and to access cluster role details, you need additional permissions. Please talk to your administrator.';
    case !canBindRoles:
      return 'To edit subjects, you need additional permissions. Please talk to your administrator.';
    case !canViewClusterRoleDetails:
      return 'To access cluster role details, you need additional permissions. Please talk to your administrator.';
    default:
      return '';
  }
}

interface IAccessControlRoleDetailProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  namespace: string;
  permissions: IAccessControlPermissions;
  onAdd: (
    type: AccessControlSubjectTypes,
    names: string[]
  ) => Promise<IAccessControlRoleSubjectStatus[]>;
  onDelete: (type: AccessControlSubjectTypes, name: string) => Promise<void>;
  activeRole?: IAccessControlRoleItem;
  isLoading?: boolean;
}

const AccessControlRoleDetail: React.FC<IAccessControlRoleDetailProps> = ({
  namespace,
  permissions,
  activeRole,
  onAdd,
  onDelete,
  isLoading,
  ...props
}) => {
  const canBindRoles = canBindRolesToSubjects(permissions);
  const canViewClusterRoleDetails = permissions.roles[''].canList;

  return (
    <Box role='main' aria-label='Role details' {...props}>
      {isLoading && <AccessControlRoleDetailLoadingPlaceholder />}

      {!isLoading && activeRole && (
        <>
          <Box>
            <Heading level={4}>{activeRole.name}</Heading>
          </Box>
          <Box direction='row' wrap={true} gap='xsmall'>
            <AccessControlRoleType namespace={activeRole.namespace} />
            {!activeRole.displayOnly && (
              <>
                <Text margin={{ right: 'xsmall' }}>&bull;</Text>
                <Text>Managed by {formatManagedBy(activeRole.managedBy)}</Text>
              </>
            )}
          </Box>
          {activeRole.description.length > 0 && (
            <Box margin={{ top: 'small' }}>
              <Text size='small'>{activeRole.description}</Text>
            </Box>
          )}
          {(!canBindRoles || !canViewClusterRoleDetails) && (
            <Box margin={{ top: 'small' }}>
              <Text>
                <i
                  className='fa fa-ban'
                  role='presentation'
                  aria-hidden={true}
                />{' '}
                {getPermissionsWarning(canBindRoles, canViewClusterRoleDetails)}
              </Text>
            </Box>
          )}
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
              <StyledTab
                title='Permissions'
                disabled={activeRole.displayOnly}
                unauthorized={activeRole.displayOnly}
              >
                <AccessControlRolePermissions
                  permissions={activeRole.permissions}
                />
              </StyledTab>
            </Tabs>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AccessControlRoleDetail;
