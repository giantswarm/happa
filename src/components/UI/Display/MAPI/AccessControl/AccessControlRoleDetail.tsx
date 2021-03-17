import { Box, Heading, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'shared/Tabs';
import styled from 'styled-components';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';

import AccessControlRoleType from './AccessControlRoleType';
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

interface IAccessControlRoleDetailProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  activeRole?: IAccessControlRoleItem;
}

const AccessControlRoleDetail: React.FC<IAccessControlRoleDetailProps> = ({
  activeRole,
  ...props
}) => {
  if (!activeRole) return null;

  return (
    <Box {...props}>
      <Box>
        <Heading level={4}>{activeRole.name}</Heading>
      </Box>
      <Box direction='row' wrap={true} gap='xsmall'>
        <AccessControlRoleType inCluster={activeRole.inCluster} />
        <Text>&bull;</Text>
        <Text>Managed by {activeRole.managedBy}</Text>
      </Box>
      <Box margin={{ top: 'medium' }}>
        <Tabs defaultActiveKey='2'>
          <Tab eventKey='1' title='Subjects' />
          <Tab eventKey='2' title='Permissions'>
            <StyledTable>
              <TableHeader>
                <TableRow>
                  <TableCell>API Group</TableCell>
                  <TableCell>Resources</TableCell>
                  <TableCell>Resource Names</TableCell>
                  <TableCell>Verbs</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRole.permissions.map((permission) => (
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
