import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';

interface IAccessControlRoleTypeProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  namespace?: string;
}

const AccessControlRoleType: React.FC<IAccessControlRoleTypeProps> = ({
  namespace,
  ...props
}) => {
  const inCluster = namespace!.length < 1;
  const message = inCluster ? 'Cluster role' : 'Namespaced role';

  return (
    <Box gap='xxsmall' direction='row' {...props}>
      {inCluster && (
        <Text>
          <i className='fa fa-globe' aria-label='Cluster role' />
        </Text>
      )}

      <Text>{message}</Text>
    </Box>
  );
};

AccessControlRoleType.propTypes = {
  namespace: PropTypes.string,
};

AccessControlRoleType.defaultProps = {
  namespace: '',
};

export default AccessControlRoleType;
