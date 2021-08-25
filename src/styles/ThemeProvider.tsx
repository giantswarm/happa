import { Grommet } from 'grommet';
import * as React from 'react';
import styled from 'styled-components';

import theme from './theme';

const AppWrapper = styled.div`
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: center;
  margin: auto;
  padding: 0px 10px;
`;

interface IThemeProviderProps
  extends React.ComponentPropsWithoutRef<typeof Grommet> {}

const ThemeProvider: React.FC<IThemeProviderProps> = ({
  children,
  ...rest
}) => {
  return (
    <Grommet {...rest}>
      <AppWrapper>{children}</AppWrapper>
    </Grommet>
  );
};

ThemeProvider.defaultProps = {
  theme,
};

export default ThemeProvider;
