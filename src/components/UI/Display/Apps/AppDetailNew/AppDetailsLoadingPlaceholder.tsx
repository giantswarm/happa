import { Box } from 'grommet';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IAppDetailsLoadingPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const AppDetailsLoadingPlaceholder: React.FC<IAppDetailsLoadingPlaceholderProps> = (
  props
) => {
  const theme = useTheme();

  return (
    <Box {...props}>
      <ContentLoader
        viewBox='0 0 270 28'
        speed={2}
        height={28}
        width='270'
        backgroundColor={theme.global.colors['text-xweak'].dark}
        foregroundColor={theme.global.colors['text-weak'].dark}
      >
        <rect x='0' y='0' rx='4' ry='4' width='200' height='28' />
      </ContentLoader>
    </Box>
  );
};

AppDetailsLoadingPlaceholder.propTypes = {};

export default React.memo(AppDetailsLoadingPlaceholder);
