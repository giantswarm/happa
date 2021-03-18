import { Box, Text } from 'grommet';
import * as React from 'react';

import { IAccessControlRoleItem } from './types';

interface IAccessControlRoleSubjectsProps
  extends Pick<IAccessControlRoleItem, 'groups' | 'users' | 'serviceAccounts'>,
    React.ComponentPropsWithoutRef<typeof Box> {}

const AccessControlRoleSubjects: React.FC<IAccessControlRoleSubjectsProps> = (
  props
) => {
  return (
    <Box direction='column' gap='medium' pad={{ top: 'small' }} {...props}>
      <Box>
        <Text size='medium' weight='bold'>
          <i className='fa fa-group' /> Groups
        </Text>
      </Box>
      <Box>
        <Text size='medium' weight='bold'>
          <i className='fa fa-user' /> Users
        </Text>
      </Box>
      <Box>
        <Text size='medium' weight='bold'>
          <i className='fa fa-service-account' /> Service accounts
        </Text>
      </Box>
    </Box>
  );
};

AccessControlRoleSubjects.propTypes = {};

export default AccessControlRoleSubjects;
