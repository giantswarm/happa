import { InfiniteScroll } from 'grommet';
import React, { ReactNode } from 'react';
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

const keepCharactersStart = 20;

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

const AllSpan = styled.span`
  font-family: Roboto, sans-serif;
`;

const StyledTable = styled(Table)`
  width: 100%;
`;

const StyledTableCell = styled(TableCell)`
  font-family: Inconsolata, monospace;
`;

function formatApiGroups(groups: string[]): ReactNode {
  for (const group of groups) {
    if (group === '*') return <AllSpan>All</AllSpan>;
  }

  return (
    <Truncated numStart={keepCharactersStart}>{groups.join(', ')}</Truncated>
  );
}

function formatResources(resources: string[]): ReactNode {
  if (resources.length < 1) return <AllSpan>All</AllSpan>;

  for (const resource of resources) {
    if (resource === '*') return <AllSpan>All</AllSpan>;
  }

  return (
    <Truncated numStart={keepCharactersStart}>{resources.join(', ')}</Truncated>
  );
}

interface IAccessControlRolePermissionsProps
  extends Pick<IAccessControlRoleItem, 'permissions'>,
    React.ComponentPropsWithoutRef<typeof Table> {}

const AccessControlRolePermissions: React.FC<IAccessControlRolePermissionsProps> =
  ({ permissions, ...props }) => {
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
                <StyledTableCell size='medium'>
                  {formatApiGroups(permission.apiGroups)}
                </StyledTableCell>
                <StyledTableCell size='medium'>
                  {formatResources(permission.resources)}
                </StyledTableCell>
                <StyledTableCell size='medium'>
                  {formatResources(permission.resourceNames)}
                </StyledTableCell>
                <TableCell size='medium'>
                  <AccessControlRoleVerbs verbs={permission.verbs} />
                </TableCell>
              </TableRow>
            )}
          </InfiniteScroll>
        </TableBody>
      </StyledTable>
    );
  };

export default AccessControlRolePermissions;
