import styled from '@emotion/styled';

const Headline = styled.h1`
  padding-bottom: ${({ theme }) =>
    /* eslint-disable-next-line no-magic-numbers */
    theme.spacingPx * 6}px;
  border-bottom: ${({ theme }) => theme.border};
  margin-bottom: ${({ theme }) =>
    /* eslint-disable-next-line no-magic-numbers */
    theme.spacingPx * 8}px;
`;

export default Headline;
