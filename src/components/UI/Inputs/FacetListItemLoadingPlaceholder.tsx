import { Box } from 'grommet';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IFacetListItemLoadingPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const FacetListItemLoadingPlaceholder: React.FC<IFacetListItemLoadingPlaceholderProps> = (
  props
) => {
  const theme = useTheme();

  return (
    <Box {...props}>
      <ContentLoader
        viewBox='0 0 270 22'
        speed={2}
        height={22}
        width='270'
        backgroundColor={theme.global.colors['text-xweak'].dark}
        foregroundColor={theme.global.colors['text-weak'].dark}
      >
        <rect x='0' y='0' rx='4' ry='4' width='22' height='22' />
        <rect x='28' y='0' rx='4' ry='4' width='22' height='22' />
        <rect x='56' y='0' rx='4' ry='4' width='204' height='22' />
      </ContentLoader>
    </Box>
  );
};

FacetListItemLoadingPlaceholder.propTypes = {};

export default React.memo(FacetListItemLoadingPlaceholder);
