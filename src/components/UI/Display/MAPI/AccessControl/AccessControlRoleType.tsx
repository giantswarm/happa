import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';

interface IAccessControlRoleTypeProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  inCluster?: boolean;
}

const AccessControlRoleType: React.FC<IAccessControlRoleTypeProps> = ({
  inCluster,
  ...props
}) => {
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
  inCluster: PropTypes.bool,
};

AccessControlRoleType.defaultProps = {
  inCluster: false,
};

export default AccessControlRoleType;
