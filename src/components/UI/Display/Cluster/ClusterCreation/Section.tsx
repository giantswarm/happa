import styled from 'styled-components';

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacingPx * 8}px;
  &:last-child {
    margin-bottom: 0;
  }
`;

export default Section;
