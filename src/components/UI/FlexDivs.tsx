import styled from 'styled-components';

export const FlexRow = styled.div`
  display: flex;
  margin: 0 auto;
  max-width: 650px;
`;

export const FlexColumn = styled(FlexRow)`
  justify-content: space-between;
  flex-direction: column;
`;

export const FlexWrapperDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
