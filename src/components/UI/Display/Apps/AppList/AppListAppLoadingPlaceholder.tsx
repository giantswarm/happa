import { Box } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import * as React from 'react';
import ContentLoader from 'react-content-loader';
import styled, { useTheme } from 'styled-components';

const StyledContentLoader = styled(ContentLoader)`
  width: 100%;
`;

interface IAppListAppLoadingPlacholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const AppListAppLoadingPlacholder: React.FC<
  React.PropsWithChildren<IAppListAppLoadingPlacholderProps>
> = (props) => {
  const theme = useTheme();

  return (
    <Box
      background='background-front'
      round='xsmall'
      overflow='hidden'
      {...props}
    >
      <StyledContentLoader
        viewBox='0 10 300 200'
        speed={2}
        height={200}
        width='300'
        backgroundColor={normalizeColor('text-xweak', theme)}
        foregroundColor={normalizeColor('text-weak', theme)}
      >
        <rect x='0' y='0' width='300' height='110' />
        <rect x='20' y='130' rx='4' ry='4' width='260' height='22' />
        <rect x='20' y='165' rx='4' ry='4' width='25' height='25' />
        <rect x='55' y='165' rx='4' ry='4' width='225' height='25' />
      </StyledContentLoader>
    </Box>
  );
};

export default React.memo(AppListAppLoadingPlacholder);
