import { Box } from 'grommet';
import React from 'react';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';

interface IClusterDetailWidgetVersionsLoaderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {}

const ClusterDetailWidgetVersionsLoader: React.FC<
  IClusterDetailWidgetVersionsLoaderProps
> = ({ ...props }) => {
  return (
    <ClusterDetailWidget
      title={<LoadingPlaceholder margin={{ vertical: 'xsmall' }} width={80} />}
      inline={true}
      {...props}
    >
      <Box direction='row' gap='xsmall' wrap={true} align='center'>
        <LoadingPlaceholder margin={{ vertical: 'xsmall' }} width={300} />
      </Box>
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetVersionsLoader;
