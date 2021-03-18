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
  permission: IAccessControlRoleItemPermission
): string {
  const parts = [permission.apiGroup];
  parts.push(permission.resources.join(','));
  parts.push(permission.resourceNames.join(','));

  return parts.join('/');
}

function formatApiGroup(group: string): string {
  if (group === '*') {
    return 'All';
  }

  return group;
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
          <TableCell>API Group</TableCell>
          <TableCell>Resources</TableCell>
          <TableCell>Resource Names</TableCell>
          <TableCell>Verbs</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((permission) => (
          <TableRow key={makePermissionKey(permission)}>
            <TableCell width='small'>
              {formatApiGroup(permission.apiGroup)}
            </TableCell>
            <TableCell width='xsmall'>
              {formatResources(permission.resources)}
            </TableCell>
            <TableCell width='xsmall'>
              {formatResources(permission.resourceNames)}
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
