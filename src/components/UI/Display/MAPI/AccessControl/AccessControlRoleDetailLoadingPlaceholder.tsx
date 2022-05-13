import { Box } from 'grommet';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IAccessControlRoleDetailLoadingPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const AccessControlRoleDetailLoadingPlaceholder: React.FC<
  React.PropsWithChildren<IAccessControlRoleDetailLoadingPlaceholderProps>
> = (props) => {
  const theme = useTheme();

  return (
    <Box {...props}>
      <ContentLoader
        viewBox='0 0 400 70'
        speed={2}
        height={70}
        width={365}
        backgroundColor={theme.global.colors['text-xweak'].dark}
        foregroundColor={theme.global.colors['text-weak'].dark}
      >
        <rect x='0' y='10' rx='4' ry='4' width='365' height='27' />
        <rect x='0' y='55' rx='4' ry='4' width='115' height='15' />
        <circle cx='125' cy='62.5' r='1.5' />
        <rect x='135' y='55' rx='4' ry='4' width='230' height='15' />
      </ContentLoader>
    </Box>
  );
};

export default React.memo(AccessControlRoleDetailLoadingPlaceholder);
