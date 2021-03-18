import { Box, Heading, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'shared/Tabs';

import AccessControlRolePermissions from './AccessControlRolePermissions';
import AccessControlRoleSubjects from './AccessControlRoleSubjects';
import AccessControlRoleType from './AccessControlRoleType';
import { IAccessControlRoleItem } from './types';

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
        <Tabs defaultActiveKey='1'>
          <Tab eventKey='1' title='Subjects'>
            <AccessControlRoleSubjects
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
