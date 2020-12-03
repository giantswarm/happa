import { Theme } from '@emotion/react';

declare module '@emotion/styled' {
  import { CreateStyled } from '@emotion/styled/types';

  export * from '@emotion/styled/types';
  // eslint-disable-next-line init-declarations
  const customStyled: CreateStyled<Theme>;
  export default customStyled;
}
