import { Box } from 'grommet';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IOrganizationDetailLoadingPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const OrganizationDetailLoadingPlaceholder: React.FC<
  React.PropsWithChildren<IOrganizationDetailLoadingPlaceholderProps>
> = (props) => {
  const theme = useTheme();

  return (
    <Box {...props}>
      <ContentLoader
        viewBox='0 0 1200 700'
        speed={2}
        height='700px'
        width='100%'
        backgroundColor={theme.global.colors['text-xweak'].dark}
        foregroundColor={theme.global.colors['text-weak'].dark}
      >
        <rect x='0' y='0' rx='4' ry='4' width='100%' height='40' />
        <rect x='0' y='80' rx='4' ry='4' width='80' height='40' />
        <rect x='90' y='80' rx='4' ry='4' width='120' height='40' />
      </ContentLoader>
    </Box>
  );
};

export default React.memo(OrganizationDetailLoadingPlaceholder);
