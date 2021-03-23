import { InfiniteScroll } from 'grommet';
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
import Truncated from 'UI/Util/Truncated';

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
  for (const group of groups) {
    if (group === '*') return 'All';
  }

  return groups.join(', ');
}

function formatResources(resources: string[]): string {
  if (resources.length < 1) return 'All';

  for (const resource of resources) {
    if (resource === '*') return 'All';
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
        <InfiniteScroll
          scrollableAncestor='window'
          replace={true}
          items={permissions}
          step={50}
          renderMarker={(marker) => (
            <TableRow>
              <TableCell>{marker}</TableCell>
            </TableRow>
          )}
        >
          {(permission: IAccessControlRoleItemPermission, idx: number) => (
            <TableRow key={makePermissionKey(permission, idx)}>
              <TableCell size='small'>
                <Truncated numStart={10}>
                  {formatApiGroups(permission.apiGroups)}
                </Truncated>
              </TableCell>
              <TableCell size='small'>
                <Truncated numStart={10}>
                  {formatResources(permission.resources)}
                </Truncated>
              </TableCell>
              <TableCell size='small'>
                <Truncated numStart={10}>
                  {formatResources(permission.resourceNames)}
                </Truncated>
              </TableCell>
              <TableCell>
                <AccessControlRoleVerbs verbs={permission.verbs} />
              </TableCell>
            </TableRow>
          )}
        </InfiniteScroll>
      </TableBody>
    </StyledTable>
  );
};

AccessControlRolePermissions.propTypes = {
  // @ts-expect-error
  permissions: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
};

export default AccessControlRolePermissions;
