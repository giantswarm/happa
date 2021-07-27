import { Box, Text } from 'grommet';
import { Cluster } from 'MAPI/types';
import PropTypes from 'prop-types';
import React from 'react';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';

import { IClusterPropertyProps } from './patches';

interface ICreateClusterNameProps
  extends IClusterPropertyProps,
    Omit<React.ComponentPropsWithoutRef<typeof Box>, 'onChange' | 'id'> {}

const CreateClusterName: React.FC<ICreateClusterNameProps> = ({
  id,
  cluster,
  onChange,
  readOnly,
  disabled,
  ...props
}) => {
  return (
    <Box direction='row' gap='small' align='center' {...props}>
      <Text size='large' weight='bold'>
        Name
      </Text>
      <ClusterIDLabel
        clusterID={cluster.metadata.name}
        variant={ClusterIDLabelType.Name}
        aria-label={`Cluster name: ${cluster.metadata.name}`}
      />
    </Box>
  );
};

CreateClusterName.propTypes = {
  id: PropTypes.string.isRequired,
  cluster: (PropTypes.object as PropTypes.Requireable<Cluster>).isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CreateClusterName;
