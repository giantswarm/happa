import { Anchor, Box, Text } from 'grommet';
import * as docs from 'lib/docs';
import * as React from 'react';

interface IAccessControlRoleDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const AccessControlRoleDescription: React.FC<IAccessControlRoleDescriptionProps> = (
  props
) => {
  return (
    <Box {...props}>
      <Text>
        Assign users or groups to roles in order to grant permissions to the
        resources in this organization&apos;s namespace. Learn more in our{' '}
        <Anchor
          href={docs.homeURL}
          rel='noopener noreferrer'
          target='_blank'
          aria-label='Open documentation in a separate tab'
        >
          documentation
          <i
            className='fa fa-open-in-new'
            role='presentation'
            aria-hidden='true'
          />
        </Anchor>
        .
      </Text>
    </Box>
  );
};

export default AccessControlRoleDescription;
