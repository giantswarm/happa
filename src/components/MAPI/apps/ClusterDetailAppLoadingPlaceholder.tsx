import { Box } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IClusterDetailAppLoadingPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterDetailAppLoadingPlaceholder: React.FC<
  React.PropsWithChildren<IClusterDetailAppLoadingPlaceholderProps>
> = (props) => {
  const theme = useTheme();

  return (
    <Box background='background-front' round='xsmall' {...props}>
      <ContentLoader
        viewBox='0 0 300 64'
        speed={2}
        height={64}
        width='300'
        backgroundColor={normalizeColor('text-xweak', theme)}
        foregroundColor={normalizeColor('text-weak', theme)}
      >
        <rect x='12' y='13' rx='4' ry='4' width='38' height='38' />
        <rect x='64' y='16' rx='4' ry='4' width='224' height='12' />
        <rect x='64' y='35' rx='4' ry='4' width='50' height='12' />
      </ContentLoader>
    </Box>
  );
};

export default React.memo(ClusterDetailAppLoadingPlaceholder);
