import styled from '@emotion/styled';

const HorizontalLine = styled.hr`
  margin: ${({ theme }) =>
      /* eslint-disable-next-line no-magic-numbers */
      theme.spacingPx * 8}px
    0;
`;

export default HorizontalLine;
