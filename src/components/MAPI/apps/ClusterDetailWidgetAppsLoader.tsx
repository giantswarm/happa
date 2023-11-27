import { Box } from 'grommet';
import React from 'react';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';

interface IClusterDetailWidgetAppsLoaderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {}

const ClusterDetailWidgetAppsLoader: React.FC<
  IClusterDetailWidgetAppsLoaderProps
> = ({ ...props }) => {
  return (
    <ClusterDetailWidget title='Apps' {...props}>
      <Box direction='row' gap='xsmall' wrap={true} align='center'>
        <LoadingPlaceholder margin={{ vertical: 'xsmall' }} width={300} />
      </Box>
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetAppsLoader;
