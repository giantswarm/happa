import { Box, Text } from 'grommet';
import * as React from 'react';

interface IAccessControlRoleTypeProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  namespace?: string;
}

const AccessControlRoleType: React.FC<
  React.PropsWithChildren<IAccessControlRoleTypeProps>
> = ({ namespace, ...props }) => {
  const inCluster = namespace!.length < 1;
  const message = inCluster ? 'Cluster role' : 'Namespaced role';

  return (
    <Box gap='xxsmall' direction='row' {...props}>
      {inCluster && (
        <Text>
          <i
            className='fa fa-globe'
            aria-label='Cluster role'
            role='presentation'
          />
        </Text>
      )}

      <Text>{message}</Text>
    </Box>
  );
};

AccessControlRoleType.defaultProps = {
  namespace: '',
};

export default AccessControlRoleType;
