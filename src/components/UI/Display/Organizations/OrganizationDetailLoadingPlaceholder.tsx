import { Box } from 'grommet';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IOrganizationDetailLoadingPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const OrganizationDetailLoadingPlaceholder: React.FC<IOrganizationDetailLoadingPlaceholderProps> = (
  props
) => {
  const theme = useTheme();

  return (
    <Box {...props}>
      <ContentLoader
        viewBox='0 0 100% 100vh'
        speed={2}
        height='100vh'
        width='100%'
        backgroundColor={theme.global.colors['text-xweak'].dark}
        foregroundColor={theme.global.colors['text-weak'].dark}
      >
        <rect x='0' y='0' rx='4' ry='4' width='100%' height='40' />
        <rect x='0' y='80' rx='4' ry='4' width='80' height='40' />
        <rect x='90' y='80' rx='4' ry='4' width='120' height='40' />
        <rect x='0' y='150' rx='4' ry='4' width='100%' height='500' />
      </ContentLoader>
    </Box>
  );
};

OrganizationDetailLoadingPlaceholder.propTypes = {};

export default React.memo(OrganizationDetailLoadingPlaceholder);
