import styled from '@emotion/styled';

import { AdditionalInputHint } from './StyledInput';

export const InstanceTypeDescription = styled(AdditionalInputHint)`
  margin: 0 0 0
    ${({ theme }) =>
      /* eslint-disable-next-line no-magic-numbers */
      theme.spacingPx * 4}px;
`;
