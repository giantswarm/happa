import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';

import AccessControlRoleVerbs from './AccessControlRoleVerbs';
import {
  IAccessControlRoleItem,
  IAccessControlRoleItemPermission,
} from './types';

function makePermissionKey(
  permission: IAccessControlRoleItemPermission,
  index: number
): string {
  const parts = [];
  parts.push(permission.apiGroups.join(','));
  parts.push(permission.resources.join(','));
  parts.push(permission.resourceNames.join(','));
  parts.push(index);

  return parts.join('/');
}

function formatApiGroups(groups: string[]): string {
  if (groups.length < 1 || (groups.length === 1 && groups[0] === '*')) {
    return 'All';
  }

  return groups.join(', ');
}

function formatResources(resources: string[]): string {
  if (
    resources.length < 1 ||
    (resources.length === 1 && resources[0] === '*')
  ) {
    return 'All';
  }

  return resources.join(', ');
}

const StyledTable = styled(Table)`
  width: 100%;
`;

interface IAccessControlRolePermissionsProps
  extends Pick<IAccessControlRoleItem, 'permissions'>,
    React.ComponentPropsWithoutRef<typeof Table> {}

const AccessControlRolePermissions: React.FC<IAccessControlRolePermissionsProps> = ({
  permissions,
  ...props
}) => {
  return (
    <StyledTable {...props}>
      <TableHeader>
        <TableRow>
          <TableCell>API Groups</TableCell>
          <TableCell>Resources</TableCell>
          <TableCell>Resource Names</TableCell>
          <TableCell>Verbs</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((permission, idx) => (
          <TableRow key={makePermissionKey(permission, idx)}>
            <TableCell size='small'>
              <Box>
                <Text truncate={true}>
                  {formatApiGroups(permission.apiGroups)}
                </Text>
              </Box>
            </TableCell>
            <TableCell size='small'>
              <Box>
                <Text truncate={true}>
                  {formatResources(permission.resources)}
                </Text>
              </Box>
            </TableCell>
            <TableCell size='small'>
              <Box>
                <Text truncate={true}>
                  {formatResources(permission.resourceNames)}
                </Text>
              </Box>
            </TableCell>
            <TableCell>
              <AccessControlRoleVerbs verbs={permission.verbs} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );
};

AccessControlRolePermissions.propTypes = {
  // @ts-expect-error
  permissions: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
};

export default AccessControlRolePermissions;
