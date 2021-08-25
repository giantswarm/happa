import { Box } from 'grommet';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IOrganizationDetailStatisticPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const OrganizationDetailStatisticPlaceholder: React.FC<IOrganizationDetailStatisticPlaceholderProps> = (
  props
) => {
  const theme = useTheme();

  return (
    <Box height='20px' round='xsmall' {...props}>
      <ContentLoader
        viewBox='0 0 80 20'
        speed={2}
        height='20px'
        width='80px'
        backgroundColor={theme.global.colors['text-xweak'].dark}
        foregroundColor={theme.global.colors['text-weak'].dark}
      >
        <rect x='0' y='0' rx='4' ry='4' width='100%' height='100%' />
      </ContentLoader>
    </Box>
  );
};

export default React.memo(OrganizationDetailStatisticPlaceholder);
