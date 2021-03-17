import { Box } from 'grommet';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

interface IAccessControlRoleLoadingPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const AccessControlRoleLoadingPlaceholder: React.FC<IAccessControlRoleLoadingPlaceholderProps> = (
  props
) => {
  const theme = useTheme();

  return (
    <Box background='background-front' round='small' {...props}>
      <ContentLoader
        viewBox='0 0 400 65'
        speed={2}
        height='65'
        width='100%'
        backgroundColor={theme.global.colors['text-xweak'].dark}
        foregroundColor={theme.global.colors['text-weak'].dark}
      >
        <rect x='18' y='12' rx='4' ry='4' width='365' height='15' />
        <rect x='18' y='38' rx='4' ry='4' width='125' height='15' />
        <rect x='158' y='38' rx='4' ry='4' width='105' height='15' />
        <rect x='278' y='38' rx='4' ry='4' width='105' height='15' />
      </ContentLoader>
    </Box>
  );
};

AccessControlRoleLoadingPlaceholder.propTypes = {};

export default React.memo(AccessControlRoleLoadingPlaceholder);
