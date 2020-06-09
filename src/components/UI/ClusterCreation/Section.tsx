import styled from '@emotion/styled';

const Section = styled.div`
  margin-bottom: ${({ theme }) =>
    /* eslint-disable-next-line no-magic-numbers */
    theme.spacingPx * 8}px;
  &:last-child {
    margin-bottom: 0;
  }
`;

export default Section;
