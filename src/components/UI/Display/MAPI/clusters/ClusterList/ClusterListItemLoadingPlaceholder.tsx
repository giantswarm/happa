import { Box } from 'grommet';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IClusterListItemLoadingPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterListItemLoadingPlaceholder: React.FC<IClusterListItemLoadingPlaceholderProps> = (
  props
) => {
  const theme = useTheme();

  return (
    <Box {...props}>
      <ContentLoader
        viewBox='0 0 80 15'
        speed={2}
        height={15}
        width='80'
        backgroundColor={theme.global.colors['text-xweak'].dark}
        foregroundColor={theme.global.colors['text-weak'].dark}
      >
        <rect x='0' y='0' rx='4' ry='4' width='80' height='15' />
      </ContentLoader>
    </Box>
  );
};

ClusterListItemLoadingPlaceholder.propTypes = {};

export default React.memo(ClusterListItemLoadingPlaceholder);
