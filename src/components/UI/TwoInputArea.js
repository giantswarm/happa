import styled from 'styled-components';

const TwoInputArea = styled.div`
  display: flex;
`;

export const InnerTwoInputArea = styled.div`
  flex: 1;
  margin-right: 25px;

  &:last-child {
    margin-right: 0px;
  }
`;

export default TwoInputArea;
