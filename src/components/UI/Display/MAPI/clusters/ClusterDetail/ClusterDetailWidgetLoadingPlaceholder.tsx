import { Box } from 'grommet';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IClusterDetailWidgetLoadingPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterDetailWidgetLoadingPlaceholder: React.FC<IClusterDetailWidgetLoadingPlaceholderProps> = (
  props
) => {
  const theme = useTheme();

  return (
    <Box {...props}>
      <ContentLoader
        viewBox='0 0 100 15'
        speed={2}
        height={15}
        width='100'
        backgroundColor={theme.global.colors['text-xweak'].dark}
        foregroundColor={theme.global.colors['text-weak'].dark}
      >
        <rect x='0' y='0' rx='4' ry='4' width='100' height='15' />
      </ContentLoader>
    </Box>
  );
};

ClusterDetailWidgetLoadingPlaceholder.propTypes = {};

export default React.memo(ClusterDetailWidgetLoadingPlaceholder);
