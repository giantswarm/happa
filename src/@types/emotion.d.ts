declare module '@emotion/styled' {
  import { CreateStyled } from '@emotion/styled/types';
  import { ITheme } from 'styles';

  export * from '@emotion/styled/types';
  // eslint-disable-next-line init-declarations
  const customStyled: CreateStyled<ITheme>;
  export default customStyled;
}
